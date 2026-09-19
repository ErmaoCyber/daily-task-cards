package com.ermaocyber.daybyday.card.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "card_outcomes")
public class CardOutcome {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "occurrence_id", nullable = false)
    private UUID occurrenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "outcome_type", nullable = false, length = 16)
    private OutcomeType outcomeType;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private OutcomeSource source;

    @Column(name = "supersedes_outcome_id")
    private UUID supersedesOutcomeId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected CardOutcome() {
    }

    public static CardOutcome record(
            UUID occurrenceId,
            OutcomeType outcomeType,
            LocalDate effectiveDate,
            OutcomeSource source,
            Instant recordedAt
    ) {
        if (occurrenceId == null || outcomeType == null || effectiveDate == null || source == null || recordedAt == null) {
            throw new IllegalArgumentException("outcome values must not be null");
        }

        CardOutcome outcome = new CardOutcome();
        outcome.occurrenceId = occurrenceId;
        outcome.outcomeType = outcomeType;
        outcome.effectiveDate = effectiveDate;
        outcome.recordedAt = recordedAt;
        outcome.source = source;
        outcome.createdAt = recordedAt;
        return outcome;
    }

    public UUID getId() {
        return id;
    }

    public UUID getOccurrenceId() {
        return occurrenceId;
    }

    public OutcomeType getOutcomeType() {
        return outcomeType;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public Instant getRecordedAt() {
        return recordedAt;
    }

    public OutcomeSource getSource() {
        return source;
    }

    public UUID getSupersedesOutcomeId() {
        return supersedesOutcomeId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
