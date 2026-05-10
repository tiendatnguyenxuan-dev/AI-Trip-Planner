package com.example.tripplanner.infrastructure.persistence.impl;

import com.example.tripplanner.domain.model.Trip;
import com.example.tripplanner.domain.port.TripRepository;
import com.example.tripplanner.infrastructure.persistence.JpaTripRepository;
import com.example.tripplanner.infrastructure.persistence.PersistenceMapper;
import com.example.tripplanner.infrastructure.persistence.TripEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class TripRepositoryImpl implements TripRepository {

    private final JpaTripRepository jpaRepository;
    private final PersistenceMapper mapper;

    @Override
    public Trip save(Trip trip) {
        TripEntity entity = mapper.toEntity(trip);
        TripEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Trip> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsById(UUID id) {
        return jpaRepository.existsById(id);
    }

    @Override
    public List<Trip> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
