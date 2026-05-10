package com.example.tripplanner.interfaces.controller;

import com.example.tripplanner.application.service.InteractionService;
import com.example.tripplanner.infrastructure.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/experiences")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    @PostMapping("/{experienceId}/like")
    public ResponseEntity<Void> likeExperience(
            @PathVariable UUID experienceId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        interactionService.processLike(experienceId, currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
