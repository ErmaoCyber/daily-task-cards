package com.ermaocyber.daybyday.user.application;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CurrentUserProvider {

    private final String devUserId;

    public CurrentUserProvider(@Value("${app.dev-user-id:}") String devUserId) {
        this.devUserId = devUserId;
    }

    public UUID currentUserId() {
        if (devUserId == null || devUserId.isBlank()) {
            throw new IllegalStateException("No current user configured. Set app.dev-user-id for local development.");
        }
        return UUID.fromString(devUserId);
    }
}
