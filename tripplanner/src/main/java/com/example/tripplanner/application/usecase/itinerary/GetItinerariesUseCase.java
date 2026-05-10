package com.example.tripplanner.application.usecase.itinerary;

import com.example.tripplanner.application.dto.ItineraryResponse;
import com.example.tripplanner.application.dto.ItineraryUpdateRequest;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.model.Itinerary;
import com.example.tripplanner.domain.port.ItineraryRepository;
import com.example.tripplanner.domain.port.TripRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetItinerariesUseCase {

    private final TripRepository tripRepository;
    private final ItineraryRepository itineraryRepository;

    public List<ItineraryResponse> execute(UUID tripId) {
        if (!tripRepository.existsById(tripId)) {
            throw new EntityNotFoundException("Trip not found: " + tripId);
        }
        return itineraryRepository.findByTripId(tripId).stream()
                .map(TripMapper::toItineraryResponse)
                .collect(Collectors.toList());
    }
}
