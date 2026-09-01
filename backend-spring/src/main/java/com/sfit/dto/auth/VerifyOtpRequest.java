package com.sfit.dto.auth;

import jakarta.validation.constraints.NotBlank;

public class VerifyOtpRequest {
    @NotBlank(message = "Mobile number and OTP are required.")
    private String phoneNumber;

    @NotBlank(message = "Mobile number and OTP are required.")
    private String otp;

    public VerifyOtpRequest() {}

    public VerifyOtpRequest(String phoneNumber, String otp) {
        this.phoneNumber = phoneNumber;
        this.otp = otp;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String phoneNumber;
        private String otp;
        public Builder phoneNumber(String p) { this.phoneNumber = p; return this; }
        public Builder otp(String o) { this.otp = o; return this; }
        public VerifyOtpRequest build() { return new VerifyOtpRequest(phoneNumber, otp); }
    }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
