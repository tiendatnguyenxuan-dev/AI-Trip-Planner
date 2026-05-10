package com.example.tripplanner.application.usecase.explore;

import com.example.tripplanner.application.service.ExploreRecommendationService;
import com.example.tripplanner.domain.model.ExploreItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetRecommendedExploreItemsUseCase {

    private final ExploreRecommendationService recommendationService;

    public List<ExploreItem> execute(UUID userId) {
        return recommendationService.getRecommendations(userId);
    }
}
