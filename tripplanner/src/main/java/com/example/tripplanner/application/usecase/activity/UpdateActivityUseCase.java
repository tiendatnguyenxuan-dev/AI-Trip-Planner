package com.example.tripplanner.application.usecase.activity;

import com.example.tripplanner.application.dto.ActivityResponse;
import com.example.tripplanner.application.dto.ActivityUpdateRequest;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.model.Activity;
import com.example.tripplanner.domain.port.ActivityRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateActivityUseCase {

    private final ActivityRepository activityRepository;

    @Transactional
    public ActivityResponse execute(UUID activityId, ActivityUpdateRequest request) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new EntityNotFoundException("Activity not found: " + activityId));

        if (request.getName() != null) activity.setName(request.getName());
        if (request.getDescription() != null) activity.setDescription(request.getDescription());
        if (request.getLocation() != null) activity.setLocation(request.getLocation());
        if (request.getStartTime() != null) activity.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) activity.setEndTime(request.getEndTime());
        if (request.getCost() != null) activity.setCost(request.getCost());
        if (request.getActivityOrder() != null) activity.setActivityOrder(request.getActivityOrder());

        return TripMapper.toActivityResponse(activityRepository.save(activity));
    }
}
