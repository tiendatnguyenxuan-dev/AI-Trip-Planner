-- =============================================================================
-- V2 : Add JPA Auditing columns (updated_at, created_by, updated_by)
--      createdAt already exists; we add the three missing audit fields.
-- =============================================================================

ALTER TABLE users
    ADD COLUMN updated_at   DATETIME     DEFAULT NULL,
    ADD COLUMN created_by   VARCHAR(255) DEFAULT NULL,
    ADD COLUMN updated_by   VARCHAR(255) DEFAULT NULL;

ALTER TABLE trips
    ADD COLUMN updated_at   DATETIME     DEFAULT NULL,
    ADD COLUMN created_by   VARCHAR(255) DEFAULT NULL,
    ADD COLUMN updated_by   VARCHAR(255) DEFAULT NULL;

ALTER TABLE shared_contents
    ADD COLUMN updated_at   DATETIME     DEFAULT NULL,
    ADD COLUMN created_by   VARCHAR(255) DEFAULT NULL,
    ADD COLUMN updated_by   VARCHAR(255) DEFAULT NULL;

ALTER TABLE comments
    ADD COLUMN updated_at   DATETIME     DEFAULT NULL,
    ADD COLUMN created_by   VARCHAR(255) DEFAULT NULL,
    ADD COLUMN updated_by   VARCHAR(255) DEFAULT NULL;

ALTER TABLE explore_items
    ADD COLUMN created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at   DATETIME     DEFAULT NULL,
    ADD COLUMN created_by   VARCHAR(255) DEFAULT NULL,
    ADD COLUMN updated_by   VARCHAR(255) DEFAULT NULL;
