package com.example.tripplanner.domain.exception;

public class DuplicateEmailException extends BusinessRuleException {
    public DuplicateEmailException(String message) {
        super(message);
    }
}
