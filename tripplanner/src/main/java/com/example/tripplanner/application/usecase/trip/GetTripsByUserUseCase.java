package com.example.tripplanner.application.usecase.trip;

import com.example.tripplanner.application.dto.TripResponse;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.port.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetTripsByUserUseCase {

    private final TripRepository tripRepository;

    public List<TripResponse> execute(UUID userId) {
        return tripRepository.findByUserId(userId)
                .stream()
                .map(TripMapper::toResponse)
                .toList();
    }
}
