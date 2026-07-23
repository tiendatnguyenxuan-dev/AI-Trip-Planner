package com.example.tripplanner.application.service;

import com.example.tripplanner.application.dto.chat.ChatRequest;
import com.example.tripplanner.application.dto.chat.ChatResponse;
import com.example.tripplanner.application.dto.chat.ModifyTripRequest;
import com.example.tripplanner.domain.model.Conversation;
import com.example.tripplanner.domain.model.ConversationMessage;
import com.example.tripplanner.domain.model.Trip;
import com.example.tripplanner.domain.model.User;
import com.example.tripplanner.domain.port.ConversationRepository;
import com.example.tripplanner.domain.port.TripRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiOrchestratorService {

    private final ConversationRepository conversationRepository;
    private final TripRepository tripRepository;
    private final PromptContextBuilder promptContextBuilder;
    private final TripMergeEngine tripMergeEngine;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${ai-service.url:http://localhost:8000/ai}")
    private String aiServiceUrl;

    public Conversation getOrCreateConversation(UUID userId, UUID tripId) {
        if (tripId != null) {
            Optional<Conversation> existing = conversationRepository.findByTripId(tripId);
            if (existing.isPresent()) {
                return existing.get();
            }
        }
        Conversation newConv = Conversation.builder()
                .userId(userId)
                .tripId(tripId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .messages(new ArrayList<>())
                .build();
        return conversationRepository.save(newConv);
    }

    public ChatResponse processChat(UUID userId, ChatRequest request, User userProfile) {
        // 1. Get or create conversation
        Conversation conversation = getOrCreateConversation(userId, request.getTripId());
        
        // 2. Load trip if present
        Trip trip = null;
        if (conversation.getTripId() != null) {
            trip = tripRepository.findById(conversation.getTripId()).orElse(null);
        }

        // 3. Save User Message
        ConversationMessage userMsg = ConversationMessage.builder()
                .conversationId(conversation.getId())
                .role("user")
                .content(request.getPrompt())
                .timestamp(LocalDateTime.now())
                .build();
        userMsg = conversationRepository.saveMessage(userMsg);

        // 4. Build prompt context payload
        List<ConversationMessage> history = conversationRepository.findMessagesByConversationId(conversation.getId());
        Map<String, Object> contextPayload = promptContextBuilder.buildContextPayload(
                history, trip, userProfile, request.getPrompt(), request.getModificationScope()
        );

        // 5. Call Python AI Service with WebClient resilience (timeout & retry)
        Map<String, Object> aiResponseMap = callAiServiceWithResilience("/modify-itinerary", contextPayload);

        // 6. Extract response text & partial trip update
        String assistantContent = aiResponseMap.getOrDefault("content", "Rất tiếc, tôi không thể xử lý yêu cầu lúc này.").toString();
        List<String> modifiedComponents = new ArrayList<>();

        if (trip != null && aiResponseMap.containsKey("partial_update") && aiResponseMap.get("partial_update") instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> partialUpdate = (Map<String, Object>) aiResponseMap.get("partial_update");
            modifiedComponents = tripMergeEngine.mergePartialItinerary(trip, partialUpdate);
            tripRepository.save(trip);
        }

        // 7. Save Assistant Message
        ConversationMessage assistantMsg = ConversationMessage.builder()
                .conversationId(conversation.getId())
                .role("assistant")
                .content(assistantContent)
                .timestamp(LocalDateTime.now())
                .build();
        assistantMsg = conversationRepository.saveMessage(assistantMsg);

        return ChatResponse.builder()
                .conversationId(conversation.getId())
                .tripId(conversation.getTripId())
                .message(assistantMsg)
                .trip(trip)
                .modifiedComponents(modifiedComponents)
                .build();
    }

    public ChatResponse modifyTrip(UUID userId, ModifyTripRequest request, User userProfile) {
        String prompt = String.format("Thỉnh cầu sửa đổi: %s (Ngày %s, %s)",
                request.getModificationPrompt(),
                request.getTargetDay() != null ? request.getTargetDay() : "All",
                request.getTargetCategory() != null ? request.getTargetCategory() : "ALL");

        ChatRequest chatReq = ChatRequest.builder()
                .tripId(request.getTripId())
                .prompt(prompt)
                .modificationScope(request.getTargetCategory())
                .build();

        return processChat(userId, chatReq, userProfile);
    }

    public Flux<ServerSentEvent<String>> streamChat(UUID conversationId, String prompt) {
        String url = aiServiceUrl + "/chat-stream";
        Map<String, Object> req = Map.of("prompt", prompt);

        return webClientBuilder.build().post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .retrieve()
                .bodyToFlux(String.class)
                .timeout(Duration.ofSeconds(60))
                .retryWhen(Retry.backoff(2, Duration.ofSeconds(1)))
                .map(chunk -> ServerSentEvent.<String>builder()
                        .data(chunk)
                        .build())
                .onErrorResume(ex -> {
                    log.error("Streaming error: {}", ex.getMessage());
                    return Flux.just(ServerSentEvent.<String>builder()
                            .data("[ERROR: Streaming failed]")
                            .build());
                });
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callAiServiceWithResilience(String path, Map<String, Object> payload) {
        String url = aiServiceUrl + path;
        try {
            return webClientBuilder.build().post()
                    .uri(url)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .retryWhen(Retry.backoff(2, Duration.ofSeconds(1)))
                    .block();
        } catch (Exception e) {
            log.error("Resilient AI Service call failed to {}: {}", url, e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("content", "AI Service hiện đang bận. Vui lòng thử lại sau.");
            return fallback;
        }
    }
}
