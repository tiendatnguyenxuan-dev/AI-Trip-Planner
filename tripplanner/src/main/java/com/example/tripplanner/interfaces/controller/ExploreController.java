package com.example.tripplanner.interfaces.controller;

import com.example.tripplanner.application.usecase.explore.GetExploreItemByIdUseCase;
import com.example.tripplanner.application.usecase.explore.GetExploreItemsUseCase;
import com.example.tripplanner.application.usecase.explore.GetRecommendedExploreItemsUseCase;
import com.example.tripplanner.application.usecase.explore.GetTrendingExploreItemsUseCase;
import com.example.tripplanner.domain.model.ExploreItem;
import com.example.tripplanner.infrastructure.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/explore")
@RequiredArgsConstructor
public class ExploreController {

    private final GetExploreItemsUseCase getExploreItemsUseCase;
    private final GetExploreItemByIdUseCase getExploreItemByIdUseCase;
    private final GetTrendingExploreItemsUseCase getTrendingExploreItemsUseCase;
    private final GetRecommendedExploreItemsUseCase getRecommendedExploreItemsUseCase;

    @GetMapping
    public ResponseEntity<Page<ExploreItem>> getExploreItems(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) BigDecimal minBudget,
            @RequestParam(required = false) BigDecimal maxBudget,
            @RequestParam(required = false) Integer durationDays,
            @RequestParam(required = false) List<String> tags,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        java.util.UUID userId = (userPrincipal != null) ? userPrincipal.getId() : null;
        return ResponseEntity.ok(getExploreItemsUseCase.execute(destination, minBudget, maxBudget, durationDays, tags, pageable, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExploreItem> getExploreItemById(
            @PathVariable java.util.UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        java.util.UUID userId = (userPrincipal != null) ? userPrincipal.getId() : null;
        return ResponseEntity.ok(getExploreItemByIdUseCase.execute(id, userId));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<ExploreItem>> getTrendingItems() {
        return ResponseEntity.ok(getTrendingExploreItemsUseCase.execute());
    }

    @GetMapping("/recommendation")
    public ResponseEntity<List<ExploreItem>> getRecommendedItems(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(getRecommendedExploreItemsUseCase.execute(userPrincipal.getId()));
    }
}
