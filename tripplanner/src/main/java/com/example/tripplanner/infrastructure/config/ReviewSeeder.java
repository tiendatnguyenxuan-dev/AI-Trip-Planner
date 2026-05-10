package com.example.tripplanner.infrastructure.config;

import com.example.tripplanner.application.port.PasswordEncoder;
import com.example.tripplanner.domain.model.Role;
import com.example.tripplanner.domain.model.ShareStatus;
import com.example.tripplanner.domain.model.ShareType;
import com.example.tripplanner.infrastructure.persistence.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

// @Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class ReviewSeeder implements CommandLineRunner {

    private final JpaExploreItemRepository exploreItemRepository;
    private final JpaSharedContentRepository sharedContentRepository;
    private final JpaUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();

    private static final String BOT_EMAIL_PREFIX = "bot";
    private static final String BOT_EMAIL_SUFFIX = "@tripplanner.com";

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting ReviewSeeder...");

        // 1. Ensure bot users exist
        List<UserEntity> botUsers = ensureBotUsersExist();

        // 2. Clean ALL old bot reviews to free up constraints
        cleanOldBotReviews(botUsers);

        // 3. Seed fresh reviews using bot users
        seedReviews(botUsers);

        log.info("ReviewSeeder completed successfully.");
    }

    private List<UserEntity> ensureBotUsersExist() {
        List<UserEntity> bots = new ArrayList<>();
        String[] botNames = {"Alex Explorer", "Sarah Travel", "John Trip", "Emma Wanderer", "David Guide"};

        for (int i = 1; i <= 5; i++) {
            String email = BOT_EMAIL_PREFIX + i + BOT_EMAIL_SUFFIX;
            final String botName = botNames[i - 1];
            UserEntity user = userRepository.findByEmail(email).orElseGet(() -> {
                log.info("Creating bot user: {}", email);
                UserEntity newUser = UserEntity.builder()
                        .email(email)
                        .password(passwordEncoder.encode("botpassword123"))
                        .name(botName)
                        .role(Role.USER)
                        .build();
                return userRepository.save(newUser);
            });
            bots.add(user);
        }
        return bots;
    }

    private void cleanOldBotReviews(List<UserEntity> botUsers) {
        int totalDeleted = 0;
        for (UserEntity bot : botUsers) {
            List<SharedContentEntity> botReviews = sharedContentRepository.findByUser(bot);
            if (!botReviews.isEmpty()) {
                sharedContentRepository.deleteAll(botReviews);
                totalDeleted += botReviews.size();
            }
        }
        if (totalDeleted > 0) {
            log.info("Cleaned {} old bot reviews from database.", totalDeleted);
        }
    }

    private void seedReviews(List<UserEntity> botUsers) {
        List<ExploreItemEntity> items = exploreItemRepository.findAll();

        String[] reviews = {
                "Trải nghiệm tuyệt vời! Tôi rất thích nơi này.",
                "Một chuyến đi đáng nhớ, phong cảnh thật đẹp.",
                "Dịch vụ tốt, không khí trong lành, rất đáng để thử.",
                "Tôi đã có những giây phút thư giãn thực sự ở đây.",
                "Địa điểm lý tưởng cho gia đình và bạn bè.",
                "Mọi thứ đều hoàn hảo, tôi sẽ quay lại lần sau.",
                "Rất ấn tượng với cách phục vụ và không gian nơi này.",
                "Một trong những điểm đến yêu thích nhất của tôi."
        };

        for (ExploreItemEntity item : items) {
            log.info("Seeding reviews for item: {}", item.getTitle());

            // Pick 2-4 random bots to review this item
            int numReviews = 2 + random.nextInt(3);
            List<UserEntity> reviewers = new ArrayList<>(botUsers);
            java.util.Collections.shuffle(reviewers);

            double totalRating = 0;
            for (int i = 0; i < numReviews; i++) {
                UserEntity bot = reviewers.get(i);
                double rating = 4.0 + (random.nextDouble() * 1.0);
                rating = Math.round(rating * 10.0) / 10.0;

                SharedContentEntity review = SharedContentEntity.builder()
                        .user(bot)
                        .type(ShareType.EXPLORE_ITEM)
                        .refId(item.getId())
                        .content(reviews[random.nextInt(reviews.length)])
                        .rating(rating)
                        .totalRatingSum(rating)
                        .totalVotes(1 + random.nextInt(10))
                        .status(ShareStatus.PUBLISHED)
                        .build();

                sharedContentRepository.save(review);
                totalRating += rating;
            }

            // Update item stats
            item.setReviewCount(numReviews);
            item.setAverageRating(Math.round((totalRating / numReviews) * 10.0) / 10.0);
            exploreItemRepository.save(item);
        }
    }
}
