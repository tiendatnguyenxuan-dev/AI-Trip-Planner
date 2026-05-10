package com.example.tripplanner.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String name;
    private String role;
    private String status;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime lastActiveAt;
}
