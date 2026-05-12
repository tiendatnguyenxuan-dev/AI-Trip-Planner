package com.example.tripplanner.application.service;

import com.example.tripplanner.application.dto.ModerationStatsResponse;
import com.example.tripplanner.application.dto.ContributorResponse;

import com.example.tripplanner.application.dto.ai.RetryStatsDto;
import com.example.tripplanner.application.usecase.AdminManagementUseCase;
import com.example.tripplanner.domain.model.*;
import com.example.tripplanner.domain.port.SharedContentRepository;
import com.example.tripplanner.domain.port.UserRepository;
import com.example.tripplanner.domain.port.AiLogRepository;
import com.example.tripplanner.domain.port.ExploreRepository;

import com.example.tripplanner.infrastructure.persistence.entity.UserEntity;
import com.example.tripplanner.infrastructure.persistence.repository.JpaSharedContentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminManagementService implements AdminManagementUseCase {

    private final UserRepository userRepository;
    private final SharedContentRepository sharedContentRepository;
    private final JpaSharedContentRepository jpaSharedContentRepository;
    private final AiLogRepository aiLogRepository;
    private final ExploreRepository exploreRepository;

    // --- User Management ---

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        log.info("Fetching all non-deleted users for admin dashboard");
        return userRepository.findAll().stream()
                .filter(user -> user.getStatus() != UserStatus.DELETED)
                .toList();
    }

    @Override
    @Transactional
    public User updateUserStatus(UUID userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void softDeleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() != UserStatus.LOCKED) {
            throw new IllegalStateException("Only LOCKED users can be deleted.");
        }

        user.setStatus(UserStatus.DELETED);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SharedContent> getUserReviews(UUID userId) {
        return sharedContentRepository.findByUserId(userId);
    }

    // --- Content Moderation ---

    @Override
    @Transactional(readOnly = true)
    public List<SharedContent> getPendingContent() {
        return sharedContentRepository.findByStatus(ShareStatus.PENDING);
    }

    @Override
    @Transactional
    public SharedContent moderateContent(UUID contentId, ShareStatus status) {
        SharedContent content = sharedContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        if (status == ShareStatus.REJECTED) {
            sharedContentRepository.deleteById(contentId);
            return null;
        }

        content.setStatus(status);
        return sharedContentRepository.save(content);
    }

    @Override
    @Transactional(readOnly = true)
    public ModerationStatsResponse getModerationStats() {
        return ModerationStatsResponse.builder()
                .pendingCount(jpaSharedContentRepository.countByStatus(ShareStatus.PENDING))
                .approvedCount(jpaSharedContentRepository.countByStatus(ShareStatus.PUBLISHED))
                .rejectedCount(jpaSharedContentRepository.countByStatus(ShareStatus.REJECTED))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContributorResponse> getTopContributors(int limit) {
        List<Object[]> results = jpaSharedContentRepository.findTopContributors(PageRequest.of(0, limit));

        return results.stream().map(result -> {
            UserEntity userEntity = (UserEntity) result[0];
            long postCount = ((Number) result[1]).longValue();
            long totalLikes = ((Number) result[2]).longValue();

            return ContributorResponse.builder()
                    .userId(userEntity.getId())
                    .name(userEntity.getName())
                    .email(userEntity.getEmail())
                    .contributionCount(postCount)
                    .totalImpact(totalLikes)
                    .build();
        }).collect(Collectors.toList());
    }

    // --- AI Analytics ---

    @Override
    @Transactional(readOnly = true)
    public double getAiSuccessRate() {
        long total = aiLogRepository.countTotal();
        if (total == 0)
            return 0.0;
        long successCount = aiLogRepository.countByStatus(AiLogStatus.SUCCESS);
        return (double) successCount / total * 100.0;
    }

    @Override
    @Transactional(readOnly = true)
    public double getAiAverageTokenUsage() {
        Double avgTokens = aiLogRepository.getAverageTotalTokens();
        return avgTokens != null ? avgTokens : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public RetryStatsDto getAiRetryStats() {
        long totalRequests = aiLogRepository.countTotal();
        long retriedRequests = aiLogRepository.countByRetryCountGreaterThan(0);
        Double avgRetryCount = aiLogRepository.getAverageRetryCount();

        return RetryStatsDto.builder()
                .totalRequests(totalRequests)
                .retriedRequests(retriedRequests)
                .avgRetryCount(avgRetryCount != null ? avgRetryCount : 0.0)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Double> getAiValidationErrorDistribution() {
        Map<String, Long> errorCounts = aiLogRepository.getValidationErrorCounts();
        long totalErrors = errorCounts.values().stream().mapToLong(Long::longValue).sum();

        Map<String, Double> distribution = new HashMap<>();
        if (totalErrors == 0) {
            distribution.put("FORMAT", 0.0);
            distribution.put("SCHEMA", 0.0);
            distribution.put("BUSINESS", 0.0);
            return distribution;
        }

        for (Map.Entry<String, Long> entry : errorCounts.entrySet()) {
            double percentage = (double) entry.getValue() / totalErrors * 100.0;
            distribution.put(entry.getKey(), Math.round(percentage * 100.0) / 100.0);
        }

        distribution.putIfAbsent("FORMAT", 0.0);
        distribution.putIfAbsent("SCHEMA", 0.0);
        distribution.putIfAbsent("BUSINESS", 0.0);

        return distribution;
    }

    // --- Explore Items Management ---

    @Override
    @Transactional(readOnly = true)
    public List<ExploreItem> getAllExploreItems() {
        log.info("Fetching all explore items for admin");
        return exploreRepository.findAll();
    }

    @Override
    @Transactional
    public ExploreItem createExploreItem(ExploreItem item) {
        log.info("Creating new explore item: {}", item.getTitle());
        return exploreRepository.save(item);
    }

    @Override
    @Transactional
    public ExploreItem updateExploreItem(UUID id, ExploreItem item) {
        log.info("Updating explore item {}", id);
        ExploreItem existing = exploreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Explore item not found"));
        
        // Update fields
        existing.setTitle(item.getTitle());
        existing.setDestination(item.getDestination());
        existing.setType(item.getType());
        existing.setTags(item.getTags());
        existing.setMinBudget(item.getMinBudget());
        existing.setMaxBudget(item.getMaxBudget());
        existing.setDurationDays(item.getDurationDays());
        existing.setThumbnailUrl(item.getThumbnailUrl());
        existing.setDescription(item.getDescription());
        existing.setPopularityScore(item.getPopularityScore());
        
        return exploreRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteExploreItem(UUID id) {
        log.info("Deleting explore item {}", id);
        exploreRepository.deleteById(id);
    }
}
