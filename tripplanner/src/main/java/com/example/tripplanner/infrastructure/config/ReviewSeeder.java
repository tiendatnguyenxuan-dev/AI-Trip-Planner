package com.example.tripplanner.infrastructure.config;

import com.example.tripplanner.domain.model.ShareStatus;
import com.example.tripplanner.domain.model.ShareType;
import com.example.tripplanner.infrastructure.persistence.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class ReviewSeeder implements CommandLineRunner {

    private final JpaExploreItemRepository exploreItemRepository;
    private final JpaSharedContentRepository sharedContentRepository;
    private final JpaUserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking if we need to seed auto-generated reviews for ExploreItems...");

        List<UserEntity> users = userRepository.findAll();
        if (users.isEmpty()) {
            log.warn("No users found to author the reviews. Skipping review seeding.");
            return;
        }

        List<ExploreItemEntity> exploreItems = exploreItemRepository.findAll();
        Random random = new Random();
        
        int addedReviews = 0;

        for (ExploreItemEntity item : exploreItems) {
            // Check if this item already has reviews
            if (item.getReviewCount() != null && item.getReviewCount() > 0) {
                continue;
            }

            // Generate 1 to 3 reviews per item
            int numReviews = random.nextInt(3) + 1;
            double sumRating = 0.0;

            for (int i = 0; i < numReviews; i++) {
                UserEntity randomUser = users.get(random.nextInt(users.size()));
                
                // Prevent duplicate review from same user for same item
                if (sharedContentRepository.existsByUser_IdAndRefIdAndType(randomUser.getId(), item.getId(), ShareType.EXPLORE_ITEM)) {
                    continue;
                }

                int rating = random.nextInt(2) + 4; // Random rating 4 or 5
                sumRating += rating;

                String jsonContent = String.format("{\"description\":\"Nơi này rất tuyệt vời, tôi rất thích %s!\",\"tip\":\"Nên đi vào buổi sáng sớm để chụp hình đẹp.\",\"specificLocation\":\"\"}", item.getTitle());

                SharedContentEntity review = SharedContentEntity.builder()
                        .user(randomUser)
                        .type(ShareType.EXPLORE_ITEM)
                        .refId(item.getId())
                        .rating((double) rating)
                        .content(jsonContent)
                        .status(ShareStatus.PUBLISHED)
                        .totalVotes(random.nextInt(50))
                        .build();

                sharedContentRepository.save(review);
                addedReviews++;
            }

            // Update item stats
            if (numReviews > 0) {
                item.setReviewCount(numReviews);
                item.setAverageRating(sumRating / numReviews);
                exploreItemRepository.save(item);
            }
        }

        log.info("Successfully seeded {} auto-generated reviews for ExploreItems.", addedReviews);
    }
}
