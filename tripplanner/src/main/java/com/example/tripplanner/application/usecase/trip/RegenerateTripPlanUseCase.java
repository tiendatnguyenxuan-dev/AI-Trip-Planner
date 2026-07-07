package com.example.tripplanner.application.usecase.trip;

import com.example.tripplanner.application.dto.activity.ActivityCandidateResponse;
import com.example.tripplanner.application.dto.trip.GenerateResponse;
import com.example.tripplanner.application.dto.trip.RegenerateRequest;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.application.orchestrator.AIOrchestrator;
import com.example.tripplanner.domain.model.Trip;
import com.example.tripplanner.domain.exception.TripNotFoundException;
import com.example.tripplanner.domain.model.TripStatus;
import com.example.tripplanner.domain.port.ItineraryRepository;
import com.example.tripplanner.domain.port.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegenerateTripPlanUseCase {

    private final AIOrchestrator orchestrator;
    private final TripRepository tripRepository;

    @Transactional
    public GenerateResponse execute(UUID tripId, RegenerateRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new com.example.tripplanner.domain.exception.TripNotFoundException("Trip not found"));

        trip.getItineraries().clear();
        if (trip.getCandidates() != null) trip.getCandidates().clear();

        Long aiLogId = orchestrator.orchestrateRegenerate(trip, request);

        trip.setStatus(TripStatus.SELECTING_ACTIVITIES);
        tripRepository.save(trip);

        return GenerateResponse.builder()
                .tripId(trip.getId())
                .status(TripStatus.SELECTING_ACTIVITIES)
                .aiLogId(aiLogId)
                .itineraries(trip.getItineraries().stream()
                        .map(TripMapper::toItineraryResponse)
                        .collect(Collectors.toList()))
                .candidates(trip.getCandidates().stream()
                        .map(TripMapper::toActivityCandidateResponse)
                        .collect(Collectors.toList()))
                .generatedAt(LocalDateTime.now())
                .build();
    }
}
