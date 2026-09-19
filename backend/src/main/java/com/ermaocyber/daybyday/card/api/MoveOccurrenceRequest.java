package com.ermaocyber.daybyday.card.api;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record MoveOccurrenceRequest(
        @NotNull LocalDate targetDate
) {
}
