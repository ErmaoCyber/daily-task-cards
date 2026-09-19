package com.ermaocyber.daybyday.card.repository;

import com.ermaocyber.daybyday.card.domain.CardOutcome;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CardOutcomeRepository extends JpaRepository<CardOutcome, UUID> {
}
