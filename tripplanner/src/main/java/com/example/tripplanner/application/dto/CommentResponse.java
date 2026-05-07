package com.example.tripplanner.application.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CommentResponse {
    private UUID id;
    private UUID sharedContentId;
    private UserResponse user;
    private String content;
    private LocalDateTime createdAt;
}
