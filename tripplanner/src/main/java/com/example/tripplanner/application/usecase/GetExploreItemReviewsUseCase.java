package com.example.tripplanner.application.usecase;

import com.example.tripplanner.application.dto.SharedContentResponse;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.port.SharedContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetExploreItemReviewsUseCase {

    private final SharedContentRepository sharedContentRepository;

    public List<SharedContentResponse> execute(UUID exploreItemId) {
        return sharedContentRepository.findByRefId(exploreItemId).stream()
                .map(content -> SharedContentResponse.builder()
                        .id(content.getId())
                        .user(TripMapper.toUserResponse(content.getUser()))
                        .type(content.getType())
                        .refId(content.getRefId())
                        .content(content.getContent())
                        .rating(content.getRating())
                        .totalRatingSum(content.getTotalRatingSum())
                        .totalVotes(content.getTotalVotes())
                        .description(content.getDescription())
                        .cost(content.getCost())
                        .duration(content.getDuration())
                        .imageUrl(content.getImageUrl())
                        .status(content.getStatus())
                        .createdAt(content.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
