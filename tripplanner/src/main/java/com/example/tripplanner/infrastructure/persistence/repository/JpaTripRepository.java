package com.example.tripplanner.infrastructure.persistence.repository;

import com.example.tripplanner.application.dto.trip.TripSummaryProjection;
import com.example.tripplanner.infrastructure.persistence.entity.TripEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface JpaTripRepository extends JpaRepository<TripEntity, UUID> {

    /**
     * Fixed N+1: JOIN FETCH user avoids a separate query per trip.
     * Used for internal operations where full entity is needed.
     */
    @Query("SELECT t FROM TripEntity t JOIN FETCH t.user WHERE t.user.id = :userId ORDER BY t.createdAt DESC")
    List<TripEntity> findByUserId(@Param("userId") UUID userId);

    /**
     * Paginated trip list for the user — returns full entities.
     * Prefer TripSummaryProjection overload for API responses.
     */
    @Query(value = "SELECT t FROM TripEntity t JOIN FETCH t.user WHERE t.user.id = :userId",
           countQuery = "SELECT COUNT(t) FROM TripEntity t WHERE t.user.id = :userId")
    Page<TripEntity> findPageByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * DTO Projection: returns only summary fields — avoids loading full entity
     * graph (no itineraries, no candidates). Ideal for list APIs.
     */
    Page<TripSummaryProjection> findProjectedByUserId(UUID userId, Pageable pageable);

    /**
     * Cursor pagination for Trip History.
     * Avoids OFFSET by using id > cursorId with LIMIT.
     * Client sends the last received trip ID as the cursor.
     */
    @Query("SELECT t FROM TripEntity t WHERE t.user.id = :userId AND t.id > :cursorId ORDER BY t.id ASC")
    List<TripEntity> findByUserIdAfterCursor(@Param("userId") UUID userId,
                                              @Param("cursorId") UUID cursorId,
                                              Pageable pageable);

    /**
     * First page of cursor pagination (no previous cursor).
     */
    @Query("SELECT t FROM TripEntity t WHERE t.user.id = :userId ORDER BY t.id ASC")
    List<TripEntity> findFirstPageByUserId(@Param("userId") UUID userId, Pageable pageable);
}
