package com.example.tripplanner.infrastructure.persistence.entity;

import com.example.tripplanner.domain.model.ShareStatus;
import com.example.tripplanner.domain.model.ShareType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "shared_contents", indexes = {
    @Index(name = "idx_shared_type_status",  columnList = "type, status"),
    @Index(name = "idx_shared_user_id",      columnList = "user_id"),
    @Index(name = "idx_shared_ref_id",       columnList = "ref_id"),
    @Index(name = "idx_shared_created_at",   columnList = "created_at")
})
@SQLDelete(sql = "UPDATE shared_contents SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class SharedContentEntity extends AuditableEntity {

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
    private UUID refId;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "rating", nullable = false)
    private Double rating;

    @Column(name = "total_rating_sum", nullable = false)
    @Builder.Default
    private Double totalRatingSum = 0.0;

    @Column(name = "total_votes", nullable = false)
    @Builder.Default
    private Integer totalVotes = 0;

    @ElementCollection
    @CollectionTable(name = "shared_content_images", joinColumns = @JoinColumn(name = "shared_content_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

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

    /** Soft delete timestamp. NULL = active, NOT NULL = deleted. */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
