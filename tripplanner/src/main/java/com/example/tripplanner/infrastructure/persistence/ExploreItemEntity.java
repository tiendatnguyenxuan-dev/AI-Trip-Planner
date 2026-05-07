package com.example.tripplanner.infrastructure.persistence;

import com.example.tripplanner.domain.model.ExploreType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "explore_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExploreItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    private String title;
    private String destination;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private ExploreType type;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "explore_item_tags", joinColumns = @JoinColumn(name = "explore_item_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private BigDecimal minBudget;
    private BigDecimal maxBudget;
    private Integer durationDays;
    private String thumbnailUrl;
    private Double popularityScore;

    @Column(nullable = false)
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @Version
    private Long version;
}
