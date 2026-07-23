package com.example.tripplanner.application.service;

import com.example.tripplanner.domain.model.ConversationMessage;
import com.example.tripplanner.domain.model.Trip;
import com.example.tripplanner.domain.model.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromptContextBuilder {

    private final ObjectMapper objectMapper;

    public Map<String, Object> buildContextPayload(
            List<ConversationMessage> history,
            Trip existingTrip,
            User user,
            String currentPrompt,
            String modificationScope
    ) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("user_prompt", currentPrompt);
        payload.put("modification_scope", modificationScope != null ? modificationScope : "GENERAL");

        // 1. Format conversation history
        List<Map<String, String>> historyList = new ArrayList<>();
        if (history != null) {
            int startIdx = Math.max(0, history.size() - 6); // Take last 6 turns
            for (int i = startIdx; i < history.size(); i++) {
                ConversationMessage msg = history.get(i);
                Map<String, String> m = new HashMap<>();
                m.put("role", msg.getRole());
                m.put("content", msg.getContent());
                historyList.add(m);
            }
        }
        payload.put("conversation_history", historyList);

        // 2. Format existing trip
        if (existingTrip != null) {
            Map<String, Object> tripMap = new HashMap<>();
            tripMap.put("trip_id", existingTrip.getId() != null ? existingTrip.getId().toString() : null);
            tripMap.put("destination", existingTrip.getDestination());
            tripMap.put("start_date", existingTrip.getStartDate() != null ? existingTrip.getStartDate().toString() : null);
            tripMap.put("end_date", existingTrip.getEndDate() != null ? existingTrip.getEndDate().toString() : null);
            tripMap.put("budget", existingTrip.getBudget());

            List<Map<String, Object>> itinList = new ArrayList<>();
            if (existingTrip.getItineraries() != null) {
                existingTrip.getItineraries().forEach(itin -> {
                    Map<String, Object> dayMap = new HashMap<>();
                    dayMap.put("day_number", itin.getDayNumber());
                    dayMap.put("summary", itin.getSummary());

                    List<Map<String, Object>> acts = new ArrayList<>();
                    if (itin.getActivities() != null) {
                        itin.getActivities().forEach(act -> {
                            Map<String, Object> a = new HashMap<>();
                            a.put("name", act.getName());
                            a.put("location", act.getLocation());
                            a.put("description", act.getDescription());
                            a.put("cost", act.getCost());
                            a.put("start_time", act.getStartTime() != null ? act.getStartTime().toString() : null);
                            a.put("end_time", act.getEndTime() != null ? act.getEndTime().toString() : null);
                            acts.add(a);
                        });
                    }
                    dayMap.put("activities", acts);
                    itinList.add(dayMap);
                });
            }
            tripMap.put("days", itinList);
            payload.put("existing_trip", tripMap);
        }

        // 3. Format user profile
        if (user != null) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("user_id", user.getId() != null ? user.getId().toString() : null);
            userMap.put("name", user.getName());
            payload.put("user_profile", userMap);
        }

        return payload;
    }
}
