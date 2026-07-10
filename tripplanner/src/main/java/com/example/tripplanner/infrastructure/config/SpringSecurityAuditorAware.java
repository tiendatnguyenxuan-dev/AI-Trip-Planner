package com.example.tripplanner.infrastructure.config;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Provides the current auditor (username/email) to Spring Data JPA Auditing.
 * Used to populate @CreatedBy and @LastModifiedBy fields on AuditableEntity.
 *
 * Returns the authenticated user's email, or "system" for background operations
 * (e.g., data migration, scheduled jobs) that run without a security context.
 */
@Component
public class SpringSecurityAuditorAware implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.of("system");
        }

        return Optional.of(authentication.getName());
    }
}
