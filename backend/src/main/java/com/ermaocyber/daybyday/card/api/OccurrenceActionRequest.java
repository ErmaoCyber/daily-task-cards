package com.ermaocyber.daybyday.card.api;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record OccurrenceActionRequest(
        @NotNull UUID userId
) {
}
