package com.example.tripplanner.application.usecase.ai;

import com.example.tripplanner.application.dto.AiLogPageResponse;
import com.example.tripplanner.application.dto.AiLogSummaryResponse;
import com.example.tripplanner.application.mapper.AiLogMapper;
import com.example.tripplanner.domain.model.AiLog;
import com.example.tripplanner.domain.model.AiLogStatus;
import com.example.tripplanner.domain.port.AiLogRepository;
import com.example.tripplanner.domain.port.TripRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetAiLogsByTripUseCase {

    private final AiLogRepository aiLogRepository;
    private final TripRepository tripRepository;

    public AiLogPageResponse execute(UUID tripId, String status, int page, int size) {
        if (!tripRepository.existsById(tripId)) {
            throw new EntityNotFoundException("Trip not found: " + tripId);
        }

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String tripIdStr = tripId.toString();

        Page<AiLog> resultPage;
        if (status != null && !status.isBlank()) {
            try {
                AiLogStatus enumStatus = AiLogStatus.valueOf(status.toUpperCase());
                resultPage = aiLogRepository.findByTripIdAndStatus(tripIdStr, enumStatus, pageable);
            } catch(IllegalArgumentException ex) {
                resultPage = aiLogRepository.findByTripId(tripIdStr, pageable);
            }
        } else {
            resultPage = aiLogRepository.findByTripId(tripIdStr, pageable);
        }

        List<AiLogSummaryResponse> content = resultPage.getContent().stream()
                .map(AiLogMapper::toSummary)
                .toList();

        return AiLogPageResponse.builder()
                .content(content)
                .page(resultPage.getNumber())
                .size(resultPage.getSize())
                .totalElements(resultPage.getTotalElements())
                .totalPages(resultPage.getTotalPages())
                .last(resultPage.isLast())
                .build();
    }
}
