package com.example.tripplanner.infrastructure.persistence.impl;

import com.example.tripplanner.domain.model.UserVote;
import com.example.tripplanner.domain.port.UserVoteRepository;
import com.example.tripplanner.infrastructure.persistence.JpaUserVoteRepository;
import com.example.tripplanner.infrastructure.persistence.PersistenceMapper;
import com.example.tripplanner.infrastructure.persistence.UserVoteEntity;
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

    @Override
    public void delete(UserVote userVote) {
        UserVoteEntity entity = mapper.toEntity(userVote);
        jpaUserVoteRepository.delete(entity);
    }

    @Override
    public int countBySharedContentId(UUID sharedContentId) {
        return jpaUserVoteRepository.countBySharedContentId(sharedContentId);
    }

    @Override
    public void flush() {
        jpaUserVoteRepository.flush();
    }
}
