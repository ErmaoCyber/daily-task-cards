package com.ermaocyber.daybyday.card.repository;

import com.ermaocyber.daybyday.card.domain.CardOccurrence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface CardOccurrenceRepository extends JpaRepository<CardOccurrence, UUID> {

    List<CardOccurrence> findByUserIdAndScheduledDateOrderByScheduledTimeAsc(
            UUID userId,
            LocalDate scheduledDate
    );
}
