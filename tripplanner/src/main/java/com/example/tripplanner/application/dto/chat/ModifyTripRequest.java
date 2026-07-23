package com.example.tripplanner.application.dto.chat;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModifyTripRequest {
    private UUID tripId;
    private Integer targetDay;
    private String targetCategory; // "ACTIVITY", "RESTAURANT", "HOTEL", "ITINERARY_DAY", "BUDGET"
    private String targetActivityName;
    private String modificationPrompt;
}
