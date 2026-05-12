package com.example.tripplanner.application.usecase;

import com.example.tripplanner.application.dto.ai.RetryStatsDto;
import com.example.tripplanner.domain.model.SharedContent;
import com.example.tripplanner.domain.model.User;
import com.example.tripplanner.domain.model.UserStatus;
import com.example.tripplanner.domain.model.ExploreItem;
import com.example.tripplanner.domain.model.ShareStatus;
import com.example.tripplanner.application.dto.ModerationStatsResponse;
import com.example.tripplanner.application.dto.ContributorResponse;


import java.util.List;
import java.util.UUID;
import java.util.Map;

public interface AdminManagementUseCase {
    // User Management
    List<User> getAllUsers();
    User updateUserStatus(UUID userId, UserStatus status);
    void softDeleteUser(UUID userId);
    List<SharedContent> getUserReviews(UUID userId);

    // Content Moderation
    List<SharedContent> getPendingContent();
    SharedContent moderateContent(UUID contentId, ShareStatus status);
    ModerationStatsResponse getModerationStats();
    List<ContributorResponse> getTopContributors(int limit);

    // AI Analytics
    double getAiSuccessRate();
    double getAiAverageTokenUsage();
    RetryStatsDto getAiRetryStats();
    Map<String, Double> getAiValidationErrorDistribution();

    // Explore Items (Places) Management
    List<ExploreItem> getAllExploreItems();
    ExploreItem createExploreItem(ExploreItem item);
    ExploreItem updateExploreItem(UUID id, ExploreItem item);
    void deleteExploreItem(UUID id);
}
