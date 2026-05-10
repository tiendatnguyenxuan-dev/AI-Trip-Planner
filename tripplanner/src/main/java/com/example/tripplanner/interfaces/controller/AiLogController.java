package com.example.tripplanner.interfaces.controller;

import com.example.tripplanner.application.dto.AiLogDetailResponse;
import com.example.tripplanner.application.dto.AiLogPageResponse;
import com.example.tripplanner.application.usecase.ai.GetAiLogDetailUseCase;
import com.example.tripplanner.application.usecase.ai.GetAiLogsByTripUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AiLogController {

    private final GetAiLogsByTripUseCase getAiLogsByTripUseCase;
    private final GetAiLogDetailUseCase getAiLogDetailUseCase;

    @GetMapping("/api/v1/trips/{tripId}/ai-logs")
    public ResponseEntity<AiLogPageResponse> getLogsByTrip(
            @PathVariable UUID tripId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(getAiLogsByTripUseCase.execute(tripId, status, page, size));
    }

    @GetMapping("/api/v1/ai-logs/{logId}")
    public ResponseEntity<AiLogDetailResponse> getLogDetail(@PathVariable Long logId) {
        return ResponseEntity.ok(getAiLogDetailUseCase.execute(logId));
    }
}
