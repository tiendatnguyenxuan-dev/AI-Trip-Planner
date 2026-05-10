package com.example.tripplanner.application.service;

import com.example.tripplanner.domain.model.NotificationPayload;
import com.example.tripplanner.domain.model.SharedContent;
import com.example.tripplanner.domain.model.UserVote;
import com.example.tripplanner.domain.port.SharedContentRepository;
import com.example.tripplanner.domain.port.UserVoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InteractionService {

    private final SimpMessagingTemplate messagingTemplate;
    private final SharedContentRepository sharedContentRepository;
    private final UserVoteRepository userVoteRepository;

    @Transactional
    public void processLike(UUID experienceId, UUID likerId) {
        // Fetch the experience post
        Optional<SharedContent> contentOpt = sharedContentRepository.findById(experienceId);
        if (contentOpt.isEmpty()) {
            log.warn("Experience {} not found for liking", experienceId);
            return;
        }

        SharedContent content = contentOpt.get();
        UUID ownerId = content.getUser().getId();

        // Bug 3 Fix: Strict DB Toggle Logic
        Optional<UserVote> existingVote = userVoteRepository.findByUserIdAndSharedContentId(likerId, experienceId);
        boolean isLiking = existingVote.isEmpty();

        if (isLiking) {
            UserVote newVote = UserVote.builder()
                    .userId(likerId)
                    .sharedContentId(experienceId)
                    .stars(1)
                    .createdAt(LocalDateTime.now())
                    .build();
            userVoteRepository.save(newVote);
            log.info("[Interaction] User {} LIKED experience {}", likerId, experienceId);
        } else {
            userVoteRepository.delete(existingVote.get());
            log.info("[Interaction] User {} UNLIKED experience {}", likerId, experienceId);
        }

        // Ensure changes are persisted before counting
        userVoteRepository.flush();

        // Bug 3 Fix: Always query the EXACT count from DB for broadcasting
        int exactLikeCount = userVoteRepository.countBySharedContentId(experienceId);
        
        // Update SharedContent cache/field if necessary (optional depending on persistence strategy)
        content.setTotalVotes(exactLikeCount);
        sharedContentRepository.save(content);
        
        // Dispatch Public Broadcast with exact DB count
        String publicTopic = "/topic/experiences/" + experienceId.toString();
        messagingTemplate.convertAndSend(publicTopic, Map.of("newLikeCount", exactLikeCount));
        log.info("[WebSocket] Broadcasted accurate count {} to topic {}", exactLikeCount, publicTopic);

        // Dispatch Private Notification ONLY ON LIKE
        if (isLiking && !likerId.equals(ownerId)) {
            String privateQueue = "/queue/notifications"; 
            NotificationPayload notificationPayload = NotificationPayload.builder()
                    .type("LIKE")
                    .message("Someone liked your experience post!")
                    .experienceId(experienceId)
                    .timestamp(System.currentTimeMillis())
                    .build();
            
            log.info("[WebSocket] Attempting to send private notification from {} to owner {}", likerId, ownerId);
            messagingTemplate.convertAndSendToUser(ownerId.toString(), privateQueue, notificationPayload);
            log.info("[WebSocket] Private notification SENT to owner {}", ownerId);
        } else if (likerId.equals(ownerId)) {
            log.info("[Interaction] User liked their own post, skipping private notification");
        }
    }
}
