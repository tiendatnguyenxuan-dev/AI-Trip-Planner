package com.example.tripplanner.application.usecase.ai;

import com.example.tripplanner.application.dto.AiLogDetailResponse;
import com.example.tripplanner.application.mapper.AiLogMapper;
import com.example.tripplanner.domain.port.AiLogRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetAiLogDetailUseCase {

    private final AiLogRepository aiLogRepository;

    public AiLogDetailResponse execute(Long logId) {
        return aiLogRepository.findById(logId)
                .map(AiLogMapper::toDetail)
                .orElseThrow(() -> new EntityNotFoundException("AI Log not found: " + logId));
    }
}
    
