package com.example.tripplanner.application.usecase.activity;

import com.example.tripplanner.application.dto.ActivityCandidateResponse;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.model.Trip;
import com.example.tripplanner.domain.port.TripRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetActivityCandidatesUseCase {

    private final TripRepository tripRepository;

    public List<ActivityCandidateResponse> execute(UUID tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new EntityNotFoundException("Trip not found: " + tripId));

        return trip.getCandidates().stream()
                .map(TripMapper::toActivityCandidateResponse)
                .collect(Collectors.toList());
    }
}
