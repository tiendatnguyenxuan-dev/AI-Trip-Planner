package com.example.tripplanner.application.dto.itinerary;

import lombok.Data;
import java.util.List;

/**
 * Payload sent by the frontend to import an AI-generated itinerary
 * directly into the database (bypassing the backend AI orchestrator).
 */
@Data
public class ImportItineraryRequest {

    private List<DayDto> days;

    @Data
    public static class DayDto {
        private int dayNumber;
        private String summary;
        private List<ActivityDto> activities;
    }

    @Data
    public static class ActivityDto {
        private String name;
        private String description;
        private String location;
        private String startTime;   // "HH:mm"
        private String endTime;     // "HH:mm"
        private Double cost;
    }
}
