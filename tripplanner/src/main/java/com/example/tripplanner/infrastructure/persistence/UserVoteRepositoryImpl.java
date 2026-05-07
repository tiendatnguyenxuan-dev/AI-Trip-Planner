package com.example.tripplanner.infrastructure.persistence;

import com.example.tripplanner.domain.model.UserVote;
import com.example.tripplanner.domain.port.UserVoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserVoteRepositoryImpl implements UserVoteRepository {

    private final JpaUserVoteRepository jpaUserVoteRepository;
    private final PersistenceMapper mapper;

    @Override
    public UserVote save(UserVote userVote) {
        UserVoteEntity entity = mapper.toEntity(userVote);
        UserVoteEntity saved = jpaUserVoteRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<UserVote> findByUserIdAndSharedContentId(UUID userId, UUID sharedContentId) {
        return jpaUserVoteRepository.findByUserIdAndSharedContentId(userId, sharedContentId)
                .map(mapper::toDomain);
    }
}
