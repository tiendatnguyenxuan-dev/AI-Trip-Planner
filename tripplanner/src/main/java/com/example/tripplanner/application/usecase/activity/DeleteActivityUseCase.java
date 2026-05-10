package com.example.tripplanner.application.usecase.activity;

import com.example.tripplanner.domain.port.ActivityRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeleteActivityUseCase {

    private final ActivityRepository activityRepository;

    @Transactional
    public void execute(UUID activityId) {
        if (!activityRepository.existsById(activityId)) {
            throw new EntityNotFoundException("Activity not found: " + activityId);
        }
        activityRepository.deleteById(activityId);
    }
}
