package com.example.tripplanner.interfaces.controller;

import com.example.tripplanner.application.dto.ActivityRequest;
import com.example.tripplanner.application.dto.ActivityResponse;
import com.example.tripplanner.application.dto.ActivityUpdateRequest;
import com.example.tripplanner.application.usecase.activity.CreateActivityUseCase;
import com.example.tripplanner.application.usecase.activity.DeleteActivityUseCase;
import com.example.tripplanner.application.usecase.activity.UpdateActivityUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/itineraries/{itineraryId}/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final CreateActivityUseCase createActivityUseCase;
    private final UpdateActivityUseCase updateActivityUseCase;
    private final DeleteActivityUseCase deleteActivityUseCase;

    @PostMapping
    public ResponseEntity<ActivityResponse> createActivity(@PathVariable UUID itineraryId,
                                                            @Valid @RequestBody ActivityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(createActivityUseCase.execute(itineraryId, request));
    }

    @PutMapping("/{activityId}")
    public ResponseEntity<ActivityResponse> updateActivity(@PathVariable UUID itineraryId,
                                                            @PathVariable UUID activityId,
                                                            @Valid @RequestBody ActivityUpdateRequest request) {
        return ResponseEntity.ok(updateActivityUseCase.execute(activityId, request));
    }

    @DeleteMapping("/{activityId}")
    public ResponseEntity<Void> deleteActivity(@PathVariable UUID itineraryId,
                                                @PathVariable UUID activityId) {
        deleteActivityUseCase.execute(activityId);
        return ResponseEntity.noContent().build();
    }
}
