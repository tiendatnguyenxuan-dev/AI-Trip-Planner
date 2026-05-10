package com.example.tripplanner.application.usecase;

import com.example.tripplanner.application.dto.ShareContentRequest;
import com.example.tripplanner.application.dto.SharedContentResponse;
import com.example.tripplanner.application.mapper.SharedContentMapper;
import com.example.tripplanner.domain.exception.AlreadyReviewedException;
import com.example.tripplanner.domain.model.*;
import com.example.tripplanner.domain.port.ActivityRepository;
import com.example.tripplanner.domain.port.ExploreRepository;
import com.example.tripplanner.domain.port.SharedContentRepository;
import com.example.tripplanner.domain.port.TripRepository;
import com.example.tripplanner.domain.port.UserRepository;
import com.example.tripplanner.infrastructure.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShareContentUseCase {

    private final SharedContentRepository sharedContentRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final TripRepository tripRepository;
    private final ExploreRepository exploreRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public SharedContentResponse execute(UUID userId, ShareContentRequest request, List<MultipartFile> images) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Store files and get URLs
        List<String> imageUrls = java.util.Collections.emptyList();
        if (images != null && !images.isEmpty()) {
            imageUrls = images.stream()
                    .map(fileStorageService::storeFile)
                    .filter(url -> url != null && !url.isEmpty())
                    .collect(Collectors.toList());
        }

        double newRating = request.getRating() != null ? request.getRating() : 0.0;

        if (request.getType() == ShareType.ACTIVITY) {
            Activity activity = activityRepository.findById(request.getRefId())
                    .orElseThrow(() -> new RuntimeException("Activity not found"));
        } else if (request.getType() == ShareType.TRIP) {
            Trip trip = tripRepository.findById(request.getRefId())
                    .orElseThrow(() -> new RuntimeException("Trip not found"));
            if (!trip.getUser().getId().equals(userId)) {
                throw new RuntimeException("Trip does not belong to user");
            }
        } else if (request.getType() == ShareType.EXPLORE_ITEM) {
            ExploreItem exploreItem = exploreRepository.findById(request.getRefId())
                    .orElseThrow(() -> new RuntimeException("Explore item not found"));

            // Check for duplicate reviews
            boolean alreadyReviewed = sharedContentRepository.existsByUser_IdAndRefIdAndType(userId, request.getRefId(),
                    ShareType.EXPLORE_ITEM);
            if (alreadyReviewed) {
                throw new AlreadyReviewedException("Bạn đã đánh giá địa điểm này rồi.");
            }

            // Calculate new rating
            int oldCount = exploreItem.getReviewCount() != null ? exploreItem.getReviewCount() : 0;
            double oldAvg = exploreItem.getAverageRating() != null ? exploreItem.getAverageRating() : 0.0;
            double newAvg = ((oldAvg * oldCount) + newRating) / (oldCount + 1);

            exploreItem.setReviewCount(oldCount + 1);
            exploreItem.setAverageRating(newAvg);
            exploreRepository.save(exploreItem);
        }

        SharedContent content = SharedContent.builder()
                .user(user)
                .type(request.getType())
                .refId(request.getRefId())
                .content(request.getContent())
                .rating(newRating)
                .totalRatingSum(newRating)
                .totalVotes(1) // Initial vote is from the sharer
                .description(request.getDescription())
                .cost(request.getCost())
                .duration(request.getDuration())
                .imageUrls(imageUrls)
                .status(ShareStatus.PUBLISHED)
                .build();

        SharedContent saved = sharedContentRepository.save(content);

        return SharedContentMapper.toResponse(saved);
    }
}
