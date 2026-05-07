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
public class SharedContent {
    private UUID id;
    private User user;
    private ShareType type;
    private UUID refId;
    private String content; // JSON or text
    private Double rating;
    @Builder.Default
    private Double totalRatingSum = 0.0;
    @Builder.Default
    private Integer totalVotes = 0;
    
    // Additional fields for Rich display
    private String imageUrl;
    private String description;
    private Double cost;
    private Integer duration;

    @Builder.Default
    private ShareStatus status = ShareStatus.PENDING;
    private LocalDateTime createdAt;
}
