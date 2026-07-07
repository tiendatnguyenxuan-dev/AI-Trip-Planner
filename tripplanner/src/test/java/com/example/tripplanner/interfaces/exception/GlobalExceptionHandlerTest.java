package com.example.tripplanner.interfaces.exception;

import com.example.tripplanner.application.dto.auth.RegisterRequest;
import com.example.tripplanner.domain.exception.DuplicateEmailException;
import com.example.tripplanner.domain.exception.TripNotFoundException;
import jakarta.validation.Valid;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new DummyController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void shouldHandleDuplicateEmailException() throws Exception {
        mockMvc.perform(get("/dummy/duplicate-email"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errorCode").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message").value("User already exists with email: test@example.com"))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void shouldHandleTripNotFoundException() throws Exception {
        mockMvc.perform(get("/dummy/trip-not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.errorCode").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Trip not found"))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void shouldHandleMethodArgumentNotValidException() throws Exception {
        String invalidPayload = "{\"email\": \"\", \"password\": \"\"}";

        mockMvc.perform(post("/dummy/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.errorCode").value("UNPROCESSABLE_ENTITY"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.violations").isArray())
                .andExpect(jsonPath("$.violations.length()").value(4))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void shouldHandleGenericRuntimeException() throws Exception {
        mockMvc.perform(get("/dummy/runtime-exception"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.errorCode").value("INTERNAL_SERVER_ERROR"))
                .andExpect(jsonPath("$.message").value("Unexpected database error"))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    // Dummy Controller to trigger exceptions
    @RestController
    static class DummyController {

        @GetMapping("/dummy/duplicate-email")
        public void throwDuplicateEmail() {
            throw new DuplicateEmailException("User already exists with email: test@example.com");
        }

        @GetMapping("/dummy/trip-not-found")
        public void throwTripNotFound() {
            throw new TripNotFoundException("Trip not found");
        }

        @GetMapping("/dummy/runtime-exception")
        public void throwRuntimeException() {
            throw new RuntimeException("Unexpected database error");
        }

        @PostMapping("/dummy/validate")
        public void triggerValidation(@Valid @RequestBody RegisterRequest request) {
            // Validation should fail before this is reached
        }
    }
}
