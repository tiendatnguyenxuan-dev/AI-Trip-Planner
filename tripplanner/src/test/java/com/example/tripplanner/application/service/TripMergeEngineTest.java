package com.example.tripplanner.application.service;

import com.example.tripplanner.domain.model.Activity;
import com.example.tripplanner.domain.model.Itinerary;
import com.example.tripplanner.domain.model.Trip;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class TripMergeEngineTest {

    private final TripMergeEngine mergeEngine = new TripMergeEngine();

    @Test
    void testMergePartialItinerary() {
        Itinerary itin1 = Itinerary.builder().dayNumber(1).summary("Day 1").activities(new ArrayList<>()).build();
        Itinerary itin2 = Itinerary.builder().dayNumber(2).summary("Day 2").activities(new ArrayList<>()).build();
        Trip trip = Trip.builder()
                .id(UUID.randomUUID())
                .destination("Đà Lạt")
                .budget(new BigDecimal(3000000))
                .itineraries(List.of(itin1, itin2))
                .build();

        Map<String, Object> day2Data = new HashMap<>();
        day2Data.put("day", 2);
        day2Data.put("summary", "Cập nhật ngày 2");
        day2Data.put("activities", List.of("Ăn sáng chay", "Thăm Thung lũng Tình Yêu"));

        Map<String, Object> partialUpdate = new HashMap<>();
        partialUpdate.put("new_budget", 4000000);
        partialUpdate.put("days", List.of(day2Data));

        List<String> modified = mergeEngine.mergePartialItinerary(trip, partialUpdate);

        assertNotNull(modified);
        assertEquals(2, modified.size());
        assertEquals(new BigDecimal(4000000), trip.getBudget());
        assertEquals("Cập nhật ngày 2", itin2.getSummary());
        assertEquals(2, itin2.getActivities().size());
        assertEquals("Ăn sáng chay", itin2.getActivities().get(0).getName());
    }
}
