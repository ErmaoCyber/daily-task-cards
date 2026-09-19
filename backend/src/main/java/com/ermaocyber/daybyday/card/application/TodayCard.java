package com.ermaocyber.daybyday.card.application;

import com.ermaocyber.daybyday.card.domain.OccurrenceState;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record TodayCard(
        UUID occurrenceId,
        UUID cardId,
        String title,
        String note,
        LocalDate scheduledDate,
        LocalTime scheduledTime,
        String timezone,
        OccurrenceState state
) {
}
