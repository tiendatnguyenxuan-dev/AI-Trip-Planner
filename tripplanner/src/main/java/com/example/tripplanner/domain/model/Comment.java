package com.example.tripplanner.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
    private UUID id;
    private UUID sharedContentId;
    private User user;
    private String content;
    private LocalDateTime createdAt;
}
