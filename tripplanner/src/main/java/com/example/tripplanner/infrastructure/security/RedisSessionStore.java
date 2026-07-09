package com.example.tripplanner.infrastructure.security;

import com.example.tripplanner.domain.model.UserSession;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class RedisSessionStore {

    private final RedisTemplate<String, UserSession> redisTemplate;
    private static final String SESSION_KEY_PREFIX = "session:";
    private static final String USER_SESSIONS_KEY_PREFIX = "user:sessions:";

    public RedisSessionStore(RedisTemplate<String, UserSession> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void saveSession(UserSession session) {
        String sessionKey = SESSION_KEY_PREFIX + session.getSessionId();
        String userSessionsKey = USER_SESSIONS_KEY_PREFIX + session.getUserId().toString();

        long ttlMillis = session.getExpiresAt() - System.currentTimeMillis();
        if (ttlMillis <= 0) {
            return;
        }

        // Save session data with TTL
        redisTemplate.opsForValue().set(sessionKey, session, Duration.ofMillis(ttlMillis));

        // Add to user's list of sessions
        redisTemplate.opsForSet().add(userSessionsKey, session);
        redisTemplate.expire(userSessionsKey, Duration.ofMillis(ttlMillis));
    }

    public UserSession getSession(String sessionId) {
        return redisTemplate.opsForValue().get(SESSION_KEY_PREFIX + sessionId);
    }

    public void deleteSession(String sessionId, UUID userId) {
        String sessionKey = SESSION_KEY_PREFIX + sessionId;
        String userSessionsKey = USER_SESSIONS_KEY_PREFIX + userId.toString();

        UserSession session = getSession(sessionId);
        redisTemplate.delete(sessionKey);

        if (session != null) {
            redisTemplate.opsForSet().remove(userSessionsKey, session);
        }
    }

    public void deleteAllSessionsForUser(UUID userId) {
        String userSessionsKey = USER_SESSIONS_KEY_PREFIX + userId.toString();
        Set<UserSession> sessions = redisTemplate.opsForSet().members(userSessionsKey);

        if (sessions != null && !sessions.isEmpty()) {
            Set<String> sessionKeys = sessions.stream()
                    .map(session -> SESSION_KEY_PREFIX + session.getSessionId())
                    .collect(Collectors.toSet());
            redisTemplate.delete(sessionKeys);
        }
        redisTemplate.delete(userSessionsKey);
    }

    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
