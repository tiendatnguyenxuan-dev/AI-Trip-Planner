package com.example.tripplanner.application.dto.trip;

import com.example.tripplanner.domain.model.TripStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO Projection for Trip list APIs.
 *
 * Instead of loading the full TripEntity (with itineraries, candidates, user),
 * this projection fetches only the fields needed for list display.
 *
 * Reduces data transfer and avoids unnecessary joins.
 * Used by: GET /api/v1/trips (trip history list)
 */
public interface TripSummaryProjection {

    UUID getId();

    String getTitle();

    String getDestination();

    TripStatus getStatus();

    LocalDateTime getCreatedAt();
}
