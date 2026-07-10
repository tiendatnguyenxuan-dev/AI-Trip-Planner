package com.example.tripplanner.infrastructure.persistence.repository;

import com.example.tripplanner.application.dto.community.SharedContentSummaryProjection;
import com.example.tripplanner.domain.model.ShareStatus;
import com.example.tripplanner.domain.model.ShareType;
import com.example.tripplanner.infrastructure.persistence.entity.SharedContentEntity;
import com.example.tripplanner.infrastructure.persistence.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaSharedContentRepository extends JpaRepository<SharedContentEntity, UUID> {

    /**
     * Fixed N+1: JOIN FETCH user avoids per-row user query.
     * Returns full entity — use only when user data is required.
     */
    @Query("SELECT s FROM SharedContentEntity s JOIN FETCH s.user " +
           "WHERE s.type = :type AND s.status = 'PUBLISHED' " +
           "ORDER BY s.totalVotes DESC, s.createdAt DESC")
    List<SharedContentEntity> findTopTrending(@Param("type") ShareType type, Pageable pageable);

    /**
     * Summary projection for trending — avoids loading imageUrls and content TEXT.
     */
    Page<SharedContentSummaryProjection> findProjectedByTypeAndStatus(ShareType type, ShareStatus status, Pageable pageable);

    boolean existsByUser_IdAndRefIdAndType(UUID userId, UUID refId, ShareType type);

    List<SharedContentEntity> findByRefIdOrderByCreatedAtDesc(UUID refId);

    /**
     * Admin: find by status with pagination.
     */
    Page<SharedContentEntity> findByStatusOrderByCreatedAtDesc(ShareStatus status, Pageable pageable);

    /**
     * Non-paginated variant — used by SharedContentRepositoryImpl.findByStatus().
     */
    List<SharedContentEntity> findByStatusOrderByCreatedAtDesc(ShareStatus status);

    List<SharedContentEntity> findByUser(UserEntity user);

    List<SharedContentEntity> findByUser_Id(UUID userId);

    long countByStatus(ShareStatus status);

    /**
     * Top contributors query — returns Object[] [UserEntity, count, totalVotes].
     * Using Object[] is intentional here as we aggregate across multiple columns.
     */
    @Query("SELECT s.user, COUNT(s), COALESCE(SUM(s.totalVotes), 0) FROM SharedContentEntity s " +
           "WHERE s.status = com.example.tripplanner.domain.model.ShareStatus.PUBLISHED " +
           "GROUP BY s.user " +
           "ORDER BY COALESCE(SUM(s.totalVotes), 0) DESC, COUNT(s) DESC")
    List<Object[]> findTopContributors(Pageable pageable);
}
