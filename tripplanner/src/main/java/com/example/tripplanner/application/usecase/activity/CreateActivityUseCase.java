package com.example.tripplanner.application.usecase.activity;

import com.example.tripplanner.application.dto.ActivityRequest;
import com.example.tripplanner.application.dto.ActivityResponse;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.model.Activity;
import com.example.tripplanner.domain.model.Itinerary;
import com.example.tripplanner.domain.port.ActivityRepository;
import com.example.tripplanner.domain.port.ItineraryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreateActivityUseCase {

    private final ItineraryRepository itineraryRepository;
    private final ActivityRepository activityRepository;

    @Transactional
    public ActivityResponse execute(UUID itineraryId, ActivityRequest request) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found: " + itineraryId));

        Activity activity = Activity.builder()
                .itinerary(itinerary)
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .cost(request.getCost())
                .activityOrder(request.getActivityOrder())
                .build();

        return TripMapper.toActivityResponse(activityRepository.save(activity));
    }
}
