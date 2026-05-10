package com.example.tripplanner.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPayload {
    private String type; // e.g., "LIKE", "COMMENT"
    private String message;
    private UUID experienceId;
    private Long timestamp;
}
