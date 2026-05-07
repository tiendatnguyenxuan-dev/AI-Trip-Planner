package com.example.tripplanner.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaUserVoteRepository extends JpaRepository<UserVoteEntity, UUID> {
    Optional<UserVoteEntity> findByUserIdAndSharedContentId(UUID userId, UUID sharedContentId);
}
