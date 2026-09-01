package com.sfit.controller;

import com.sfit.dto.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Value("${replicate.api.token:}")
    private String replicateToken;

    @GetMapping
    public ResponseEntity<HealthResponse> getHealth() {
        boolean isConfigured = replicateToken != null 
                && !replicateToken.isBlank() 
                && !replicateToken.contains("your_replicate");

        String maskedToken = isConfigured 
                ? replicateToken.substring(0, Math.min(5, replicateToken.length())) + "..." + 
                  (replicateToken.length() > 4 ? replicateToken.substring(replicateToken.length() - 4) : "")
                : "NOT CONFIGURED (Placeholder)";

        HealthResponse response = HealthResponse.builder()
                .status("online")
                .app("SFit Virtual Try-On & AI Assistant API")
                .replicateApiTokenStatus(isConfigured ? "Valid Format Loaded" : "Missing / Placeholder")
                .replicateTokenMasked(maskedToken)
                .timestamp(Instant.now().toString())
                .build();

        return ResponseEntity.ok(response);
    }
}
