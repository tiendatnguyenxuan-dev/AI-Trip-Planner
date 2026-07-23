package com.example.tripplanner.interfaces.controller;

import com.example.tripplanner.application.dto.chat.ChatRequest;
import com.example.tripplanner.application.dto.chat.ChatResponse;
import com.example.tripplanner.application.dto.chat.ModifyTripRequest;
import com.example.tripplanner.application.service.AiOrchestratorService;
import com.example.tripplanner.domain.model.Conversation;
import com.example.tripplanner.domain.model.ConversationMessage;
import com.example.tripplanner.domain.model.User;
import com.example.tripplanner.domain.port.ConversationRepository;
import com.example.tripplanner.infrastructure.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ChatController {

    private final AiOrchestratorService orchestratorService;
    private final ConversationRepository conversationRepository;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> createMessage(
            @RequestBody ChatRequest request,
            Authentication auth
    ) {
        User user = extractUser(auth);
        UUID userId = user != null ? user.getId() : UUID.randomUUID();
        ChatResponse response = orchestratorService.processChat(userId, request, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat/{conversationId}/continue")
    public ResponseEntity<ChatResponse> continueConversation(
            @PathVariable UUID conversationId,
            @RequestBody ChatRequest request,
            Authentication auth
    ) {
        request.setConversationId(conversationId);
        User user = extractUser(auth);
        UUID userId = user != null ? user.getId() : UUID.randomUUID();
        ChatResponse response = orchestratorService.processChat(userId, request, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/trips/{tripId}/modify")
    public ResponseEntity<ChatResponse> modifyTrip(
            @PathVariable UUID tripId,
            @RequestBody ModifyTripRequest request,
            Authentication auth
    ) {
        request.setTripId(tripId);
        User user = extractUser(auth);
        UUID userId = user != null ? user.getId() : UUID.randomUUID();
        ChatResponse response = orchestratorService.modifyTrip(userId, request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chat/{conversationId}")
    public ResponseEntity<Conversation> getConversation(@PathVariable UUID conversationId) {
        return conversationRepository.findById(conversationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/chat/{conversationId}/messages")
    public ResponseEntity<List<ConversationMessage>> getMessages(@PathVariable UUID conversationId) {
        List<ConversationMessage> messages = conversationRepository.findMessagesByConversationId(conversationId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping(value = "/chat/{conversationId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamChat(
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "") String prompt
    ) {
        return orchestratorService.streamChat(conversationId, prompt);
    }

    private User extractUser(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            return User.builder()
                    .id(principal.getId())
                    .email(principal.getEmail())
                    .name(principal.getUsername())
                    .build();
        }
        return null;
    }
}
