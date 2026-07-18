-- =============================================================================
-- V4 : Additional database indexes for query optimization.
--      Only indexes that are justified by actual query patterns.
-- =============================================================================

-- users.email: most frequent lookup (login, registration check)
-- NOTE: email already has UNIQUE constraint which creates an implicit index.
-- Explicit naming for clarity in EXPLAIN output.
CREATE INDEX idx_user_email ON users (email);

-- trips.destination: used in trip search / filter
CREATE INDEX idx_trip_destination ON trips (destination);

-- trips.created_at: used in ORDER BY created_at DESC for trip history
CREATE INDEX idx_trip_created_at ON trips (created_at);

-- explore_items.destination: used in LIKE search filter
CREATE INDEX idx_explore_destination ON explore_items (destination);

-- explore_items.type: used in type filter
CREATE INDEX idx_explore_type ON explore_items (type);

-- explore_items.popularity_score: used in ORDER BY popularityScore DESC (trending)
CREATE INDEX idx_explore_popularity ON explore_items (popularity_score DESC);

-- shared_contents.user_id: used in findByUser_Id()
CREATE INDEX idx_shared_user_id ON shared_contents (user_id);

-- shared_contents.ref_id: used in findByRefId()
CREATE INDEX idx_shared_ref_id ON shared_contents (ref_id);

-- shared_contents.created_at: used in ORDER BY createdAt DESC
CREATE INDEX idx_shared_created_at ON shared_contents (created_at);

-- comments.shared_content_id: used in findBySharedContentId()
CREATE INDEX idx_comment_shared_content_id ON comments (shared_content_id);

-- user_votes composite: prevent duplicate votes per user per content
CREATE UNIQUE INDEX uk_vote_user_shared
    ON user_votes (user_id, shared_content_id);

CREATE UNIQUE INDEX uk_vote_user_explore
    ON user_votes (user_id, explore_item_id);
