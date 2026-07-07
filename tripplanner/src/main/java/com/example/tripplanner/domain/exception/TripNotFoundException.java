package com.example.tripplanner.domain.exception;

public class TripNotFoundException extends ResourceNotFoundException {
    public TripNotFoundException(String message) {
        super(message);
    }
}
