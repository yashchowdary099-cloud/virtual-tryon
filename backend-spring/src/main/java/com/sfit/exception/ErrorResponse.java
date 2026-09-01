package com.sfit.exception;

import java.time.Instant;
import java.util.Map;

public class ErrorResponse {
    private boolean success = false;
    private String message;
    private Map<String, String> errors;
    private String timestamp = Instant.now().toString();

    public ErrorResponse() {}

    public ErrorResponse(String message) {
        this.success = false;
        this.message = message;
        this.timestamp = Instant.now().toString();
    }

    public ErrorResponse(boolean success, String message, Map<String, String> errors, String timestamp) {
        this.success = success;
        this.message = message;
        this.errors = errors;
        this.timestamp = timestamp != null ? timestamp : Instant.now().toString();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private boolean success = false;
        private String message;
        private Map<String, String> errors;
        private String timestamp = Instant.now().toString();

        public Builder success(boolean success) { this.success = success; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder errors(Map<String, String> errors) { this.errors = errors; return this; }
        public Builder timestamp(String timestamp) { this.timestamp = timestamp; return this; }
        public ErrorResponse build() { return new ErrorResponse(success, message, errors, timestamp); }
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Map<String, String> getErrors() { return errors; }
    public void setErrors(Map<String, String> errors) { this.errors = errors; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
