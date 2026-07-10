package com.example.tripplanner.infrastructure.persistence.impl;

import com.example.tripplanner.domain.model.ExploreItem;
import com.example.tripplanner.domain.port.ExploreRepository;
import com.example.tripplanner.infrastructure.config.CacheConfig;
import com.example.tripplanner.infrastructure.persistence.entity.ExploreItemEntity;
import com.example.tripplanner.infrastructure.persistence.repository.JpaExploreItemRepository;
import com.example.tripplanner.infrastructure.persistence.PersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ExploreRepositoryImpl implements ExploreRepository {

    private final JpaExploreItemRepository jpaExploreItemRepository;
    private final PersistenceMapper mapper;

    @Override
    @Caching(evict = {
        @CacheEvict(value = CacheConfig.CACHE_EXPLORE_TRENDING, allEntries = true),
        @CacheEvict(value = CacheConfig.CACHE_EXPLORE_ITEMS, allEntries = true)
    })
    public ExploreItem save(ExploreItem item) {
        ExploreItemEntity entity = mapper.toExploreItemEntity(item);
        return mapper.toExploreItem(jpaExploreItemRepository.save(entity));
    }

    @Override
    public Optional<ExploreItem> findById(UUID id) {
        return jpaExploreItemRepository.findById(id).map(mapper::toExploreItem);
    }

    @Override
    public Page<ExploreItem> findAll(String destination, BigDecimal minBudget, BigDecimal maxBudget,
            Integer durationDays, List<String> tags, Pageable pageable) {
        return jpaExploreItemRepository.findWithFilters(destination, minBudget, maxBudget, durationDays, tags, pageable)
                .map(mapper::toExploreItem);
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_EXPLORE_TRENDING)
    public List<ExploreItem> findTrending() {
        return jpaExploreItemRepository.findTop5ByOrderByPopularityScoreDesc().stream()
                .map(mapper::toExploreItem)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExploreItem> findByTags(List<String> tags) {
        return jpaExploreItemRepository.findByTagsIn(tags).stream()
                .map(mapper::toExploreItem)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExploreItem> findAll() {
        return jpaExploreItemRepository.findAll().stream()
                .map(mapper::toExploreItem)
                .collect(Collectors.toList());
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = CacheConfig.CACHE_EXPLORE_TRENDING, allEntries = true),
        @CacheEvict(value = CacheConfig.CACHE_EXPLORE_ITEMS, allEntries = true)
    })
    public void deleteById(UUID id) {
        jpaExploreItemRepository.deleteById(id);
    }

    @Override
    public long count() {
        return jpaExploreItemRepository.count();
    }
}
