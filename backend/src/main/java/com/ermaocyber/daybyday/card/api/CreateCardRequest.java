package com.ermaocyber.daybyday.card.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CreateCardRequest(
        @NotNull UUID userId,
        @NotBlank @Size(max = 240) String title,
        String note,
        @NotNull LocalDate scheduledDate,
        LocalTime scheduledTime,
        @Size(max = 64) String timezone
) {
}
