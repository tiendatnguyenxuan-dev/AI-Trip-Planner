package com.example.tripplanner.application.service;

import com.example.tripplanner.domain.model.Activity;
import com.example.tripplanner.domain.model.Itinerary;
import com.example.tripplanner.domain.model.Trip;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.*;

@Slf4j
@Component
public class TripMergeEngine {

    /**
     * Merges partial itinerary modifications into the existing Trip entity.
     *
     * @param existingTrip The original trip entity
     * @param partialUpdate Payload containing modified day/activities from AI
     * @return List of descriptions of components that were modified
     */
    public List<String> mergePartialItinerary(Trip existingTrip, Map<String, Object> partialUpdate) {
        List<String> modifiedComponents = new ArrayList<>();
        if (existingTrip == null || partialUpdate == null) {
            return modifiedComponents;
        }

        // 1. Budget update if provided
        if (partialUpdate.containsKey("new_budget") && partialUpdate.get("new_budget") != null) {
            try {
                BigDecimal newBudget = new BigDecimal(partialUpdate.get("new_budget").toString());
                existingTrip.setBudget(newBudget);
                modifiedComponents.add("Trip Budget updated to " + newBudget);
            } catch (Exception e) {
                log.warn("Failed to parse new budget: {}", e.getMessage());
            }
        }

        // 2. Partial Day/Activity updates
        if (partialUpdate.containsKey("days") && partialUpdate.get("days") instanceof List) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> modifiedDays = (List<Map<String, Object>>) partialUpdate.get("days");

            for (Map<String, Object> dayData : modifiedDays) {
                Integer dayNum = (Integer) dayData.get("day");
                if (dayNum == null && dayData.get("day_number") != null) {
                    dayNum = Integer.parseInt(dayData.get("day_number").toString());
                }
                if (dayNum == null) continue;

                final int targetDay = dayNum;
                Optional<Itinerary> existingItin = existingTrip.getItineraries().stream()
                        .filter(i -> i.getDayNumber() != null && i.getDayNumber() == targetDay)
                        .findFirst();

                if (existingItin.isPresent()) {
                    Itinerary itin = existingItin.get();
                    if (dayData.containsKey("summary") && dayData.get("summary") != null) {
                        itin.setSummary(dayData.get("summary").toString());
                    }

                    if (dayData.containsKey("activities") && dayData.get("activities") instanceof List) {
                        @SuppressWarnings("unchecked")
                        List<Object> rawActivities = (List<Object>) dayData.get("activities");
                        List<Activity> newActivities = new ArrayList<>();

                        int order = 1;
                        for (Object actObj : rawActivities) {
                            if (actObj instanceof String) {
                                newActivities.add(Activity.builder()
                                        .itinerary(itin)
                                        .name(actObj.toString())
                                        .activityOrder(order++)
                                        .build());
                            } else if (actObj instanceof Map) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> actMap = (Map<String, Object>) actObj;
                                newActivities.add(Activity.builder()
                                        .itinerary(itin)
                                        .name(actMap.getOrDefault("name", "Hoạt động").toString())
                                        .description(actMap.get("description") != null ? actMap.get("description").toString() : null)
                                        .location(actMap.get("location") != null ? actMap.get("location").toString() : null)
                                        .activityOrder(order++)
                                        .build());
                            }
                        }
                        itin.setActivities(newActivities);
                        modifiedComponents.add("Regenerated Day " + targetDay + " (" + newActivities.size() + " activities)");
                    }
                }
            }
        }

        return modifiedComponents;
    }
}
