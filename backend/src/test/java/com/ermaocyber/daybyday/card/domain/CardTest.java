package com.ermaocyber.daybyday.card.domain;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CardTest {

    @Test
    void createCardWithValidValues() {
        UUID userId = UUID.randomUUID();

        Card card = Card.create(userId, "Morning swim", "Bring goggles");

        assertEquals(userId, card.getUserId());
        assertEquals("Morning swim", card.getTitle());
        assertEquals("Bring goggles", card.getNote());
        assertEquals(CardStatus.ACTIVE, card.getStatus());
        assertNotNull(card.getCreatedAt());
        assertEquals(card.getCreatedAt(), card.getUpdatedAt());
        assertNull(card.getArchivedAt());
    }

    @Test
    void rejectBlankTitle() {
        UUID userId = UUID.randomUUID();

        assertThrows(
                IllegalArgumentException.class,
                () -> Card.create(userId, "   ", null)
        );
    }

    @Test
    void rejectTitleLongerThan240Characters() {
        UUID userId = UUID.randomUUID();
        String title = "a".repeat(241);

        assertThrows(
                IllegalArgumentException.class,
                () -> Card.create(userId, title, null)
        );
    }
}
