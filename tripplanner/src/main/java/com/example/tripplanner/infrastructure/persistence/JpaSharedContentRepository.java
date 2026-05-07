package com.example.tripplanner.infrastructure.persistence;

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
}
