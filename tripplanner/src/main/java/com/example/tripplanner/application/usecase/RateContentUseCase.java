package com.example.tripplanner.application.usecase;

import com.example.tripplanner.application.dto.RateRequest;
import com.example.tripplanner.application.dto.SharedContentResponse;
import com.example.tripplanner.application.mapper.SharedContentMapper;
import com.example.tripplanner.domain.model.SharedContent;
import com.example.tripplanner.domain.model.UserVote;
import com.example.tripplanner.domain.port.SharedContentRepository;
import com.example.tripplanner.domain.port.UserVoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RateContentUseCase {

    private final SharedContentRepository sharedContentRepository;
    private final UserVoteRepository userVoteRepository;

    @Transactional
    public SharedContentResponse execute(UUID userId, UUID contentId, RateRequest request) {
        SharedContent content = sharedContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Shared content not found"));

        if (request.getStars() < 0 || request.getStars() > 5) {
            throw new RuntimeException("Stars must be between 0 and 5");
        }

        Optional<UserVote> existingVoteOpt = userVoteRepository.findByUserIdAndSharedContentId(userId, contentId);

        if (request.getStars() == 0) {
            if (existingVoteOpt.isPresent()) {
                UserVote existingVote = existingVoteOpt.get();
                content.setTotalRatingSum(content.getTotalRatingSum() - existingVote.getStars());
                content.setTotalVotes(content.getTotalVotes() - 1);
                userVoteRepository.delete(existingVote);
                
                if (content.getTotalVotes() > 0) {
                    content.setRating(content.getTotalRatingSum() / content.getTotalVotes());
                } else {
                    content.setRating(0.0);
                }
                SharedContent saved = sharedContentRepository.save(content);
                return SharedContentMapper.toResponse(saved);
            }
            return SharedContentMapper.toResponse(content);
        }

        if (existingVoteOpt.isPresent()) {
            UserVote existingVote = existingVoteOpt.get();
            // Subtract old stars, add new stars
            content.setTotalRatingSum(content.getTotalRatingSum() - existingVote.getStars() + request.getStars());
            
            existingVote.setStars(request.getStars());
            userVoteRepository.save(existingVote);
        } else {
            // New vote
            UserVote newVote = UserVote.builder()
                    .userId(userId)
                    .sharedContentId(contentId)
                    .stars(request.getStars())
                    .build();
            userVoteRepository.save(newVote);

            content.setTotalRatingSum(content.getTotalRatingSum() + request.getStars());
            content.setTotalVotes(content.getTotalVotes() + 1);
        }

        // Calculate new average rating
        if (content.getTotalVotes() > 0) {
            content.setRating(content.getTotalRatingSum() / content.getTotalVotes());
        }

        SharedContent saved = sharedContentRepository.save(content);

        return SharedContentMapper.toResponse(saved);
    }
}
