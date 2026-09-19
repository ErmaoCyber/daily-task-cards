package com.ermaocyber.daybyday.card.api;

import com.ermaocyber.daybyday.card.application.CardService;
import com.ermaocyber.daybyday.user.application.CurrentUserProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class CardController {

    private final CardService cardService;
    private final CurrentUserProvider currentUserProvider;

    public CardController(CardService cardService, CurrentUserProvider currentUserProvider) {
        this.cardService = cardService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping("/cards")
    @ResponseStatus(HttpStatus.CREATED)
    public CardService.CreatedCard createCard(@Valid @RequestBody CreateCardRequest request) {
        return cardService.createCard(
                currentUserProvider.currentUserId(),
                request.title(),
                request.note(),
                request.scheduledDate(),
                request.scheduledTime(),
                request.timezone()
        );
    }

    @GetMapping("/today")
    public List<CardOccurrenceResponse> today(@RequestParam LocalDate date) {
        return cardService.findForDate(currentUserProvider.currentUserId(), date)
                .stream()
                .map(CardOccurrenceResponse::from)
                .toList();
    }

    @GetMapping("/calendar")
    public List<CardOccurrenceResponse> calendar(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return cardService.findForDateRange(
                        currentUserProvider.currentUserId(),
                        startDate,
                        endDate
                )
                .stream()
                .map(CardOccurrenceResponse::from)
                .toList();
    }

    @PostMapping("/occurrences/{occurrenceId}/done")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markDone(
            @PathVariable UUID occurrenceId,
            @RequestBody(required = false) OccurrenceActionRequest request
    ) {
        cardService.markDone(currentUserProvider.currentUserId(), occurrenceId);
    }

    @PostMapping("/occurrences/{occurrenceId}/let-go")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void letGo(
            @PathVariable UUID occurrenceId,
            @RequestBody(required = false) OccurrenceActionRequest request
    ) {
        cardService.letGo(currentUserProvider.currentUserId(), occurrenceId);
    }

    @PostMapping("/occurrences/{occurrenceId}/move")
    public MoveOccurrenceResponse move(
            @PathVariable UUID occurrenceId,
            @Valid @RequestBody MoveOccurrenceRequest request
    ) {
        UUID newOccurrenceId = cardService.move(
                currentUserProvider.currentUserId(),
                occurrenceId,
                request.targetDate()
        );

        return new MoveOccurrenceResponse(newOccurrenceId);
    }

    public record MoveOccurrenceResponse(UUID newOccurrenceId) {
    }
}
