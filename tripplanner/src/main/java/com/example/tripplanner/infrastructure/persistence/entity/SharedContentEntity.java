package com.example.tripplanner.infrastructure.persistence.entity;

import com.example.tripplanner.domain.model.ShareStatus;
import com.example.tripplanner.domain.model.ShareType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shared_contents", indexes = {
    @Index(name = "idx_shared_type_status", columnList = "type, status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedContentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ShareType type;

    @Column(name = "ref_id", nullable = false, columnDefinition = "CHAR(36)")
    private UUID refId; // Can be Trip ID or Activity ID

    @Column(columnDefinition = "TEXT")
    private String content; // JSON storing description, tips, user review

    @Column(name = "rating", nullable = false)
    private Double rating; // Current average rating

    @Column(name = "total_rating_sum", nullable = false)
    @Builder.Default
    private Double totalRatingSum = 0.0;

    @Column(name = "total_votes", nullable = false)
    @Builder.Default
    private Integer totalVotes = 0; // Number of upvotes from community
    
    @ElementCollection
    @CollectionTable(name = "shared_content_images", joinColumns = @JoinColumn(name = "shared_content_id"))
    @OrderColumn(name = "image_order")
    @Column(name = "image_url")
    @Builder.Default
    private java.util.List<String> imageUrls = new java.util.ArrayList<>();
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "cost")
    private Double cost;
    
    @Column(name = "duration")
    private Integer duration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ShareStatus status = ShareStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
