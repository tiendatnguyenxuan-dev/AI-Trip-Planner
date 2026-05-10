package com.example.tripplanner.domain.port;

import com.example.tripplanner.domain.model.ExploreItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExploreRepository {
    ExploreItem save(ExploreItem item);
    Optional<ExploreItem> findById(UUID id);
    Page<ExploreItem> findAll(String destination, BigDecimal minBudget, BigDecimal maxBudget, Integer durationDays, List<String> tags, Pageable pageable);
    List<ExploreItem> findTrending();
    List<ExploreItem> findByTags(List<String> tags);
    List<ExploreItem> findAll();
    void deleteById(UUID id);
    long count();
}
