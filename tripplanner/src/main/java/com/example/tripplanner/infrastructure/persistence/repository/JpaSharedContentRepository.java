package com.example.tripplanner.infrastructure.persistence.repository;
import com.example.tripplanner.infrastructure.persistence.entity.UserEntity;
import com.example.tripplanner.infrastructure.persistence.entity.SharedContentEntity;

import com.example.tripplanner.domain.model.ShareType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaSharedContentRepository extends JpaRepository<SharedContentEntity, UUID> {
    
    @Query("SELECT s FROM SharedContentEntity s WHERE s.type = :type AND s.status = 'PUBLISHED' ORDER BY s.totalVotes DESC, s.createdAt DESC")
    List<SharedContentEntity> findTopTrending(ShareType type, Pageable pageable);

    boolean existsByUser_IdAndRefIdAndType(UUID userId, UUID refId, ShareType type);

    List<SharedContentEntity> findByRefIdOrderByCreatedAtDesc(UUID refId);
    List<SharedContentEntity> findByStatusOrderByCreatedAtDesc(com.example.tripplanner.domain.model.ShareStatus status);

    List<SharedContentEntity> findByUser(UserEntity user);
    List<SharedContentEntity> findByUser_Id(UUID userId);

    long countByStatus(com.example.tripplanner.domain.model.ShareStatus status);

    @Query("SELECT s.user, COUNT(s), COALESCE(SUM(s.totalVotes), 0) FROM SharedContentEntity s " +
           "WHERE s.status = com.example.tripplanner.domain.model.ShareStatus.PUBLISHED " +
           "GROUP BY s.user " +
           "ORDER BY COALESCE(SUM(s.totalVotes), 0) DESC, COUNT(s) DESC")
    List<Object[]> findTopContributors(Pageable pageable);
}

