package com.example.tripplanner.interfaces.controller;

import com.example.tripplanner.application.dto.*;
import com.example.tripplanner.application.mapper.SharedContentMapper;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.application.usecase.AdminManagementUseCase;
import com.example.tripplanner.domain.model.ExploreItem;
import com.example.tripplanner.domain.model.UserStatus;
import com.example.tripplanner.domain.model.ShareStatus;
import com.example.tripplanner.domain.model.SharedContent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminManagementUseCase adminService;

    // --- User Management ---

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers().stream()
                .map(TripMapper::toUserResponse)
                .toList());
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable UUID id,
            @RequestBody UserStatus status) {
        return ResponseEntity.ok(TripMapper.toUserResponse(
                adminService.updateUserStatus(id, status)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> softDeleteUser(@PathVariable UUID id) {
        adminService.softDeleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{id}/reviews")
    public ResponseEntity<List<SharedContentResponse>> getUserReviews(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getUserReviews(id).stream()
                .map(SharedContentMapper::toResponse)
                .toList());
    }

    // --- Content Moderation ---

    @GetMapping("/community/pending")
    public ResponseEntity<List<SharedContentResponse>> getPendingContent() {
        return ResponseEntity.ok(adminService.getPendingContent().stream()
                .map(SharedContentMapper::toResponse)
                .toList());
    }

    @PostMapping("/community/{id}/approve")
    public ResponseEntity<SharedContentResponse> approveContent(@PathVariable UUID id) {
        SharedContent content = adminService.moderateContent(id, ShareStatus.PUBLISHED);
        return ResponseEntity.ok(SharedContentMapper.toResponse(content));
    }

    @PostMapping("/community/{id}/reject")
    public ResponseEntity<Void> rejectContent(@PathVariable UUID id) {
        adminService.moderateContent(id, ShareStatus.REJECTED);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/community/stats")
    public ResponseEntity<ModerationStatsResponse> getModerationStats() {
        return ResponseEntity.ok(adminService.getModerationStats());
    }

    @GetMapping("/community/contributors")
    public ResponseEntity<List<ContributorResponse>> getTopContributors(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(adminService.getTopContributors(limit));
    }

    // --- AI Analytics ---

    @GetMapping("/analytics/success-rate")
    public ResponseEntity<Double> getAiSuccessRate() {
        return ResponseEntity.ok(adminService.getAiSuccessRate());
    }

    @GetMapping("/analytics/token-usage")
    public ResponseEntity<Double> getAiAverageTokenUsage() {
        return ResponseEntity.ok(adminService.getAiAverageTokenUsage());
    }

    @GetMapping("/analytics/retry-stats")
    public ResponseEntity<RetryStatsDto> getAiRetryStats() {
        return ResponseEntity.ok(adminService.getAiRetryStats());
    }

    @GetMapping("/analytics/error-distribution")
    public ResponseEntity<Map<String, Double>> getAiValidationErrorDistribution() {
        return ResponseEntity.ok(adminService.getAiValidationErrorDistribution());
    }

    // --- Explore Items (Places) Management ---

    @GetMapping("/places")
    public ResponseEntity<List<ExploreItem>> getAllPlaces() {
        return ResponseEntity.ok(adminService.getAllExploreItems());
    }

    @PutMapping("/places/{id}")
    public ResponseEntity<ExploreItem> updatePlace(@PathVariable UUID id, @RequestBody ExploreItem item) {
        return ResponseEntity.ok(adminService.updateExploreItem(id, item));
    }

    @DeleteMapping("/places/{id}")
    public ResponseEntity<Void> deletePlace(@PathVariable UUID id) {
        adminService.deleteExploreItem(id);
        return ResponseEntity.noContent().build();
    }
}
