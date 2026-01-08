package com.idxexchange.idxbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Status;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Simple health endpoint that returns 200 if actuator health is UP, otherwise 503.
 */
@RestController
@RequestMapping
public class HealthController {

    private final HealthEndpoint healthEndpoint;

    @Autowired
    public HealthController(HealthEndpoint healthEndpoint) {
        this.healthEndpoint = healthEndpoint;
    }

    @GetMapping("/health")
    public ResponseEntity<HealthComponent> health() {
        HealthComponent health = healthEndpoint.health();
        if (health.getStatus().equals(Status.UP)) {
            return ResponseEntity.ok(health);
        }
        return ResponseEntity.status(503).body(health);
    }
}
