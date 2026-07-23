package com.example.tripplanner.infrastructure.persistence.impl;

import com.example.tripplanner.domain.model.Conversation;
import com.example.tripplanner.domain.model.ConversationMessage;
import com.example.tripplanner.domain.port.ConversationRepository;
import com.example.tripplanner.infrastructure.persistence.PersistenceMapper;
import com.example.tripplanner.infrastructure.persistence.entity.ConversationEntity;
import com.example.tripplanner.infrastructure.persistence.entity.ConversationMessageEntity;
import com.example.tripplanner.infrastructure.persistence.repository.JpaConversationMessageRepository;
import com.example.tripplanner.infrastructure.persistence.repository.JpaConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ConversationRepositoryImpl implements ConversationRepository {

    private final JpaConversationRepository jpaConversationRepository;
    private final JpaConversationMessageRepository jpaMessageRepository;
    private final PersistenceMapper mapper;

    @Override
    @Transactional
    public Conversation save(Conversation conversation) {
        ConversationEntity entity = mapper.toEntity(conversation);
        ConversationEntity saved = jpaConversationRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Conversation> findById(UUID id) {
        return jpaConversationRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Conversation> findByTripId(UUID tripId) {
        return jpaConversationRepository.findByTripId(tripId).map(mapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Conversation> findByUserId(UUID userId) {
        return jpaConversationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ConversationMessage saveMessage(ConversationMessage message) {
        ConversationEntity conversationEntity = jpaConversationRepository.findById(message.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found with ID: " + message.getConversationId()));

        ConversationMessageEntity msgEntity = mapper.toEntity(message, conversationEntity);
        if (msgEntity.getTimestamp() == null) {
            msgEntity.setTimestamp(LocalDateTime.now());
        }
        ConversationMessageEntity saved = jpaMessageRepository.save(msgEntity);
        return mapper.toDomain(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationMessage> findMessagesByConversationId(UUID conversationId) {
        return jpaMessageRepository.findByConversationIdOrderByTimestampAsc(conversationId)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
