package com.example.tripplanner.domain.port;

import com.example.tripplanner.domain.model.UserVote;
import java.util.Optional;
import java.util.UUID;

public interface UserVoteRepository {
    UserVote save(UserVote userVote);
    Optional<UserVote> findByUserIdAndSharedContentId(UUID userId, UUID sharedContentId);
    void delete(UserVote userVote);
}
