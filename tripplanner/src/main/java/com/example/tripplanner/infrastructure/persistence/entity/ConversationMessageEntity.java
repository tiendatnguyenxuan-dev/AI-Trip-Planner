package com.example.tripplanner.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "conversation_messages", indexes = {
    @Index(name = "idx_msg_conversation_id", columnList = "conversation_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ConversationEntity conversation;

    @Column(nullable = false, length = 20)
    private String role; // "user", "assistant", "system"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
