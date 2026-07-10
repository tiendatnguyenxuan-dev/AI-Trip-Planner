package com.example.tripplanner.infrastructure.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

/**
 * Redis Cache configuration with per-cache TTL settings.
 *
 * Cache design decisions:
 * - explore:trending   10 min  — popularity data changes infrequently
 * - explore:items       5 min  — filtered results may change with new entries
 * - community:trending  5 min  — social content changes more frequently
 *
 * Sensitive data (auth, user details) is NEVER cached here.
 * Cache is evicted explicitly on mutations via @CacheEvict.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String CACHE_EXPLORE_TRENDING  = "explore:trending";
    public static final String CACHE_EXPLORE_ITEMS     = "explore:items";
    public static final String CACHE_COMMUNITY_TRENDING = "community:trending";

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Default config: serialize values as JSON for human-readable Redis inspection
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> cacheConfigurations = Map.of(
                CACHE_EXPLORE_TRENDING,   defaultConfig.entryTtl(Duration.ofMinutes(10)),
                CACHE_EXPLORE_ITEMS,      defaultConfig.entryTtl(Duration.ofMinutes(5)),
                CACHE_COMMUNITY_TRENDING, defaultConfig.entryTtl(Duration.ofMinutes(5))
        );

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig.entryTtl(Duration.ofMinutes(5)))
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }
}
