package com.example.tripplanner.interfaces.controller;

import com.example.tripplanner.application.dto.auth.AuthResponse;
import com.example.tripplanner.application.dto.auth.LoginRequest;
import com.example.tripplanner.application.dto.auth.RegisterRequest;
import com.example.tripplanner.application.dto.auth.UserResponse;
import com.example.tripplanner.application.usecase.auth.LoginUseCase;
import com.example.tripplanner.application.usecase.auth.RegisterUserUseCase;
import com.example.tripplanner.domain.exception.*;
import com.example.tripplanner.domain.model.User;
import com.example.tripplanner.domain.model.UserSession;
import com.example.tripplanner.domain.port.UserRepository;
import com.example.tripplanner.infrastructure.security.JwtTokenProvider;
import com.example.tripplanner.infrastructure.security.RedisSessionStore;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;
    private final LoginUseCase loginUseCase;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisSessionStore redisSessionStore;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(registerUserUseCase.execute(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        
        AuthResponse authResponse = loginUseCase.execute(request);
        UserResponse userResponse = authResponse.getUser();

        // 1. Generate new Refresh Token with a unique session ID
        String sessionId = UUID.randomUUID().toString();
        String refreshToken = jwtTokenProvider.generateRefreshToken(userResponse.getId(), sessionId);

        // 2. Hash Refresh Token
        String hash = redisSessionStore.hashToken(refreshToken);

        // 3. Create Redis Session
        UserSession session = UserSession.builder()
                .sessionId(sessionId)
                .userId(userResponse.getId())
                .refreshTokenHash(hash)
                .deviceInfo(servletRequest.getHeader("User-Agent"))
                .ipAddress(servletRequest.getRemoteAddr())
                .createdAt(System.currentTimeMillis())
                .expiresAt(System.currentTimeMillis() + jwtTokenProvider.getRefreshExpiration())
                .build();

        // 4. Save Session to Redis
        redisSessionStore.saveSession(session);

        // 5. Send Refresh Token as HttpOnly Secure Cookie
        setRefreshTokenCookie(servletResponse, refreshToken, jwtTokenProvider.getRefreshExpiration() / 1000);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {

        // 1. Get Refresh Token from Cookie
        String refreshToken = getRefreshTokenFromRequest(servletRequest);
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new InvalidRefreshTokenException("Refresh token is missing");
        }

        // 2. Validate token signature
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw new InvalidRefreshTokenException("Invalid or expired refresh token signature");
        }

        UUID userId = jwtTokenProvider.getUserIdFromRefreshToken(refreshToken);
        String sessionId = jwtTokenProvider.getSessionIdFromRefreshToken(refreshToken);

        // 3. Load active session from Redis
        UserSession session = redisSessionStore.getSession(sessionId);
        if (session == null) {
            throw new SessionNotFoundException("Session not found or already invalidated");
        }

        // 4. Verify hash to check if this token matches stored session hash
        String incomingHash = redisSessionStore.hashToken(refreshToken);
        if (!session.getRefreshTokenHash().equals(incomingHash)) {
            // Token Reuse Detected: Wipe out all sessions belonging to user
            redisSessionStore.deleteAllSessionsForUser(userId);
            clearRefreshTokenCookie(servletResponse);
            log.error("CRITICAL: Refresh token reuse detected for user {}. Invalidated all sessions.", userId);
            throw new RefreshTokenReuseDetectedException("Token reuse detected. Wiping all sessions for security.");
        }

        // 5. Check if session has expired
        if (System.currentTimeMillis() > session.getExpiresAt()) {
            redisSessionStore.deleteSession(sessionId, userId);
            clearRefreshTokenCookie(servletResponse);
            throw new ExpiredRefreshTokenException("Refresh token has expired");
        }

        // 6. Load User to generate access token
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User no longer exists"));

        // 7. Token Rotation: Generate new tokens & session
        String newAccess = jwtTokenProvider.generateToken(user.getId(), user.getRole());
        String newSessionId = UUID.randomUUID().toString();
        String newRefresh = jwtTokenProvider.generateRefreshToken(user.getId(), newSessionId);
        String newHash = redisSessionStore.hashToken(newRefresh);

        // Save new Session
        UserSession newSession = UserSession.builder()
                .sessionId(newSessionId)
                .userId(user.getId())
                .refreshTokenHash(newHash)
                .deviceInfo(servletRequest.getHeader("User-Agent"))
                .ipAddress(servletRequest.getRemoteAddr())
                .createdAt(System.currentTimeMillis())
                .expiresAt(System.currentTimeMillis() + jwtTokenProvider.getRefreshExpiration())
                .build();

        redisSessionStore.saveSession(newSession);

        // Delete old Session
        redisSessionStore.deleteSession(sessionId, userId);

        // Update Cookie
        setRefreshTokenCookie(servletResponse, newRefresh, jwtTokenProvider.getRefreshExpiration() / 1000);

        AuthResponse response = AuthResponse.builder()
                .token(newAccess)
                .user(UserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole().name())
                        .status(user.getStatus() != null ? user.getStatus().name() : null)
                        .createdAt(user.getCreatedAt())
                        .lastActiveAt(user.getLastActiveAt())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {

        String refreshToken = getRefreshTokenFromRequest(servletRequest);
        if (refreshToken != null && !refreshToken.isBlank()) {
            try {
                if (jwtTokenProvider.validateRefreshToken(refreshToken)) {
                    UUID userId = jwtTokenProvider.getUserIdFromRefreshToken(refreshToken);
                    String sessionId = jwtTokenProvider.getSessionIdFromRefreshToken(refreshToken);
                    redisSessionStore.deleteSession(sessionId, userId);
                }
            } catch (Exception e) {
                log.warn("Failed to invalidate session during logout: {}", e.getMessage());
            }
        }

        clearRefreshTokenCookie(servletResponse);
        return ResponseEntity.ok().build();
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken, long maxAgeSeconds) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Using HTTP for localhost development
        cookie.setPath("/");
        cookie.setMaxAge((int) maxAgeSeconds);
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String getRefreshTokenFromRequest(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
