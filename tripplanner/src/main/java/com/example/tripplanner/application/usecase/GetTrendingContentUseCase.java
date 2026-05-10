package com.example.tripplanner.application.usecase;

import com.example.tripplanner.application.dto.SharedContentResponse;
import com.example.tripplanner.application.mapper.SharedContentMapper;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.model.ShareType;
import com.example.tripplanner.domain.model.SharedContent;
import com.example.tripplanner.domain.port.ActivityRepository;
import com.example.tripplanner.domain.port.SharedContentRepository;
import com.example.tripplanner.domain.port.TripRepository;
import com.example.tripplanner.domain.port.UserVoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetTrendingContentUseCase {

    private final SharedContentRepository sharedContentRepository;
    private final ActivityRepository activityRepository;
    private final TripRepository tripRepository;
    private final UserVoteRepository userVoteRepository;

    @Transactional(readOnly = true)
    public List<SharedContentResponse> execute(ShareType type, int limit, UUID currentUserId) {
        return sharedContentRepository.getTrending(type, limit).stream()
                .map(content -> buildResponse(content, currentUserId))
                .collect(Collectors.toList());
    }

    private SharedContentResponse buildResponse(SharedContent content, UUID currentUserId) {
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

        // Enrich with reference data
        if (content.getType() == ShareType.ACTIVITY) {
            activityRepository.findById(content.getRefId()).ifPresent(act -> {
                response.setReferenceData(TripMapper.toActivityResponse(act));
            });
        } else if (content.getType() == ShareType.TRIP) {
            tripRepository.findById(content.getRefId()).ifPresent(trip -> {
                response.setReferenceData(TripMapper.toResponse(trip));
            });
        }

        return response;
    }
}
