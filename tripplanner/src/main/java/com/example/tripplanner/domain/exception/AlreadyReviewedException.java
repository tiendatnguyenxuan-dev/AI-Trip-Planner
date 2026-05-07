package com.example.tripplanner.domain.exception;

public class AlreadyReviewedException extends RuntimeException {
    public AlreadyReviewedException(String message) {
        super(message);
    }
}
