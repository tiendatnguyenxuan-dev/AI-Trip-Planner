package com.example.tripplanner.application.usecase.auth;

import com.example.tripplanner.application.dto.auth.AuthResponse;
import com.example.tripplanner.application.dto.auth.LoginRequest;
import com.example.tripplanner.application.dto.auth.UserResponse;
import com.example.tripplanner.application.security.PasswordEncoder;
import com.example.tripplanner.application.security.TokenProvider;
import com.example.tripplanner.domain.exception.UnauthorizedException;
import com.example.tripplanner.domain.model.User;
import com.example.tripplanner.domain.port.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;

    public AuthResponse execute(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole().name())
                        .build())
                .build();
    }
}

