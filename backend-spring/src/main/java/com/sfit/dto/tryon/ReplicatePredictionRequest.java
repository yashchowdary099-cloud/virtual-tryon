package com.sfit.dto.tryon;

public class ReplicatePredictionRequest {
    private ReplicateInput input;

    public ReplicatePredictionRequest() {}

    public ReplicatePredictionRequest(ReplicateInput input) {
        this.input = input;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private ReplicateInput input;

        public Builder input(ReplicateInput input) { this.input = input; return this; }
        public ReplicatePredictionRequest build() { return new ReplicatePredictionRequest(input); }
    }

    public ReplicateInput getInput() { return input; }
    public void setInput(ReplicateInput input) { this.input = input; }
}
