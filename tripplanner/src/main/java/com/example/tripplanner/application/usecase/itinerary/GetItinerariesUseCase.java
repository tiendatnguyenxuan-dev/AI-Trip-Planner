package com.example.tripplanner.application.usecase.itinerary;

import com.example.tripplanner.domain.exception.TripNotFoundException;

import com.example.tripplanner.application.dto.itinerary.ItineraryResponse;
import com.example.tripplanner.application.dto.itinerary.ItineraryUpdateRequest;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.model.Itinerary;
import com.example.tripplanner.domain.model.Trip;
import com.example.tripplanner.domain.port.ItineraryRepository;
import com.example.tripplanner.domain.port.TripRepository;
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
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new com.example.tripplanner.domain.exception.TripNotFoundException("Trip not found"));
        return itineraryRepository.findByTripId(tripId).stream()
                .map(TripMapper::toItineraryResponse)
                .collect(Collectors.toList());
    }
}
