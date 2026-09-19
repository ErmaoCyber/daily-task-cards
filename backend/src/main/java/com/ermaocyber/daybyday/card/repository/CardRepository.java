package com.ermaocyber.daybyday.card.repository;

import com.ermaocyber.daybyday.card.domain.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {
}
