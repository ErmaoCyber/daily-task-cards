package com.ermaocyber.daybyday.card.domain;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CardOccurrenceTest {

    @Test
    void scheduleCreatesOpenOccurrence() {
        CardOccurrence occurrence = CardOccurrence.schedule(
                UUID.randomUUID(),
                UUID.randomUUID(),
                LocalDate.of(2026, 9, 20),
                LocalTime.of(9, 0),
                "Pacific/Auckland"
        );

        assertEquals(OccurrenceState.OPEN, occurrence.getState());
        assertNull(occurrence.getResolvedAt());
    }

    @Test
    void resolveOpenOccurrence() {
        CardOccurrence occurrence = CardOccurrence.schedule(
                UUID.randomUUID(),
                UUID.randomUUID(),
                LocalDate.of(2026, 9, 20),
                null,
                "Pacific/Auckland"
        );
        Instant resolvedAt = Instant.now();

        occurrence.resolveAs(OccurrenceState.DONE, resolvedAt);

        assertEquals(OccurrenceState.DONE, occurrence.getState());
        assertEquals(resolvedAt, occurrence.getResolvedAt());
        assertNotNull(occurrence.getUpdatedAt());
    }

    @Test
    void resolvedOccurrenceCannotBeResolvedAgain() {
        CardOccurrence occurrence = CardOccurrence.schedule(
                UUID.randomUUID(),
                UUID.randomUUID(),
                LocalDate.of(2026, 9, 20),
                null,
                null
        );

        occurrence.resolveAs(OccurrenceState.DONE, Instant.now());

        assertThrows(
                IllegalStateException.class,
                () -> occurrence.resolveAs(OccurrenceState.LET_GO, Instant.now())
        );
    }
}
