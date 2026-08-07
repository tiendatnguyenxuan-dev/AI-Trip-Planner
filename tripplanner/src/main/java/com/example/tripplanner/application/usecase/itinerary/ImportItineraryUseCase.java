package com.example.tripplanner.application.usecase.itinerary;

import com.example.tripplanner.application.dto.itinerary.ImportItineraryRequest;
import com.example.tripplanner.application.dto.itinerary.ItineraryResponse;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.exception.TripNotFoundException;
import com.example.tripplanner.domain.model.Activity;
import com.example.tripplanner.domain.model.Itinerary;
import com.example.tripplanner.domain.model.Trip;
import com.example.tripplanner.domain.model.TripStatus;
import com.example.tripplanner.domain.port.ActivityRepository;
import com.example.tripplanner.domain.port.ItineraryRepository;
import com.example.tripplanner.domain.port.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Imports an AI-generated itinerary (produced by the Python AI service)
 * directly into the database, bypassing the backend AIOrchestrator.
 *
 * This avoids making a second AI call just to persist data that is already available.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImportItineraryUseCase {

    private final TripRepository tripRepository;
    private final ItineraryRepository itineraryRepository;
    private final ActivityRepository activityRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    @Transactional
    public List<ItineraryResponse> execute(UUID tripId, ImportItineraryRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new TripNotFoundException("Trip not found: " + tripId));

        // Clear any existing itineraries first (idempotent re-import)
        itineraryRepository.deleteByTripId(tripId);

        List<ItineraryResponse> result = new ArrayList<>();

        if (request.getDays() == null || request.getDays().isEmpty()) {
            log.warn("ImportItineraryUseCase: empty days list for trip={}", tripId);
            return result;
        }

        for (int i = 0; i < request.getDays().size(); i++) {
            ImportItineraryRequest.DayDto dayDto = request.getDays().get(i);

            LocalDate date = trip.getStartDate().plusDays(dayDto.getDayNumber() - 1);

            Itinerary itinerary = Itinerary.builder()
                    .id(UUID.randomUUID())
                    .trip(trip)
                    .dayNumber(dayDto.getDayNumber())
                    .date(date)
                    .summary(dayDto.getSummary())
                    .createdAt(LocalDateTime.now())
                    .activities(new ArrayList<>())
                    .build();

            Itinerary saved = itineraryRepository.save(itinerary);

            if (dayDto.getActivities() != null) {
                int order = 1;
                for (ImportItineraryRequest.ActivityDto actDto : dayDto.getActivities()) {
                    Activity activity = Activity.builder()
                            .id(UUID.randomUUID())
                            .itinerary(saved)
                            .name(actDto.getName())
                            .description(actDto.getDescription())
                            .location(actDto.getLocation())
                            .startTime(parseTime(actDto.getStartTime()))
                            .endTime(parseTime(actDto.getEndTime()))
                            .cost(actDto.getCost() != null ? BigDecimal.valueOf(actDto.getCost()) : BigDecimal.ZERO)
                            .activityOrder(order++)
                            .createdAt(LocalDateTime.now())
                            .build();
                    activityRepository.save(activity);
                    saved.getActivities().add(activity);
                }
            }

            result.add(TripMapper.toItineraryResponse(saved));
        }

        // Mark trip as CONFIRMED now that it has an itinerary
        trip.setStatus(TripStatus.CONFIRMED);
        tripRepository.save(trip);

        log.info("ImportItineraryUseCase: imported {} days for trip={}", result.size(), tripId);
        return result;
    }

    private LocalTime parseTime(String raw) {
        if (raw == null || raw.isBlank()) return LocalTime.of(8, 0);
        try {
            return LocalTime.parse(raw.trim().substring(0, 5), TIME_FMT);
        } catch (Exception e) {
            return LocalTime.of(8, 0);
        }
    }
}
