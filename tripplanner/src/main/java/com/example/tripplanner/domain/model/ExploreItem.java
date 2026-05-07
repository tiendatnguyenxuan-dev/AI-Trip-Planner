package com.example.tripplanner.domain.model;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExploreItem {
    private UUID id;
    private String title;
    private String destination;
    private ExploreType type;
    private List<String> tags;
    private BigDecimal minBudget;
    private BigDecimal maxBudget;
    private Integer durationDays;
    private String thumbnailUrl;
    private Double popularityScore;
    private String description;
    @Builder.Default
    private Double averageRating = 0.0;
    @Builder.Default
    private Integer reviewCount = 0;
    private Long version;
}
