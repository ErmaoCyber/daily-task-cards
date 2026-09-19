package com.ermaocyber.daybyday.card.api;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record MoveOccurrenceRequest(
        @NotNull UUID userId,
        @NotNull LocalDate targetDate
) {
}
