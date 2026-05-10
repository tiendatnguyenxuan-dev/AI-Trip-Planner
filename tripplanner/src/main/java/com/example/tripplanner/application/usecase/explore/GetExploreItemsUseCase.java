package com.example.tripplanner.application.usecase.explore;

import com.example.tripplanner.domain.model.ExploreItem;
import com.example.tripplanner.domain.port.ExploreRepository;
import com.example.tripplanner.domain.port.UserVoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GetExploreItemsUseCase {

    private final ExploreRepository exploreRepository;
    private final UserVoteRepository userVoteRepository;

    public Page<ExploreItem> execute(String destination, BigDecimal minBudget, BigDecimal maxBudget, Integer durationDays, List<String> tags, Pageable pageable, java.util.UUID currentUserId) {
        Page<ExploreItem> items = exploreRepository.findAll(destination, minBudget, maxBudget, durationDays, tags, pageable);
        
        if (currentUserId != null) {
            items.forEach(item -> {
                item.setHasUpvoted(userVoteRepository.findByUserIdAndExploreItemId(currentUserId, item.getId()).isPresent());
            });
        }
        
        return items;
    }
}
