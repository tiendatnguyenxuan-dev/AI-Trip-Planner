package com.example.tripplanner.application.usecase.itinerary;

import com.example.tripplanner.application.dto.ItineraryResponse;
import com.example.tripplanner.application.dto.ItineraryUpdateRequest;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.model.Itinerary;
import com.example.tripplanner.domain.port.ItineraryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateItineraryUseCase {

    private final ItineraryRepository itineraryRepository;

    @Transactional
    public ItineraryResponse execute(UUID itineraryId, ItineraryUpdateRequest request) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found: " + itineraryId));

        if (request.getSummary() != null) itinerary.setSummary(request.getSummary());

        return TripMapper.toItineraryResponse(itineraryRepository.save(itinerary));
    }
}
