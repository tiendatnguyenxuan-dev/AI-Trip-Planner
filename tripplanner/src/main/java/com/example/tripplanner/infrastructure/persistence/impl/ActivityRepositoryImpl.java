package com.example.tripplanner.infrastructure.persistence.impl;

import com.example.tripplanner.domain.model.Activity;
import com.example.tripplanner.domain.port.ActivityRepository;
import com.example.tripplanner.infrastructure.persistence.ActivityEntity;
import com.example.tripplanner.infrastructure.persistence.JpaActivityRepository;
import com.example.tripplanner.infrastructure.persistence.PersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ActivityRepositoryImpl implements ActivityRepository {

    private final JpaActivityRepository jpaRepository;
    private final PersistenceMapper mapper;

    @Override
    public Activity save(Activity activity) {
        ActivityEntity entity = mapper.toEntity(activity);
        ActivityEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Activity> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public boolean existsById(UUID id) {
        return jpaRepository.existsById(id);
    }
}
