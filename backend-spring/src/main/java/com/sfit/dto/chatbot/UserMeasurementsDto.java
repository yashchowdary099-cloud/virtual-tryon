package com.sfit.dto.chatbot;

public class UserMeasurementsDto {
    private Integer chestCm;
    private Integer waistCm;
    private Integer shoulderCm;
    private Integer heightCm;

    public UserMeasurementsDto() {}

    public UserMeasurementsDto(Integer chestCm, Integer waistCm, Integer shoulderCm, Integer heightCm) {
        this.chestCm = chestCm;
        this.waistCm = waistCm;
        this.shoulderCm = shoulderCm;
        this.heightCm = heightCm;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Integer chestCm;
        private Integer waistCm;
        private Integer shoulderCm;
        private Integer heightCm;

        public Builder chestCm(Integer chestCm) { this.chestCm = chestCm; return this; }
        public Builder waistCm(Integer waistCm) { this.waistCm = waistCm; return this; }
        public Builder shoulderCm(Integer shoulderCm) { this.shoulderCm = shoulderCm; return this; }
        public Builder heightCm(Integer heightCm) { this.heightCm = heightCm; return this; }
        public UserMeasurementsDto build() { return new UserMeasurementsDto(chestCm, waistCm, shoulderCm, heightCm); }
    }

    public Integer getChestCm() { return chestCm; }
    public void setChestCm(Integer chestCm) { this.chestCm = chestCm; }
    public Integer getWaistCm() { return waistCm; }
    public void setWaistCm(Integer waistCm) { this.waistCm = waistCm; }
    public Integer getShoulderCm() { return shoulderCm; }
    public void setShoulderCm(Integer shoulderCm) { this.shoulderCm = shoulderCm; }
    public Integer getHeightCm() { return heightCm; }
    public void setHeightCm(Integer heightCm) { this.heightCm = heightCm; }
}
