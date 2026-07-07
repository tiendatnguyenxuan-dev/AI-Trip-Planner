package com.example.tripplanner.application.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        int status,
        String errorCode,
        String message,
        Instant timestamp,
        String path,
        String traceId,
        String requestId,
        List<ValidationError> violations
) {
    public static ErrorResponse of(int status, String errorCode, String message, String path, String traceId, String requestId) {
        return new ErrorResponse(status, errorCode, message, Instant.now(), path, traceId, requestId, null);
    }

    public static ErrorResponse of(int status, String errorCode, String message, String path, String traceId, String requestId, List<ValidationError> violations) {
        return new ErrorResponse(status, errorCode, message, Instant.now(), path, traceId, requestId, violations);
    }
}
