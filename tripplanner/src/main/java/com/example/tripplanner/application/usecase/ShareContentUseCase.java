package com.example.tripplanner.application.usecase;

import com.example.tripplanner.application.dto.ShareContentRequest;
import com.example.tripplanner.application.dto.SharedContentResponse;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.exception.AlreadyReviewedException;
import com.example.tripplanner.domain.model.*;
import com.example.tripplanner.domain.port.ActivityRepository;
import com.example.tripplanner.domain.port.ExploreRepository;
import com.example.tripplanner.domain.port.SharedContentRepository;
import com.example.tripplanner.domain.port.TripRepository;
import com.example.tripplanner.domain.port.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShareContentUseCase {

    private final SharedContentRepository sharedContentRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final TripRepository tripRepository;
    private final ExploreRepository exploreRepository;

    @Transactional
    public SharedContentResponse execute(UUID userId, ShareContentRequest request, String imageUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
                .imageUrl(imageUrl)
                .status(ShareStatus.PUBLISHED)
                .build();

        SharedContent saved = sharedContentRepository.save(content);

        return SharedContentResponse.builder()
                .id(saved.getId())
                .user(TripMapper.toUserResponse(saved.getUser()))
                .type(saved.getType())
                .refId(saved.getRefId())
                .content(saved.getContent())
                .rating(saved.getRating())
                .totalRatingSum(saved.getTotalRatingSum())
                .totalVotes(saved.getTotalVotes())
                .description(saved.getDescription())
                .cost(saved.getCost())
                .duration(saved.getDuration())
                .imageUrl(saved.getImageUrl())
                .status(saved.getStatus())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
