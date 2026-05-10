package com.example.tripplanner.infrastructure.persistence.impl;

import com.example.tripplanner.domain.model.AiLog;
import com.example.tripplanner.domain.model.AiLogStatus;
import com.example.tripplanner.domain.port.AiLogRepository;
import com.example.tripplanner.infrastructure.persistence.AiLogEntity;
import com.example.tripplanner.infrastructure.persistence.JpaAiLogRepository;
import com.example.tripplanner.infrastructure.persistence.PersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AiLogRepositoryImpl implements AiLogRepository {

    private final JpaAiLogRepository jpaRepository;
    private final PersistenceMapper mapper;

    @Override
    public AiLog save(AiLog aiLog) {
        AiLogEntity entity = mapper.toEntity(aiLog);
        AiLogEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<AiLog> findById(Long id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Page<AiLog> findByTripId(String tripId, Pageable pageable) {
        return jpaRepository.findByTripId(tripId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<AiLog> findByTripIdAndStatus(String tripId, AiLogStatus status, Pageable pageable) {
        return jpaRepository.findByTripIdAndStatus(tripId, status, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public long countTotal() {
        return jpaRepository.count();
    }

    @Override
    public long countByStatus(AiLogStatus status) {
        return jpaRepository.countByStatus(status);
    }

    @Override
    public Double getAverageTotalTokens() {
        return jpaRepository.getAverageTotalTokens();
    }

    @Override
    public long countByRetryCountGreaterThan(int retryCount) {
        return jpaRepository.countByRetryCountGreaterThan(retryCount);
    }

    @Override
    public Double getAverageRetryCount() {
        return jpaRepository.getAverageRetryCount();
    }

    @Override
    public Map<String, Long> getValidationErrorCounts() {
        List<Object[]> results = jpaRepository.countByValidationType();
        Map<String, Long> map = new HashMap<>();
        for (Object[] result : results) {
            String type = result[0].toString();
            Long count = ((Number) result[1]).longValue();
            map.put(type, count);
        }
        return map;
    }
}
