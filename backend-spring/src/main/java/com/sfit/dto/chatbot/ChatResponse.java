package com.sfit.dto.chatbot;

import com.sfit.model.Product;
import java.util.List;

public class ChatResponse {
    private boolean success = true;
    private String timestamp;
    private String text;
    private List<Product> products;
    private List<String> quickReplies;
    private SizeRecommendationDto sizeRecommendation;
    private boolean showHumanAgent;

    public ChatResponse() {}

    public ChatResponse(boolean success, String timestamp, String text, List<Product> products, List<String> quickReplies, SizeRecommendationDto sizeRecommendation, boolean showHumanAgent) {
        this.success = success;
        this.timestamp = timestamp;
        this.text = text;
        this.products = products;
        this.quickReplies = quickReplies;
        this.sizeRecommendation = sizeRecommendation;
        this.showHumanAgent = showHumanAgent;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private boolean success = true;
        private String timestamp;
        private String text;
        private List<Product> products;
        private List<String> quickReplies;
        private SizeRecommendationDto sizeRecommendation;
        private boolean showHumanAgent;

        public Builder success(boolean success) { this.success = success; return this; }
        public Builder timestamp(String timestamp) { this.timestamp = timestamp; return this; }
        public Builder text(String text) { this.text = text; return this; }
        public Builder products(List<Product> products) { this.products = products; return this; }
        public Builder quickReplies(List<String> quickReplies) { this.quickReplies = quickReplies; return this; }
        public Builder sizeRecommendation(SizeRecommendationDto sr) { this.sizeRecommendation = sr; return this; }
        public Builder showHumanAgent(boolean showHumanAgent) { this.showHumanAgent = showHumanAgent; return this; }
        public ChatResponse build() {
            return new ChatResponse(success, timestamp, text, products, quickReplies, sizeRecommendation, showHumanAgent);
        }
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }
    public List<String> getQuickReplies() { return quickReplies; }
    public void setQuickReplies(List<String> quickReplies) { this.quickReplies = quickReplies; }
    public SizeRecommendationDto getSizeRecommendation() { return sizeRecommendation; }
    public void setSizeRecommendation(SizeRecommendationDto sizeRecommendation) { this.sizeRecommendation = sizeRecommendation; }
    public boolean isShowHumanAgent() { return showHumanAgent; }
    public void setShowHumanAgent(boolean showHumanAgent) { this.showHumanAgent = showHumanAgent; }
}
