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
import java.util.UUID;

@Entity
@Table(name = "occurrence_links")
public class OccurrenceLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "from_occurrence_id", nullable = false)
    private UUID fromOccurrenceId;

    @Column(name = "to_occurrence_id", nullable = false)
    private UUID toOccurrenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "link_type", nullable = false, length = 24)
    private OccurrenceLinkType linkType;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected OccurrenceLink() {
    }

    public static OccurrenceLink movedTo(UUID fromOccurrenceId, UUID toOccurrenceId, Instant createdAt) {
        if (fromOccurrenceId == null || toOccurrenceId == null || createdAt == null) {
            throw new IllegalArgumentException("link values must not be null");
        }
        if (fromOccurrenceId.equals(toOccurrenceId)) {
            throw new IllegalArgumentException("occurrence cannot link to itself");
        }

        OccurrenceLink link = new OccurrenceLink();
        link.fromOccurrenceId = fromOccurrenceId;
        link.toOccurrenceId = toOccurrenceId;
        link.linkType = OccurrenceLinkType.MOVED_TO;
        link.createdAt = createdAt;
        return link;
    }

    public UUID getId() {
        return id;
    }

    public UUID getFromOccurrenceId() {
        return fromOccurrenceId;
    }

    public UUID getToOccurrenceId() {
        return toOccurrenceId;
    }

    public OccurrenceLinkType getLinkType() {
        return linkType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
