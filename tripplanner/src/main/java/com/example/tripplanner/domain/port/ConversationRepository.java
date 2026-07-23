package com.example.tripplanner.domain.port;

import com.example.tripplanner.domain.model.Conversation;
import com.example.tripplanner.domain.model.ConversationMessage;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository {
    Conversation save(Conversation conversation);
    Optional<Conversation> findById(UUID id);
    Optional<Conversation> findByTripId(UUID tripId);
    List<Conversation> findByUserId(UUID userId);
    ConversationMessage saveMessage(ConversationMessage message);
    List<ConversationMessage> findMessagesByConversationId(UUID conversationId);
}
