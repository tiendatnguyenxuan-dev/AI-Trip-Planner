package com.example.tripplanner.application.mapper;

import com.example.tripplanner.application.dto.SharedContentResponse;
import com.example.tripplanner.domain.model.SharedContent;

/**
 * Centralized mapper for SharedContent → SharedContentResponse.
 * Eliminates duplicated builder blocks across all community UseCases.
 */
public final class SharedContentMapper {

    private SharedContentMapper() {
        // Utility class — no instantiation
    }

    /**
     * Maps a domain SharedContent to its full API response DTO.
     */
    public static SharedContentResponse toResponse(SharedContent content) {
        if (content == null) return null;
        return SharedContentResponse.builder()
                .id(content.getId())
                .user(TripMapper.toUserResponse(content.getUser()))
                .type(content.getType())
                .refId(content.getRefId())
                .content(content.getContent())
                .rating(content.getRating())
                .totalRatingSum(content.getTotalRatingSum())
                .totalVotes(content.getTotalVotes())
                .imageUrls(content.getImageUrls())
                .description(content.getDescription())
                .cost(content.getCost())
                .duration(content.getDuration())
                .status(content.getStatus())
                .createdAt(content.getCreatedAt())
                .build();
    }
}
