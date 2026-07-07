package com.example.tripplanner.application.usecase.activity;

import com.example.tripplanner.application.dto.activity.ActivityCandidateResponse;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.model.Trip;
import com.example.tripplanner.domain.exception.TripNotFoundException;
import com.example.tripplanner.domain.port.TripRepository;
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
                .orElseThrow(() -> new com.example.tripplanner.domain.exception.TripNotFoundException("Trip not found"));

        return trip.getCandidates().stream()
                .map(TripMapper::toActivityCandidateResponse)
                .collect(Collectors.toList());
    }
}
