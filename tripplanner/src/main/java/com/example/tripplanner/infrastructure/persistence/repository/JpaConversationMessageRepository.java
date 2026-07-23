package com.example.tripplanner.infrastructure.persistence.repository;

import com.example.tripplanner.infrastructure.persistence.entity.ConversationMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaConversationMessageRepository extends JpaRepository<ConversationMessageEntity, UUID> {
    List<ConversationMessageEntity> findByConversationIdOrderByTimestampAsc(UUID conversationId);
}
