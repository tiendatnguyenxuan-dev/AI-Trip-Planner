package com.example.tripplanner.infrastructure.config;

import com.example.tripplanner.infrastructure.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.Customizer;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/explore", "/api/v1/explore/**").permitAll()
                        .requestMatchers("/api/v1/chat", "/api/v1/chat/**").permitAll()
                        .requestMatchers("/api/v1/trips", "/api/v1/trips/**").permitAll()
                        .requestMatchers("/api/v1/itineraries", "/api/v1/itineraries/**").permitAll()
                        .requestMatchers("/api/v1/ai/**").permitAll()
                        .requestMatchers("/api/v1/community", "/api/v1/community/**").permitAll()
                        .requestMatchers("/api/v1/admin/**", "/api/v1/community/admin/**").hasRole("ADMIN")
                        .requestMatchers("/ws/**").permitAll()
                        .anyRequest().permitAll()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized - Please login again");
                        })
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
