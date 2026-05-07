package com.example.tripplanner.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "shared_content_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserVoteEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "shared_content_id", nullable = false)
    private UUID sharedContentId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private Integer stars; // 1 to 5

    @CreationTimestamp
    private LocalDateTime createdAt;
}
