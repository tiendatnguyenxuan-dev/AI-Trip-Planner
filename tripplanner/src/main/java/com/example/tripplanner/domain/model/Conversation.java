package com.example.tripplanner.domain.model;

import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {
    private UUID id;
    private UUID userId;
    private UUID tripId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<ConversationMessage> messages = new ArrayList<>();

    public void addMessage(ConversationMessage message) {
        if (this.messages == null) {
            this.messages = new ArrayList<>();
        }
        this.messages.add(message);
        this.updatedAt = LocalDateTime.now();
    }
}
