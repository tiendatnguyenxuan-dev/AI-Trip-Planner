package com.example.tripplanner.infrastructure.persistence.impl;

import com.example.tripplanner.domain.model.Itinerary;
import com.example.tripplanner.domain.port.ItineraryRepository;
import com.example.tripplanner.infrastructure.persistence.ItineraryEntity;
import com.example.tripplanner.infrastructure.persistence.JpaItineraryRepository;
import com.example.tripplanner.infrastructure.persistence.PersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ItineraryRepositoryImpl implements ItineraryRepository {

    private final JpaItineraryRepository jpaRepository;
    private final PersistenceMapper mapper;

    @Override
    public Itinerary save(Itinerary itinerary) {
        // Need a reference to TripEntity for the mapping if it's new
        // For simplicity in this common save pattern:
        ItineraryEntity entity = mapper.toEntity(itinerary);
        ItineraryEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Itinerary> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<Itinerary> findByTripId(UUID tripId) {
        return jpaRepository.findByTripIdOrderByDayNumberAsc(tripId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteByTripId(UUID tripId) {
        jpaRepository.deleteActivitiesByTripId(tripId);
        jpaRepository.deleteByTripId(tripId);
    }
}
