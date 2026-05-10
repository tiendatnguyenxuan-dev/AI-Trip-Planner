package com.example.tripplanner.interfaces.controller;

import com.example.tripplanner.application.dto.*;
import com.example.tripplanner.application.usecase.*;
import com.example.tripplanner.domain.model.ShareType;
import com.example.tripplanner.infrastructure.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/community")
@RequiredArgsConstructor
public class CommunityController {

    private final ShareContentUseCase shareContentUseCase;
    private final RateContentUseCase rateContentUseCase;
    private final GetTrendingContentUseCase getTrendingContentUseCase;
    private final AddCommentUseCase addCommentUseCase;
    private final GetCommentsUseCase getCommentsUseCase;
    private final GetExploreItemReviewsUseCase getExploreItemReviewsUseCase;

    @PostMapping(value = "/share", consumes = {"multipart/form-data"})
    public ResponseEntity<SharedContentResponse> shareContent(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("type") ShareType type,
            @RequestParam("refId") UUID refId,
            @RequestParam("content") String content,
            @RequestParam(value = "rating", required = false) Double rating,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "cost", required = false) Double cost,
            @RequestParam(value = "duration", required = false) Integer duration,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        ShareContentRequest request = new ShareContentRequest();
        request.setType(type);
        request.setRefId(refId);
        request.setContent(content);
        request.setRating(rating);
        request.setDescription(description);
        request.setCost(cost);
        request.setDuration(duration);

        return ResponseEntity.ok(shareContentUseCase.execute(principal.getId(), request, images));
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<SharedContentResponse> rateContent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody RateRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(rateContentUseCase.execute(principal.getId(), id, request));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody CommentRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(addCommentUseCase.execute(principal.getId(), id, request));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(getCommentsUseCase.execute(id));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<SharedContentResponse>> getTrending(
            @RequestParam ShareType type,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(getTrendingContentUseCase.execute(type, limit));
    }

    @GetMapping("/explore/{id}/reviews")
    public ResponseEntity<List<SharedContentResponse>> getExploreItemReviews(@PathVariable UUID id) {
        return ResponseEntity.ok(getExploreItemReviewsUseCase.execute(id));
    }
}
