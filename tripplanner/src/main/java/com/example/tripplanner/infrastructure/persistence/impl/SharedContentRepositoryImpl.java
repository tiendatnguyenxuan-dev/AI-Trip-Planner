package com.example.tripplanner.infrastructure.persistence.impl;

import com.example.tripplanner.domain.model.ShareType;
import com.example.tripplanner.domain.model.SharedContent;
import com.example.tripplanner.domain.port.SharedContentRepository;
import com.example.tripplanner.infrastructure.persistence.JpaSharedContentRepository;
import com.example.tripplanner.infrastructure.persistence.PersistenceMapper;
import com.example.tripplanner.infrastructure.persistence.SharedContentEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class SharedContentRepositoryImpl implements SharedContentRepository {

    private final JpaSharedContentRepository jpaRepository;
    private final PersistenceMapper mapper;

    @Override
    public SharedContent save(SharedContent sharedContent) {
        SharedContentEntity entity = mapper.toEntity(sharedContent);
        SharedContentEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<SharedContent> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<SharedContent> getTrending(ShareType type, int limit) {
        return jpaRepository.findTopTrending(type, PageRequest.of(0, limit))
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByUser_IdAndRefIdAndType(UUID userId, UUID refId, ShareType type) {
        return jpaRepository.existsByUser_IdAndRefIdAndType(userId, refId, type);
    }

    @Override
    public List<SharedContent> findByRefId(UUID refId) {
        return jpaRepository.findByRefIdOrderByCreatedAtDesc(refId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<SharedContent> findAllPending() {
        return findByStatus(com.example.tripplanner.domain.model.ShareStatus.PENDING);
    }

    @Override
    public List<SharedContent> findByStatus(com.example.tripplanner.domain.model.ShareStatus status) {
        return jpaRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<SharedContent> findByUserId(UUID userId) {
        return jpaRepository.findByUser_Id(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}
