package com.example.tripplanner.application.dto.community;

import com.example.tripplanner.domain.model.ShareStatus;
import com.example.tripplanner.domain.model.ShareType;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO Projection for SharedContent community list APIs.
 *
 * Returns only summary fields for list display — avoids loading imageUrls
 * (ElementCollection = N+1), content (TEXT), and full user associations.
 *
 * Used by: GET /api/v1/community/trending, GET /api/v1/community/explore
 */
public interface SharedContentSummaryProjection {

    UUID getId();

    ShareType getType();

    UUID getRefId();

    String getDescription();

    Double getRating();

    Integer getTotalVotes();

    ShareStatus getStatus();

    LocalDateTime getCreatedAt();
}
