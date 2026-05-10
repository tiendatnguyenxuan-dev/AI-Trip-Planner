package com.example.tripplanner.application.usecase.explore;

import com.example.tripplanner.domain.model.ExploreItem;
import com.example.tripplanner.domain.port.ExploreRepository;
import com.example.tripplanner.domain.port.UserVoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetExploreItemByIdUseCase {

    private final ExploreRepository exploreRepository;
    private final UserVoteRepository userVoteRepository;

    public ExploreItem execute(UUID id, UUID currentUserId) {
        ExploreItem item = exploreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Explore item not found"));
        
        if (currentUserId != null) {
            item.setHasUpvoted(userVoteRepository.findByUserIdAndExploreItemId(currentUserId, id).isPresent());
        }
        
        return item;
    }
}
