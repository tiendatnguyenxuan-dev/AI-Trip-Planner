package com.example.tripplanner.application.service;

import com.example.tripplanner.domain.model.ConversationMessage;
import com.example.tripplanner.domain.model.Trip;
import com.example.tripplanner.domain.model.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class PromptContextBuilderTest {

    private final PromptContextBuilder builder = new PromptContextBuilder(new ObjectMapper());

    @Test
    void testBuildContextPayload() {
        User user = User.builder().id(UUID.randomUUID()).name("Test User").build();
        Trip trip = Trip.builder().id(UUID.randomUUID()).destination("Đà Nẵng").budget(new java.math.BigDecimal(5000000)).build();
        ConversationMessage msg = ConversationMessage.builder()
                .role("user")
                .content("Cho tôi chuyến đi Đà Nẵng")
                .build();

        Map<String, Object> payload = builder.buildContextPayload(
                List.of(msg), trip, user, "Thay đổi nhà hàng ngày 2", "REGENERATE_DAY_2"
        );

        assertNotNull(payload);
        assertEquals("Thay đổi nhà hàng ngày 2", payload.get("user_prompt"));
        assertEquals("REGENERATE_DAY_2", payload.get("modification_scope"));
        assertTrue(payload.containsKey("conversation_history"));
        assertTrue(payload.containsKey("existing_trip"));
        assertTrue(payload.containsKey("user_profile"));
    }
}
