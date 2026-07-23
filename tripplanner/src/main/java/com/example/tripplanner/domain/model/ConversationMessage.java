package com.example.tripplanner.domain.model;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationMessage {
    private UUID id;
    private UUID conversationId;
    private String role; // "user", "assistant", "system"
    private String content;
    private String metadataJson; // Scope, modification details, token usage
    private LocalDateTime timestamp;
}
