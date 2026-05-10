package com.example.tripplanner.application.usecase.trip;

import com.example.tripplanner.application.dto.ItineraryResponse;
import com.example.tripplanner.application.dto.RegenerateRequest;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.application.orchestrator.AIOrchestrator;
import com.example.tripplanner.domain.model.Itinerary;
import com.example.tripplanner.domain.port.ItineraryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegenerateSingleDayUseCase {

    private final AIOrchestrator orchestrator;
    private final ItineraryRepository itineraryRepository;

    @Transactional
    public ItineraryResponse execute(UUID itineraryId, RegenerateRequest request) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found: " + itineraryId));

        // Clear existing activities for this day
        itinerary.getActivities().clear();

        // Regenerate activities for this single day using AI
        String feedback = request != null && request.getFeedback() != null ? request.getFeedback() : "";
        String language = request != null && request.getLanguage() != null ? request.getLanguage() : "Vietnamese";
        orchestrator.orchestrateSingleDay(itinerary, feedback, language);

        // Save and return
        Itinerary saved = itineraryRepository.save(itinerary);
        return TripMapper.toItineraryResponse(saved);
    }
}
