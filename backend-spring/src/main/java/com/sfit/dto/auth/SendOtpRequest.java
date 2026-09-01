package com.sfit.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class SendOtpRequest {
    @NotBlank(message = "Please enter a valid 10-digit mobile number.")
    @Pattern(regexp = "^\\d{10}$", message = "Please enter a valid 10-digit mobile number.")
    private String phoneNumber;

    public SendOtpRequest() {}

    public SendOtpRequest(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String phoneNumber;
        public Builder phoneNumber(String p) { this.phoneNumber = p; return this; }
        public SendOtpRequest build() { return new SendOtpRequest(phoneNumber); }
    }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}
