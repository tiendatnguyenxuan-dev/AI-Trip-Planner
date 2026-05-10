package com.example.tripplanner.application.usecase;

import com.example.tripplanner.application.dto.SharedContentResponse;
import com.example.tripplanner.application.mapper.SharedContentMapper;
import com.example.tripplanner.domain.port.SharedContentRepository;
import com.example.tripplanner.domain.port.UserVoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetExploreItemReviewsUseCase {

    private final SharedContentRepository sharedContentRepository;
    private final UserVoteRepository userVoteRepository;

    public List<SharedContentResponse> execute(UUID exploreItemId, UUID currentUserId) {
        return sharedContentRepository.findByRefId(exploreItemId).stream()
                .map(content -> {
                    SharedContentResponse response = SharedContentMapper.toResponse(content);
                    
                    // Bug 1 & 2 Fix: Actively count likes from DB and check user status
                    int dbLikeCount = userVoteRepository.countBySharedContentId(content.getId());
                    response.setTotalVotes(dbLikeCount);
                    
                    if (currentUserId != null) {
                        boolean hasLiked = userVoteRepository.findByUserIdAndSharedContentId(currentUserId, content.getId()).isPresent();
                        response.setHasUpvoted(hasLiked);
                    } else {
                        response.setHasUpvoted(false);
                    }
                    
                    return response;
                })
                .collect(Collectors.toList());
    }
}
