package com.sfit.dto;

public class HealthResponse {
    private String status;
    private String app;
    private String replicateApiTokenStatus;
    private String replicateTokenMasked;
    private String timestamp;

    public HealthResponse() {}

    public HealthResponse(String status, String app, String replicateApiTokenStatus, String replicateTokenMasked, String timestamp) {
        this.status = status;
        this.app = app;
        this.replicateApiTokenStatus = replicateApiTokenStatus;
        this.replicateTokenMasked = replicateTokenMasked;
        this.timestamp = timestamp;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String status;
        private String app;
        private String replicateApiTokenStatus;
        private String replicateTokenMasked;
        private String timestamp;

        public Builder status(String status) { this.status = status; return this; }
        public Builder app(String app) { this.app = app; return this; }
        public Builder replicateApiTokenStatus(String status) { this.replicateApiTokenStatus = status; return this; }
        public Builder replicateTokenMasked(String token) { this.replicateTokenMasked = token; return this; }
        public Builder timestamp(String timestamp) { this.timestamp = timestamp; return this; }
        public HealthResponse build() {
            return new HealthResponse(status, app, replicateApiTokenStatus, replicateTokenMasked, timestamp);
        }
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getApp() { return app; }
    public void setApp(String app) { this.app = app; }
    public String getReplicateApiTokenStatus() { return replicateApiTokenStatus; }
    public void setReplicateApiTokenStatus(String replicateApiTokenStatus) { this.replicateApiTokenStatus = replicateApiTokenStatus; }
    public String getReplicateTokenMasked() { return replicateTokenMasked; }
    public void setReplicateTokenMasked(String replicateTokenMasked) { this.replicateTokenMasked = replicateTokenMasked; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
