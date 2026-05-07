package com.example.tripplanner.infrastructure.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DataMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Running DataMigrationRunner to fix NULL versions and column lengths...");
        
        try {
            jdbcTemplate.execute("ALTER TABLE shared_contents MODIFY COLUMN type VARCHAR(50)");
            log.info("Successfully expanded shared_contents.type column to VARCHAR(50)");
        } catch (Exception e) {
            log.warn("Could not alter shared_contents.type (maybe it's already correct): {}", e.getMessage());
        }

        int updated = jdbcTemplate.update("UPDATE explore_items SET version = 0 WHERE version IS NULL");
        log.info("Fixed {} explore_items records with NULL version.", updated);
    }
}
