package com.sfit.dto.chatbot;

public class SizeRecommendationDto {
    private int chestCm;
    private String recommendedSize;
    private String fitCategory;

    public SizeRecommendationDto() {}

    public SizeRecommendationDto(int chestCm, String recommendedSize, String fitCategory) {
        this.chestCm = chestCm;
        this.recommendedSize = recommendedSize;
        this.fitCategory = fitCategory;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private int chestCm;
        private String recommendedSize;
        private String fitCategory;

        public Builder chestCm(int chestCm) { this.chestCm = chestCm; return this; }
        public Builder recommendedSize(String recommendedSize) { this.recommendedSize = recommendedSize; return this; }
        public Builder fitCategory(String fitCategory) { this.fitCategory = fitCategory; return this; }
        public SizeRecommendationDto build() { return new SizeRecommendationDto(chestCm, recommendedSize, fitCategory); }
    }

    public int getChestCm() { return chestCm; }
    public void setChestCm(int chestCm) { this.chestCm = chestCm; }
    public String getRecommendedSize() { return recommendedSize; }
    public void setRecommendedSize(String recommendedSize) { this.recommendedSize = recommendedSize; }
    public String getFitCategory() { return fitCategory; }
    public void setFitCategory(String fitCategory) { this.fitCategory = fitCategory; }
}
