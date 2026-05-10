package com.example.tripplanner.application.usecase.trip;

import com.example.tripplanner.application.dto.TripResponse;
import com.example.tripplanner.application.dto.TripUpdateRequest;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.model.Trip;
import com.example.tripplanner.domain.port.TripRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateTripUseCase {

    private final TripRepository tripRepository;

    @Transactional
    public TripResponse execute(UUID tripId, TripUpdateRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new EntityNotFoundException("Trip not found: " + tripId));

        if (request.getTitle() != null) trip.setTitle(request.getTitle());
        if (request.getDestination() != null) trip.setDestination(request.getDestination());
        if (request.getStartDate() != null) trip.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) trip.setEndDate(request.getEndDate());
        if (request.getBudget() != null) trip.setBudget(request.getBudget());
        if (request.getStatus() != null) trip.setStatus(request.getStatus());
        
        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
        if (totalDays > 7) {
            throw new IllegalArgumentException("Trip duration cannot exceed 7 days");
        }
        if (totalDays <= 0) {
            throw new IllegalArgumentException("End date must be after or equal to start date");
        }

        return TripMapper.toResponse(tripRepository.save(trip));
    }
}
