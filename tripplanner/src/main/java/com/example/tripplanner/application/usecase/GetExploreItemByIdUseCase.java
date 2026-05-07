package com.example.tripplanner.application.usecase;

import com.example.tripplanner.domain.model.ExploreItem;
import com.example.tripplanner.domain.port.ExploreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetExploreItemByIdUseCase {

    private final ExploreRepository exploreRepository;

    public ExploreItem execute(UUID id) {
        return exploreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Explore item not found"));
    }
}
