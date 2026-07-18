-- =============================================================================
-- V3 : Soft Delete — add deleted_at column to applicable tables.
--      Records with deleted_at IS NOT NULL are considered logically deleted.
--      Hibernate @SQLRestriction("deleted_at IS NULL") filters them automatically.
-- =============================================================================

ALTER TABLE trips
    ADD COLUMN deleted_at DATETIME DEFAULT NULL;

ALTER TABLE shared_contents
    ADD COLUMN deleted_at DATETIME DEFAULT NULL;

ALTER TABLE comments
    ADD COLUMN deleted_at DATETIME DEFAULT NULL;

ALTER TABLE explore_items
    ADD COLUMN deleted_at DATETIME DEFAULT NULL;
