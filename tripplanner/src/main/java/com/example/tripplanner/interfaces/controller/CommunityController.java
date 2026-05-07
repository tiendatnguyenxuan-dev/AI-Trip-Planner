package com.example.tripplanner.interfaces.controller;

import com.example.tripplanner.application.dto.*;
import com.example.tripplanner.application.usecase.*;
import com.example.tripplanner.domain.model.ShareType;
import com.example.tripplanner.infrastructure.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
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
    private final FileStorageService fileStorageService;

    @PostMapping(value = "/share", consumes = {"multipart/form-data"})
    public ResponseEntity<SharedContentResponse> shareContent(
            Principal principal,
            @RequestPart("request") ShareContentRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        UUID userId = UUID.fromString(principal.getName());
        
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.storeFile(image);
        }
        
        return ResponseEntity.ok(shareContentUseCase.execute(userId, request, imageUrl));
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<SharedContentResponse> rateContent(
            Principal principal,
            @PathVariable UUID id,
            @RequestBody RateRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(rateContentUseCase.execute(userId, id, request));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            Principal principal,
            @PathVariable UUID id,
            @RequestBody CommentRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(addCommentUseCase.execute(userId, id, request));
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
