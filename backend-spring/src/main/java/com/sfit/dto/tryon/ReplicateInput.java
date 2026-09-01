package com.sfit.dto.tryon;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ReplicateInput {

    @JsonProperty("human_img")
    private String humanImg;

    @JsonProperty("garm_img")
    private String garmImg;

    private String category = "upper_body";

    @JsonProperty("garment_des")
    private String garmentDes = "casual shirt";

    public ReplicateInput() {}

    public ReplicateInput(String humanImg, String garmImg, String category, String garmentDes) {
        this.humanImg = humanImg;
        this.garmImg = garmImg;
        this.category = category != null ? category : "upper_body";
        this.garmentDes = garmentDes != null ? garmentDes : "casual shirt";
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String humanImg;
        private String garmImg;
        private String category = "upper_body";
        private String garmentDes = "casual shirt";

        public Builder humanImg(String humanImg) { this.humanImg = humanImg; return this; }
        public Builder garmImg(String garmImg) { this.garmImg = garmImg; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder garmentDes(String garmentDes) { this.garmentDes = garmentDes; return this; }
        public ReplicateInput build() { return new ReplicateInput(humanImg, garmImg, category, garmentDes); }
    }

    public String getHumanImg() { return humanImg; }
    public void setHumanImg(String humanImg) { this.humanImg = humanImg; }
    public String getGarmImg() { return garmImg; }
    public void setGarmImg(String garmImg) { this.garmImg = garmImg; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getGarmentDes() { return garmentDes; }
    public void setGarmentDes(String garmentDes) { this.garmentDes = garmentDes; }
}
