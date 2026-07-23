package com.example.tripplanner.application.dto.chat;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {
    private UUID conversationId;
    private UUID tripId;
    private String prompt;
    private String modificationScope; // e.g. "REGENERATE_DAY_2", "REPLACE_ACTIVITY", "EXTEND_TRIP", etc.
}
