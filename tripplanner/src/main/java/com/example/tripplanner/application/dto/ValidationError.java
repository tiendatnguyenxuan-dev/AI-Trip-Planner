package com.example.tripplanner.application.dto;

public record ValidationError(
        String field,
        String message,
        String rejectedValue
) {}
