package com.ermaocyber.daybyday.card.application;

import com.ermaocyber.daybyday.card.domain.Card;
import com.ermaocyber.daybyday.card.domain.CardOccurrence;
import com.ermaocyber.daybyday.card.domain.CardOutcome;
import com.ermaocyber.daybyday.card.domain.OccurrenceLink;
import com.ermaocyber.daybyday.card.domain.OccurrenceState;
import com.ermaocyber.daybyday.card.domain.OutcomeSource;
import com.ermaocyber.daybyday.card.domain.OutcomeType;
import com.ermaocyber.daybyday.card.repository.CardOccurrenceRepository;
import com.ermaocyber.daybyday.card.repository.CardOutcomeRepository;
import com.ermaocyber.daybyday.card.repository.CardRepository;
import com.ermaocyber.daybyday.card.repository.OccurrenceLinkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CardService {

    private final CardRepository cardRepository;
    private final CardOccurrenceRepository occurrenceRepository;
    private final CardOutcomeRepository outcomeRepository;
    private final OccurrenceLinkRepository linkRepository;

    public CardService(
            CardRepository cardRepository,
            CardOccurrenceRepository occurrenceRepository,
            CardOutcomeRepository outcomeRepository,
            OccurrenceLinkRepository linkRepository
    ) {
        this.cardRepository = cardRepository;
        this.occurrenceRepository = occurrenceRepository;
        this.outcomeRepository = outcomeRepository;
        this.linkRepository = linkRepository;
    }

    public CreatedCard createCard(
            UUID userId,
            String title,
            String note,
            LocalDate scheduledDate,
            LocalTime scheduledTime,
            String timezone
    ) {
        Card card = cardRepository.save(Card.create(userId, title, note));
        CardOccurrence occurrence = occurrenceRepository.save(
                CardOccurrence.schedule(
                        userId,
                        card.getId(),
                        scheduledDate,
                        scheduledTime,
                        timezone
                )
        );

        return new CreatedCard(card.getId(), occurrence.getId());
    }

    @Transactional(readOnly = true)
    public List<TodayCard> findForDate(UUID userId, LocalDate date) {
        List<CardOccurrence> occurrences =
                occurrenceRepository.findByUserIdAndScheduledDateOrderByScheduledTimeAsc(userId, date);

        var cardsById = cardRepository.findAllById(
                        occurrences.stream().map(CardOccurrence::getCardId).distinct().toList()
                )
                .stream()
                .collect(java.util.stream.Collectors.toMap(Card::getId, card -> card));

        return occurrences.stream()
                .map(occurrence -> {
                    Card card = cardsById.get(occurrence.getCardId());
                    if (card == null) {
                        throw new IllegalStateException("card not found for occurrence");
                    }

                    return new TodayCard(
                            occurrence.getId(),
                            card.getId(),
                            card.getTitle(),
                            card.getNote(),
                            occurrence.getScheduledDate(),
                            occurrence.getScheduledTime(),
                            occurrence.getTimezone(),
                            occurrence.getState()
                    );
                })
                .toList();
    }

    public void markDone(UUID userId, UUID occurrenceId) {
        resolve(userId, occurrenceId, OccurrenceState.DONE, OutcomeType.DONE);
    }

    public void letGo(UUID userId, UUID occurrenceId) {
        resolve(userId, occurrenceId, OccurrenceState.LET_GO, OutcomeType.LET_GO);
    }

    public UUID move(UUID userId, UUID occurrenceId, LocalDate targetDate) {
        if (targetDate == null) {
            throw new IllegalArgumentException("targetDate must not be null");
        }

        CardOccurrence current = loadOwnedOccurrence(userId, occurrenceId);
        if (!targetDate.isAfter(current.getScheduledDate())) {
            throw new IllegalArgumentException("targetDate must be after the current scheduled date");
        }

        Instant now = Instant.now();
        current.resolveAs(OccurrenceState.MOVED, now);

        outcomeRepository.save(
                CardOutcome.record(
                        current.getId(),
                        OutcomeType.MOVED,
                        current.getScheduledDate(),
                        OutcomeSource.TODAY,
                        now
                )
        );

        CardOccurrence next = occurrenceRepository.save(
                CardOccurrence.schedule(
                        current.getUserId(),
                        current.getCardId(),
                        targetDate,
                        current.getScheduledTime(),
                        current.getTimezone()
                )
        );

        linkRepository.save(OccurrenceLink.movedTo(current.getId(), next.getId(), now));
        return next.getId();
    }

    private void resolve(
            UUID userId,
            UUID occurrenceId,
            OccurrenceState state,
            OutcomeType outcomeType
    ) {
        CardOccurrence occurrence = loadOwnedOccurrence(userId, occurrenceId);
        Instant now = Instant.now();

        occurrence.resolveAs(state, now);

        outcomeRepository.save(
                CardOutcome.record(
                        occurrence.getId(),
                        outcomeType,
                        occurrence.getScheduledDate(),
                        OutcomeSource.TODAY,
                        now
                )
        );
    }

    private CardOccurrence loadOwnedOccurrence(UUID userId, UUID occurrenceId) {
        CardOccurrence occurrence = occurrenceRepository.findById(occurrenceId)
                .orElseThrow(() -> new IllegalArgumentException("occurrence not found"));

        if (!occurrence.getUserId().equals(userId)) {
            throw new IllegalArgumentException("occurrence does not belong to user");
        }

        return occurrence;
    }

    public record CreatedCard(UUID cardId, UUID occurrenceId) {
    }
}
