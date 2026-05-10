package com.example.tripplanner.application.usecase.trip;

import com.example.tripplanner.application.dto.FinalizeTripRequest;
import com.example.tripplanner.application.dto.TripResponse;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.model.*;
import com.example.tripplanner.domain.port.TripRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinalizeTripPlanUseCase {

    private final TripRepository tripRepository;

    @Transactional
    public TripResponse execute(UUID tripId, FinalizeTripRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new EntityNotFoundException("Trip not found: " + tripId));

        // 1. Filter and mark selected candidates
        List<ActivityCandidate> selectedCandidates = trip.getCandidates().stream()
                .filter(c -> request.getActivityIds().contains(c.getId()))
                .peek(c -> c.setSelected(true))
                .toList();

        if (selectedCandidates.isEmpty()) {
            throw new IllegalArgumentException("No activities selected");
        }

        // 2. Clear existing itineraries if any
        trip.getItineraries().clear();

        // 3. Create itineraries for each day
        int totalDays = (int) (trip.getEndDate().toEpochDay() - trip.getStartDate().toEpochDay()) + 1;
        List<Itinerary> itineraries = new ArrayList<>();
        for (int i = 1; i <= totalDays; i++) {
            itineraries.add(Itinerary.builder()
                    .id(UUID.randomUUID())
                    .trip(trip)
                    .dayNumber(i)
                    .date(trip.getStartDate().plusDays(i - 1))
                    .summary("Ngày " + i)
                    .activities(new ArrayList<>())
                    .build());
        }

        // 4. Distribute activities across days (Simple Round-Robin / Linear fill)
        // For a more professional UX, we could use an LLM pass here to optimize the schedule
        LocalTime[] slots = {
            LocalTime.of(9, 0), LocalTime.of(11, 0), 
            LocalTime.of(14, 0), LocalTime.of(16, 0), 
            LocalTime.of(19, 0), LocalTime.of(21, 0)
        };

        for (int i = 0; i < selectedCandidates.size(); i++) {
            ActivityCandidate candidate = selectedCandidates.get(i);
            int dayIdx = (i / slots.length) % totalDays;
            int slotIdx = i % slots.length;

            if (dayIdx >= itineraries.size()) dayIdx = itineraries.size() - 1;

            Itinerary targetDay = itineraries.get(dayIdx);
            targetDay.getActivities().add(Activity.builder()
                    .id(UUID.randomUUID())
                    .itinerary(targetDay)
                    .name(candidate.getName())
                    .description(candidate.getDescription())
                    .location(candidate.getLocation())
                    .startTime(slots[slotIdx])
                    .endTime(slots[slotIdx].plusHours(1).plusMinutes(30))
                    .cost(candidate.getCost())
                    .activityOrder(targetDay.getActivities().size() + 1)
                    .build());
        }

        trip.setItineraries(itineraries);
        trip.setStatus(TripStatus.GENERATED);
        
        return TripMapper.toResponse(tripRepository.save(trip));
    }
}
