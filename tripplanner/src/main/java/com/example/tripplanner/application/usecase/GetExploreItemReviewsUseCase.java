package com.example.tripplanner.application.usecase;

import com.example.tripplanner.application.dto.SharedContentResponse;
import com.example.tripplanner.application.mapper.SharedContentMapper;
import com.example.tripplanner.domain.port.SharedContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetExploreItemReviewsUseCase {

    private final SharedContentRepository sharedContentRepository;

    public List<SharedContentResponse> execute(UUID exploreItemId) {
        return sharedContentRepository.findByRefId(exploreItemId).stream()
                .map(SharedContentMapper::toResponse)
                .collect(Collectors.toList());
    }
}
