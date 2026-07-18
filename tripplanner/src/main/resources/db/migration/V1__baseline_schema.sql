-- =============================================================================
-- V1 : Baseline schema — captures the full schema managed by Hibernate ddl-auto
--      This script is the single source of truth going forward.
--      All future changes must be added as V2, V3, … scripts.
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id           CHAR(36)     NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    name         VARCHAR(255),
    role         VARCHAR(50)  NOT NULL,
    status       VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at DATETIME,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS trips (
    id          CHAR(36)       NOT NULL,
    user_id     CHAR(36)       NOT NULL,
    title       VARCHAR(255),
    destination VARCHAR(255),
    start_date  DATE,
    end_date    DATE,
    budget      DECIMAL(19, 2),
    status      VARCHAR(50),
    created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_trip_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS itineraries (
    id          CHAR(36)    NOT NULL,
    trip_id     CHAR(36)    NOT NULL,
    day_number  INT         NOT NULL,
    date        DATE,
    summary     TEXT,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_itinerary_trip_day (trip_id, day_number),
    CONSTRAINT fk_itinerary_trip FOREIGN KEY (trip_id) REFERENCES trips (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activities (
    id             CHAR(36)       NOT NULL,
    itinerary_id   CHAR(36)       NOT NULL,
    name           VARCHAR(255),
    description    TEXT,
    location       VARCHAR(255),
    start_time     TIME,
    end_time       TIME,
    cost           DECIMAL(19, 2),
    activity_order INT,
    created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_activity_itinerary FOREIGN KEY (itinerary_id) REFERENCES itineraries (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_candidates (
    id          CHAR(36)       NOT NULL,
    trip_id     CHAR(36)       NOT NULL,
    name        VARCHAR(255),
    description TEXT,
    location    VARCHAR(255),
    cost        DECIMAL(19, 2),
    selected    BIT(1)         NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_candidate_trip FOREIGN KEY (trip_id) REFERENCES trips (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recommendations (
    id          CHAR(36)    NOT NULL,
    trip_id     CHAR(36)    NOT NULL,
    name        VARCHAR(255),
    type        VARCHAR(20),
    description TEXT,
    location    VARCHAR(255),
    price_level VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_recommendation_trip FOREIGN KEY (trip_id) REFERENCES trips (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS explore_items (
    id               CHAR(36)       NOT NULL,
    title            VARCHAR(255),
    destination      VARCHAR(255),
    description      TEXT,
    type             VARCHAR(50),
    min_budget       DECIMAL(19, 2),
    max_budget       DECIMAL(19, 2),
    duration_days    INT,
    thumbnail_url    VARCHAR(255),
    popularity_score DOUBLE,
    average_rating   DOUBLE         NOT NULL DEFAULT 0.0,
    review_count     INT            NOT NULL DEFAULT 0,
    total_votes      INT            NOT NULL DEFAULT 0,
    version          BIGINT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS explore_item_tags (
    explore_item_id CHAR(36)     NOT NULL,
    tag             VARCHAR(255),
    CONSTRAINT fk_tag_explore FOREIGN KEY (explore_item_id) REFERENCES explore_items (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS shared_contents (
    id               CHAR(36)       NOT NULL,
    user_id          CHAR(36)       NOT NULL,
    type             VARCHAR(50)    NOT NULL,
    ref_id           CHAR(36)       NOT NULL,
    content          TEXT,
    description      TEXT,
    rating           DOUBLE         NOT NULL,
    total_rating_sum DOUBLE         NOT NULL DEFAULT 0.0,
    total_votes      INT            NOT NULL DEFAULT 0,
    cost             DOUBLE,
    duration         INT,
    status           VARCHAR(50)    NOT NULL DEFAULT 'PENDING',
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_shared_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS shared_content_images (
    shared_content_id CHAR(36)     NOT NULL,
    image_url         VARCHAR(255),
    CONSTRAINT fk_image_shared FOREIGN KEY (shared_content_id) REFERENCES shared_contents (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comments (
    id                CHAR(36)    NOT NULL,
    shared_content_id CHAR(36)    NOT NULL,
    user_id           CHAR(36)    NOT NULL,
    content           TEXT        NOT NULL,
    created_at        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_votes (
    id                CHAR(36)    NOT NULL,
    user_id           CHAR(36)    NOT NULL,
    shared_content_id CHAR(36),
    explore_item_id   CHAR(36),
    stars             INT         NOT NULL,
    created_at        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ai_logs (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    trip_id          VARCHAR(36),
    user_input       TEXT,
    prompt           TEXT,
    response         TEXT,
    model            VARCHAR(255),
    prompt_tokens    INT,
    completion_tokens INT,
    total_tokens     INT,
    status           VARCHAR(20)  NOT NULL,
    retry_count      INT,
    error_message    TEXT,
    validation_type  VARCHAR(20),
    execution_time   BIGINT,
    prompt_version   VARCHAR(255),
    created_at       DATETIME,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Existing indexes (were managed by Hibernate @Index annotations)
CREATE INDEX idx_trip_user_id         ON trips (user_id);
CREATE INDEX idx_itinerary_trip_id    ON itineraries (trip_id);
CREATE INDEX idx_activity_itinerary_id ON activities (itinerary_id);
CREATE INDEX idx_shared_type_status   ON shared_contents (type, status);
CREATE INDEX idx_ai_log_trip_id       ON ai_logs (trip_id);
CREATE INDEX idx_ai_log_status        ON ai_logs (status);
