package com.example.tripplanner.infrastructure.persistence.repository;

import com.example.tripplanner.infrastructure.persistence.entity.ConversationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaConversationRepository extends JpaRepository<ConversationEntity, UUID> {
    Optional<ConversationEntity> findByTripId(UUID tripId);
    List<ConversationEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
