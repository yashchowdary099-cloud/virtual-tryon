package com.sfit.dto.tryon;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ReplicatePredictionResponse {
    private String id;
    private String status;
    private Object output;
    private Object error;
    private Object detail;

    public ReplicatePredictionResponse() {}

    public ReplicatePredictionResponse(String id, String status, Object output, Object error, Object detail) {
        this.id = id;
        this.status = status;
        this.output = output;
        this.error = error;
        this.detail = detail;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String status;
        private Object output;
        private Object error;
        private Object detail;

        public Builder id(String id) { this.id = id; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder output(Object output) { this.output = output; return this; }
        public Builder error(Object error) { this.error = error; return this; }
        public Builder detail(Object detail) { this.detail = detail; return this; }
        public ReplicatePredictionResponse build() {
            return new ReplicatePredictionResponse(id, status, output, error, detail);
        }
    }

    public String extractOutputUrl() {
        if (output == null) {
            return null;
        }
        if (output instanceof List<?> list && !list.isEmpty()) {
            return String.valueOf(list.get(0));
        }
        if (output instanceof String str) {
            return str;
        }
        return output.toString();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Object getOutput() { return output; }
    public void setOutput(Object output) { this.output = output; }
    public Object getError() { return error; }
    public void setError(Object error) { this.error = error; }
    public Object getDetail() { return detail; }
    public void setDetail(Object detail) { this.detail = detail; }
}
