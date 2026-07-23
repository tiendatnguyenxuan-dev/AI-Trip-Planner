package com.example.tripplanner.application.dto.chat;

import com.example.tripplanner.domain.model.ConversationMessage;
import com.example.tripplanner.domain.model.Trip;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private UUID conversationId;
    private UUID tripId;
    private ConversationMessage message;
    private Trip trip;
    private List<String> modifiedComponents;
}
