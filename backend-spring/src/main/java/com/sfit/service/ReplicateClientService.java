package com.sfit.service;

import com.sfit.dto.tryon.ReplicateInput;
import com.sfit.dto.tryon.ReplicatePredictionRequest;
import com.sfit.dto.tryon.ReplicatePredictionResponse;
import com.sfit.exception.ReplicateApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

@Service
public class ReplicateClientService {

    private static final Logger log = LoggerFactory.getLogger(ReplicateClientService.class);
    private final WebClient webClient;

    @Value("${replicate.api.token:}")
    private String replicateApiToken;

    @Value("${replicate.api.model-endpoint:https://api.replicate.com/v1/models/cuuupid/idm-vton/predictions}")
    private String modelEndpoint;

    @Value("${replicate.api.poll-base-url:https://api.replicate.com/v1/predictions/}")
    private String pollBaseUrl;

    public ReplicateClientService(WebClient webClient) {
        this.webClient = webClient;
    }

    public String runVirtualTryOn(String humanImageBase64, String garmentImageUrl, String category, String garmentDescription) {
        log.info("=================== [REPLICATE AI DIAGNOSTIC START] ===================");
        
        // 1. Confirm API Token
        if (replicateApiToken == null || replicateApiToken.isBlank() || replicateApiToken.contains("your_replicate")) {
            log.error("❌ Token Status: MISSING OR PLACEHOLDER");
            throw new ReplicateApiException("REPLICATE_API_TOKEN is missing or set to placeholder in application.properties");
        }

        String maskedToken = replicateApiToken.substring(0, Math.min(5, replicateApiToken.length())) + "..." + 
                (replicateApiToken.length() > 4 ? replicateApiToken.substring(replicateApiToken.length() - 4) : "");
        log.info("✅ Loaded Token (Masked): {}", maskedToken);
        log.info("Target Model Endpoint: {}", modelEndpoint);

        // 2. Build Request Payload
        ReplicateInput input = ReplicateInput.builder()
                .humanImg(humanImageBase64)
                .garmImg(garmentImageUrl != null && !garmentImageUrl.isBlank() 
                        ? garmentImageUrl 
                        : "https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8117.png")
                .category(category != null && !category.isBlank() ? category : "upper_body")
                .garmentDes(garmentDescription != null && !garmentDescription.isBlank() ? garmentDescription : "casual shirt")
                .build();

        ReplicatePredictionRequest requestPayload = new ReplicatePredictionRequest(input);

        log.info("Sending POST request to Replicate API endpoint: {}", modelEndpoint);

        // 3. Initiate Prediction via WebClient
        ReplicatePredictionResponse initialResponse;
        try {
            initialResponse = webClient.post()
                    .uri(modelEndpoint)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + replicateApiToken.trim())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestPayload)
                    .retrieve()
                    .bodyToMono(ReplicatePredictionResponse.class)
                    .block(Duration.ofSeconds(30));
        } catch (WebClientResponseException e) {
            log.error("❌ Replicate API Call Failed (HTTP {}): {}", e.getStatusCode(), e.getResponseBodyAsString());
            log.info("=================== [REPLICATE AI DIAGNOSTIC END] ===================");
            throw new ReplicateApiException("Replicate API HTTP " + e.getStatusCode() + ": " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("❌ Failed to initiate Replicate prediction: {}", e.getMessage());
            log.info("=================== [REPLICATE AI DIAGNOSTIC END] ===================");
            throw new ReplicateApiException("Failed to communicate with Replicate API: " + e.getMessage(), e);
        }

        if (initialResponse == null || initialResponse.getId() == null) {
            throw new ReplicateApiException("Replicate API returned empty prediction response");
        }

        String predictionId = initialResponse.getId();
        log.info("✅ Prediction Created Successfully! ID: {} | Initial Status: {}", predictionId, initialResponse.getStatus());

        // 4. Polling Loop for Async Image Generation
        String pollUrl = pollBaseUrl.endsWith("/") ? pollBaseUrl + predictionId : pollBaseUrl + "/" + predictionId;
        int maxAttempts = 36;
        int attempt = 0;

        while (attempt < maxAttempts) {
            try {
                Thread.sleep(2500);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new ReplicateApiException("Virtual try-on polling interrupted");
            }
            attempt++;

            ReplicatePredictionResponse pollResponse;
            try {
                pollResponse = webClient.get()
                        .uri(pollUrl)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + replicateApiToken.trim())
                        .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .retrieve()
                        .bodyToMono(ReplicatePredictionResponse.class)
                        .block(Duration.ofSeconds(15));
            } catch (Exception pe) {
                log.warn("[Replicate Poll {}/{}] Temporary network check error: {}", attempt, maxAttempts, pe.getMessage());
                continue;
            }

            if (pollResponse != null) {
                String status = pollResponse.getStatus();
                log.info("[Replicate Poll {}/{}] ID: {} | Status: \"{}\"", attempt, maxAttempts, predictionId, status);

                if ("succeeded".equalsIgnoreCase(status)) {
                    String outputUrl = pollResponse.extractOutputUrl();
                    log.info("✅ Replicate Model Success! Output Image URL: {}", outputUrl);
                    log.info("=================== [REPLICATE AI DIAGNOSTIC END] ===================");
                    return outputUrl;
                }

                if ("failed".equalsIgnoreCase(status) || "canceled".equalsIgnoreCase(status)) {
                    log.error("❌ Model Execution {}: Error={}", status, pollResponse.getError());
                    log.info("=================== [REPLICATE AI DIAGNOSTIC END] ===================");
                    throw new ReplicateApiException("Replicate IDM-VTON model generation failed: " + pollResponse.getError());
                }
            }
        }

        throw new ReplicateApiException("Replicate IDM-VTON model generation timed out after 90 seconds");
    }
}
