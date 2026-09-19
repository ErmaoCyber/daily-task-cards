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
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "card_occurrences")
public class CardOccurrence {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "card_id", nullable = false)
    private UUID cardId;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "scheduled_time")
    private LocalTime scheduledTime;

    @Column(length = 64)
    private String timezone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private OccurrenceState state;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    protected CardOccurrence() {
    }

    public static CardOccurrence schedule(
            UUID userId,
            UUID cardId,
            LocalDate scheduledDate,
            LocalTime scheduledTime,
            String timezone
    ) {
        if (userId == null) {
            throw new IllegalArgumentException("userId must not be null");
        }
        if (cardId == null) {
            throw new IllegalArgumentException("cardId must not be null");
        }
        if (scheduledDate == null) {
            throw new IllegalArgumentException("scheduledDate must not be null");
        }
        if (timezone != null && timezone.length() > 64) {
            throw new IllegalArgumentException("timezone must not exceed 64 characters");
        }

        CardOccurrence occurrence = new CardOccurrence();
        occurrence.userId = userId;
        occurrence.cardId = cardId;
        occurrence.scheduledDate = scheduledDate;
        occurrence.scheduledTime = scheduledTime;
        occurrence.timezone = timezone;
        occurrence.state = OccurrenceState.OPEN;
        occurrence.createdAt = Instant.now();
        occurrence.updatedAt = occurrence.createdAt;
        occurrence.resolvedAt = null;
        return occurrence;
    }

    public void resolveAs(OccurrenceState targetState, Instant resolvedAt) {
        if (state != OccurrenceState.OPEN) {
            throw new IllegalStateException("only OPEN occurrence can be resolved");
        }
        if (targetState == null || targetState == OccurrenceState.OPEN) {
            throw new IllegalArgumentException("target state must be a resolved state");
        }
        if (resolvedAt == null) {
            throw new IllegalArgumentException("resolvedAt must not be null");
        }

        state = targetState;
        this.resolvedAt = resolvedAt;
        updatedAt = resolvedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getCardId() {
        return cardId;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public LocalTime getScheduledTime() {
        return scheduledTime;
    }

    public String getTimezone() {
        return timezone;
    }

    public OccurrenceState getState() {
        return state;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }
}
