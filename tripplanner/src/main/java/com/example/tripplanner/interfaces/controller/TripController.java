package com.example.tripplanner.interfaces.controller;

import com.example.tripplanner.application.dto.*;
import com.example.tripplanner.application.usecase.trip.*;
import com.example.tripplanner.application.usecase.activity.*;
import com.example.tripplanner.application.usecase.itinerary.*;
import com.example.tripplanner.application.usecase.explore.*;
import com.example.tripplanner.application.usecase.community.*;
import com.example.tripplanner.application.usecase.auth.*;
import com.example.tripplanner.application.usecase.ai.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
public class TripController {

    private final CreateTripUseCase createTripUseCase;
    private final GetTripUseCase getTripUseCase;
    private final GetTripsByUserUseCase getTripsByUserUseCase;
    private final UpdateTripUseCase updateTripUseCase;
    private final GenerateTripPlanUseCase generateTripPlanUseCase;
    private final RegenerateTripPlanUseCase regenerateTripPlanUseCase;
    private final GetActivityCandidatesUseCase getActivityCandidatesUseCase;
    private final FinalizeTripPlanUseCase finalizeTripPlanUseCase;

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody TripRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(createTripUseCase.execute(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TripResponse>> getTripsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(getTripsByUserUseCase.execute(userId));
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<TripResponse> getTripById(@PathVariable UUID tripId) {
        return ResponseEntity.ok(getTripUseCase.execute(tripId));
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<TripResponse> updateTrip(@PathVariable UUID tripId,
                                                    @Valid @RequestBody TripUpdateRequest request) {
        return ResponseEntity.ok(updateTripUseCase.execute(tripId, request));
    }

    @PostMapping("/{tripId}/generate")
    public ResponseEntity<GenerateResponse> generatePlan(@PathVariable UUID tripId,
                                                          @RequestBody(required = false) GenerateRequest request) {
        return ResponseEntity.ok(generateTripPlanUseCase.execute(tripId, request));
    }

    @PostMapping("/{tripId}/regenerate")
    public ResponseEntity<GenerateResponse> regeneratePlan(@PathVariable UUID tripId,
                                                            @RequestBody(required = false) RegenerateRequest request) {
        return ResponseEntity.ok(regenerateTripPlanUseCase.execute(tripId, request));
    }

    @GetMapping("/{tripId}/candidates")
    public ResponseEntity<List<ActivityCandidateResponse>> getCandidates(@PathVariable UUID tripId) {
        return ResponseEntity.ok(getActivityCandidatesUseCase.execute(tripId));
    }

    @PostMapping("/{tripId}/finalize")
    public ResponseEntity<TripResponse> finalizePlan(@PathVariable UUID tripId,
                                                       @RequestBody FinalizeTripRequest request) {
        return ResponseEntity.ok(finalizeTripPlanUseCase.execute(tripId, request));
    }
}

