package com.example.tripplanner.interfaces.controller;

import com.example.tripplanner.application.dto.ItineraryResponse;
import com.example.tripplanner.application.dto.ItineraryUpdateRequest;
import com.example.tripplanner.application.dto.RegenerateRequest;
import com.example.tripplanner.application.usecase.itinerary.GetItinerariesUseCase;
import com.example.tripplanner.application.usecase.trip.RegenerateSingleDayUseCase;
import com.example.tripplanner.application.usecase.itinerary.UpdateItineraryUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
public class ItineraryController {

    private final GetItinerariesUseCase getItinerariesUseCase;
    private final UpdateItineraryUseCase updateItineraryUseCase;
    private final RegenerateSingleDayUseCase regenerateSingleDayUseCase;

    @GetMapping("/{tripId}/itineraries")
    public ResponseEntity<List<ItineraryResponse>> getItineraries(@PathVariable UUID tripId) {
        return ResponseEntity.ok(getItinerariesUseCase.execute(tripId));
    }

    @PutMapping("/{tripId}/itineraries/{itineraryId}")
    public ResponseEntity<ItineraryResponse> updateItinerary(@PathVariable UUID tripId,
                                                              @PathVariable UUID itineraryId,
                                                              @Valid @RequestBody ItineraryUpdateRequest request) {
        return ResponseEntity.ok(updateItineraryUseCase.execute(itineraryId, request));
    }

    @PostMapping("/{tripId}/itineraries/{itineraryId}/regenerate")
    public ResponseEntity<ItineraryResponse> regenerateDay(@PathVariable UUID tripId,
                                                            @PathVariable UUID itineraryId,
                                                            @RequestBody(required = false) RegenerateRequest request) {
        return ResponseEntity.ok(regenerateSingleDayUseCase.execute(itineraryId, request));
    }
}
