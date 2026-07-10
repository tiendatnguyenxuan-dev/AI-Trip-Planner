package com.example.tripplanner.interfaces.controller;

import com.example.tripplanner.application.dto.auth.LoginRequest;
import com.example.tripplanner.domain.model.Role;
import com.example.tripplanner.domain.model.User;
import com.example.tripplanner.domain.model.UserSession;
import com.example.tripplanner.domain.port.UserRepository;
import com.example.tripplanner.infrastructure.security.JwtTokenProvider;
import com.example.tripplanner.infrastructure.security.RedisSessionStore;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration,org.springframework.boot.autoconfigure.cache.CacheAutoConfiguration",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=update",
        "app.jwt.secret=very-long-secret-key-that-must-be-at-least-32-characters-long-access-key",
        "app.jwt.expiration=600000",
        "app.refresh.secret=another-very-long-secret-key-that-must-be-at-least-32-characters-long-refresh-key",
        "app.refresh.expiration=2592000000"
})
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private org.springframework.data.redis.connection.RedisConnectionFactory redisConnectionFactory;

    @MockBean
    private org.springframework.data.redis.core.RedisTemplate<String, com.example.tripplanner.domain.model.UserSession> redisTemplate;

    @MockBean
    private RedisSessionStore redisSessionStore;

    @MockBean
    private UserRepository userRepository;

    private final UUID testUserId = UUID.randomUUID();
    private final String testEmail = "test@example.com";
    private final String testPassword = "password123";
    private User testUser;
    private final Map<String, UserSession> mockRedis = new HashMap<>();

    @BeforeEach
    void setUp() {
        mockRedis.clear();

        testUser = new User();
        testUser.setId(testUserId);
        testUser.setEmail(testEmail);
        testUser.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(testPassword));
        testUser.setRole(Role.USER);
        testUser.setName("Test User");

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        // Mock Redis store operations
        doAnswer(invocation -> {
            UserSession session = invocation.getArgument(0);
            mockRedis.put(session.getSessionId(), session);
            return null;
        }).when(redisSessionStore).saveSession(any(UserSession.class));

        when(redisSessionStore.getSession(anyString())).thenAnswer(invocation -> {
            String sid = invocation.getArgument(0);
            return mockRedis.get(sid);
        });

        doAnswer(invocation -> {
            String sid = invocation.getArgument(0);
            mockRedis.remove(sid);
            return null;
        }).when(redisSessionStore).deleteSession(anyString(), any(UUID.class));

        doAnswer(invocation -> {
            mockRedis.clear();
            return null;
        }).when(redisSessionStore).deleteAllSessionsForUser(any(UUID.class));

        // Mock token hashing helper to return string reversed or simply prefix
        when(redisSessionStore.hashToken(anyString())).thenAnswer(invocation -> {
            String t = invocation.getArgument(0);
            return "hashed_" + t;
        });
    }

    @Test
    void testLoginSuccess() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(testEmail);
        loginRequest.setPassword(testPassword);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(cookie().exists("refreshToken"))
                .andExpect(cookie().httpOnly("refreshToken", true));

        verify(redisSessionStore, times(1)).saveSession(any(UserSession.class));
    }

    @Test
    void testRefreshSuccess() throws Exception {
        String sessionId = UUID.randomUUID().toString();
        String refreshToken = jwtTokenProvider.generateRefreshToken(testUserId, sessionId);
        String hash = "hashed_" + refreshToken;

        UserSession session = UserSession.builder()
                .sessionId(sessionId)
                .userId(testUserId)
                .refreshTokenHash(hash)
                .expiresAt(System.currentTimeMillis() + 100000)
                .build();
        mockRedis.put(sessionId, session);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(new Cookie("refreshToken", refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(cookie().exists("refreshToken"));

        // Verify rotation occurred: old deleted, new saved
        verify(redisSessionStore, times(1)).deleteSession(eq(sessionId), eq(testUserId));
        verify(redisSessionStore, times(1)).saveSession(any(UserSession.class));
    }

    @Test
    void testRefreshReuseDetection() throws Exception {
        String sessionId = UUID.randomUUID().toString();
        String refreshToken = jwtTokenProvider.generateRefreshToken(testUserId, sessionId);

        UserSession session = UserSession.builder()
                .sessionId(sessionId)
                .userId(testUserId)
                .refreshTokenHash("different_hash_meaning_token_reused")
                .expiresAt(System.currentTimeMillis() + 100000)
                .build();
        mockRedis.put(sessionId, session);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(new Cookie("refreshToken", refreshToken)))
                .andExpect(status().isForbidden());

        // Verify all sessions deleted
        verify(redisSessionStore, times(1)).deleteAllSessionsForUser(testUserId);
    }

    @Test
    void testRefreshExpired() throws Exception {
        String sessionId = UUID.randomUUID().toString();
        String refreshToken = jwtTokenProvider.generateRefreshToken(testUserId, sessionId);
        String hash = "hashed_" + refreshToken;

        UserSession session = UserSession.builder()
                .sessionId(sessionId)
                .userId(testUserId)
                .refreshTokenHash(hash)
                .expiresAt(System.currentTimeMillis() - 10000) // Expired
                .build();
        mockRedis.put(sessionId, session);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(new Cookie("refreshToken", refreshToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testLogout() throws Exception {
        String sessionId = UUID.randomUUID().toString();
        String refreshToken = jwtTokenProvider.generateRefreshToken(testUserId, sessionId);

        mockMvc.perform(post("/api/v1/auth/logout")
                        .cookie(new Cookie("refreshToken", refreshToken)))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("refreshToken", 0));

        verify(redisSessionStore, times(1)).deleteSession(eq(sessionId), eq(testUserId));
    }
}
