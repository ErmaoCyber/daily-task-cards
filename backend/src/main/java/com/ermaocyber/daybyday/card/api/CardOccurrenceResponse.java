package com.ermaocyber.daybyday.card.api;

import com.ermaocyber.daybyday.card.domain.CardOccurrence;
import com.ermaocyber.daybyday.card.domain.OccurrenceState;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CardOccurrenceResponse(
        UUID id,
        UUID cardId,
        LocalDate scheduledDate,
        LocalTime scheduledTime,
        String timezone,
        OccurrenceState state
) {
    public static CardOccurrenceResponse from(CardOccurrence occurrence) {
        return new CardOccurrenceResponse(
                occurrence.getId(),
                occurrence.getCardId(),
                occurrence.getScheduledDate(),
                occurrence.getScheduledTime(),
                occurrence.getTimezone(),
                occurrence.getState()
        );
    }
}
