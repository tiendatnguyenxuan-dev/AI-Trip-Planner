package com.example.tripplanner.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSession implements Serializable {
    private static final long serialVersionUID = 1L;

    private String sessionId;
    private UUID userId;
    private String refreshTokenHash;
    private String deviceInfo;
    private String ipAddress;
    private long createdAt;
    private long expiresAt;
}
