package com.example.tripplanner.application.usecase.trip;

import com.example.tripplanner.application.dto.TripResponse;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.model.Trip;
import com.example.tripplanner.domain.port.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetTripUseCase {

    private final TripRepository tripRepository;

    public TripResponse execute(UUID tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Trip not found: " + tripId));
        return TripMapper.toResponse(trip);
    }
}
