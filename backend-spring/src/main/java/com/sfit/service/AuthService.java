package com.sfit.service;

import com.sfit.dto.auth.AuthResponse;
import com.sfit.dto.auth.SendOtpRequest;
import com.sfit.dto.auth.UserDto;
import com.sfit.dto.auth.VerifyOtpRequest;
import com.sfit.model.User;
import com.sfit.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final WebClient webClient;

    @Value("${twilio.account.sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token:}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;

    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public AuthService(UserRepository userRepository, WebClient webClient) {
        this.userRepository = userRepository;
        this.webClient = webClient;
    }

    private static class OtpData {
        private final String otp;
        private final long expiresAt;

        public OtpData(String otp, long expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }

        public String getOtp() { return otp; }
        public long getExpiresAt() { return expiresAt; }
    }

    public AuthResponse sendOtp(SendOtpRequest request) {
        String phoneNumber = request.getPhoneNumber();
        String generatedOtp = String.valueOf(1000 + random.nextInt(9000));
        long expiresAt = System.currentTimeMillis() + (5 * 60 * 1000); // 5 mins

        otpStore.put(phoneNumber, new OtpData(generatedOtp, expiresAt));
        log.info("[SFit Auth] Generated OTP {} for phone: {}", generatedOtp, phoneNumber);

        // Attempt sending via Twilio if configured
        if (twilioAccountSid != null && !twilioAccountSid.isBlank() && !twilioAccountSid.contains("your_twilio")) {
            sendTwilioSms(phoneNumber, generatedOtp);
        } else {
            log.info("[SFit Auth Mock] Twilio not configured. Mock OTP for {} is: {}", phoneNumber, generatedOtp);
        }

        return AuthResponse.builder()
                .success(true)
                .message("OTP verification code sent successfully to your phone!")
                .build();
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String phoneNumber = request.getPhoneNumber();
        String otp = request.getOtp();

        OtpData storedData = otpStore.get(phoneNumber);
        if (storedData == null) {
            throw new IllegalArgumentException("No active OTP request found for this mobile number. Please send OTP again.");
        }

        if (System.currentTimeMillis() > storedData.getExpiresAt()) {
            otpStore.remove(phoneNumber);
            throw new IllegalArgumentException("The OTP has expired. Please request a new OTP.");
        }

        if (!storedData.getOtp().equals(otp)) {
            throw new IllegalArgumentException("Incorrect OTP. Please try again.");
        }

        // Valid OTP
        otpStore.remove(phoneNumber);

        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseGet(() -> {
                    String part1 = phoneNumber.length() >= 5 ? phoneNumber.substring(0, 5) : phoneNumber;
                    String part2 = phoneNumber.length() >= 10 ? phoneNumber.substring(5) : "";
                    User newUser = User.builder()
                            .id("usr_" + System.currentTimeMillis())
                            .phoneNumber(phoneNumber)
                            .name(String.format("SFit Shopper (+91 %s %s)", part1, part2))
                            .createdAt(Instant.now().toString())
                            .build();
                    return userRepository.save(newUser);
                });

        String token = "token_" + UUID.randomUUID().toString().replace("-", "");

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .phoneNumber(user.getPhoneNumber())
                .name(user.getName())
                .createdAt(user.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .success(true)
                .message("Login successful.")
                .token(token)
                .user(userDto)
                .build();
    }

    private void sendTwilioSms(String phoneNumber, String otpCode) {
        try {
            String formattedTo = "+91" + phoneNumber;
            String messageBody = "Your SFit login verification code is " + otpCode + ". Valid for 5 minutes.";
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";
            String authHeader = "Basic " + Base64.getEncoder().encodeToString((twilioAccountSid + ":" + twilioAuthToken).getBytes(StandardCharsets.UTF_8));

            webClient.post()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                    .body(BodyInserters.fromFormData("To", formattedTo)
                            .with("From", twilioPhoneNumber)
                            .with("Body", messageBody))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            log.info("[Twilio SMS Success] SMS sent to {}", formattedTo);
        } catch (Exception e) {
            log.warn("[Twilio SMS Error] Failed to send real SMS: {}", e.getMessage());
        }
    }
}
