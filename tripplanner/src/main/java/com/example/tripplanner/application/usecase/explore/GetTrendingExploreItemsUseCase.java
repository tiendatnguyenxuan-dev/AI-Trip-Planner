package com.example.tripplanner.application.usecase.explore;

import com.example.tripplanner.domain.model.ExploreItem;
import com.example.tripplanner.domain.port.ExploreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GetTrendingExploreItemsUseCase {

    private final ExploreRepository exploreRepository;

    public List<ExploreItem> execute() {
        return exploreRepository.findTrending();
    }
}
