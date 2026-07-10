package com.example.tripplanner.infrastructure.persistence.entity;

import com.example.tripplanner.domain.model.TripStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "trips", indexes = {
    @Index(name = "idx_trip_user_id",    columnList = "user_id"),
    @Index(name = "idx_trip_destination", columnList = "destination"),
    @Index(name = "idx_trip_created_at",  columnList = "created_at")
})
@SQLDelete(sql = "UPDATE trips SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class TripEntity extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private UserEntity user;

    private String title;
    private String destination;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    private BigDecimal budget;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private TripStatus status;

    /** Soft delete timestamp. NULL = active, NOT NULL = deleted. */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayNumber ASC")
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ItineraryEntity> itineraries = new ArrayList<>();

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ActivityCandidateEntity> candidates = new ArrayList<>();
}
