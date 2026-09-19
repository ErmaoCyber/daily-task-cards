package com.ermaocyber.daybyday.card.api;

import com.ermaocyber.daybyday.card.application.TodayCard;
import com.ermaocyber.daybyday.card.domain.OccurrenceState;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CardOccurrenceResponse(
        UUID occurrenceId,
        UUID cardId,
        String title,
        String note,
        LocalDate scheduledDate,
        LocalTime scheduledTime,
        String timezone,
        OccurrenceState state
) {
    public static CardOccurrenceResponse from(TodayCard card) {
        return new CardOccurrenceResponse(
                card.occurrenceId(),
                card.cardId(),
                card.title(),
                card.note(),
                card.scheduledDate(),
                card.scheduledTime(),
                card.timezone(),
                card.state()
        );
    }
}
