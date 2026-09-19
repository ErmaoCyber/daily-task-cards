-- V1: Core Card timeline schema
-- Backend Phase 1
--
-- This migration intentionally creates only the smallest end-to-end core:
-- users -> cards -> card_occurrences -> card_outcomes / occurrence_links.
--
-- Later migrations will add DayRecord, metrics, Life List and recurrence.

CREATE TABLE users (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email           varchar(320) NOT NULL,
    display_name    varchar(120),
    timezone        varchar(64) NOT NULL DEFAULT 'UTC',
    locale          varchar(32) NOT NULL DEFAULT 'en-NZ',
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE cards (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES users(id),

    title           varchar(240) NOT NULL,
    note            text,

    source_type     varchar(32),
    source_id       varchar(120),

    status          varchar(16) NOT NULL DEFAULT 'ACTIVE',

    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    archived_at     timestamptz,

    CONSTRAINT ck_cards_title_not_blank
        CHECK (length(trim(title)) > 0),

    CONSTRAINT ck_cards_status
        CHECK (status IN ('ACTIVE', 'ARCHIVED')),

    CONSTRAINT ck_cards_archive_state
        CHECK (
            (status = 'ACTIVE' AND archived_at IS NULL)
            OR
            (status = 'ARCHIVED' AND archived_at IS NOT NULL)
        )
);

CREATE TABLE card_occurrences (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES users(id),
    card_id         uuid NOT NULL REFERENCES cards(id),

    scheduled_date  date NOT NULL,
    scheduled_time  time,
    timezone        varchar(64),

    state           varchar(16) NOT NULL DEFAULT 'OPEN',

    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    resolved_at     timestamptz,

    CONSTRAINT ck_card_occurrences_state
        CHECK (state IN ('OPEN', 'DONE', 'MOVED', 'LET_GO', 'CANCELLED')),

    CONSTRAINT ck_card_occurrences_resolution
        CHECK (
            (state = 'OPEN' AND resolved_at IS NULL)
            OR
            (state IN ('DONE', 'MOVED', 'LET_GO', 'CANCELLED') AND resolved_at IS NOT NULL)
        )
);

CREATE TABLE card_outcomes (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    occurrence_id           uuid NOT NULL REFERENCES card_occurrences(id),

    outcome_type            varchar(16) NOT NULL,
    effective_date          date NOT NULL,
    recorded_at             timestamptz NOT NULL DEFAULT now(),

    source                  varchar(32) NOT NULL,
    supersedes_outcome_id   uuid REFERENCES card_outcomes(id),

    created_at              timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT ck_card_outcomes_type
        CHECK (outcome_type IN ('DONE', 'MOVED', 'LET_GO', 'CANCELLED')),

    CONSTRAINT ck_card_outcomes_source
        CHECK (source IN ('TODAY', 'CLOSE_DAY', 'HISTORICAL_RESOLUTION', 'SYSTEM')),

    CONSTRAINT ck_card_outcomes_not_self_superseding
        CHECK (supersedes_outcome_id IS NULL OR supersedes_outcome_id <> id)
);

CREATE TABLE occurrence_links (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    from_occurrence_id      uuid NOT NULL REFERENCES card_occurrences(id),
    to_occurrence_id        uuid NOT NULL REFERENCES card_occurrences(id),

    link_type               varchar(24) NOT NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT ck_occurrence_links_type
        CHECK (link_type IN ('MOVED_TO')),

    CONSTRAINT ck_occurrence_links_not_self
        CHECK (from_occurrence_id <> to_occurrence_id),

    CONSTRAINT uq_occurrence_links_relation
        UNIQUE (from_occurrence_id, to_occurrence_id, link_type)
);

CREATE INDEX idx_cards_user_status
    ON cards (user_id, status);

CREATE INDEX idx_card_occurrences_user_date
    ON card_occurrences (user_id, scheduled_date);

CREATE INDEX idx_card_occurrences_card_date
    ON card_occurrences (card_id, scheduled_date);

CREATE INDEX idx_card_occurrences_user_state_date
    ON card_occurrences (user_id, state, scheduled_date);

CREATE INDEX idx_card_outcomes_occurrence
    ON card_outcomes (occurrence_id);

CREATE INDEX idx_card_outcomes_effective_date
    ON card_outcomes (effective_date);

CREATE INDEX idx_occurrence_links_from
    ON occurrence_links (from_occurrence_id);

CREATE INDEX idx_occurrence_links_to
    ON occurrence_links (to_occurrence_id);
