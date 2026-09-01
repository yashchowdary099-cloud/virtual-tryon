package com.sfit.dto.chatbot;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ChatRequest {
    private String message = "";
    private List<CartItemDto> cart = new ArrayList<>();
    private UserMeasurementsDto userMeasurements;
    private Map<String, Object> currentProduct;

    public ChatRequest() {}

    public ChatRequest(String message, List<CartItemDto> cart, UserMeasurementsDto userMeasurements, Map<String, Object> currentProduct) {
        this.message = message != null ? message : "";
        this.cart = cart != null ? cart : new ArrayList<>();
        this.userMeasurements = userMeasurements;
        this.currentProduct = currentProduct;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String message = "";
        private List<CartItemDto> cart = new ArrayList<>();
        private UserMeasurementsDto userMeasurements;
        private Map<String, Object> currentProduct;

        public Builder message(String message) { this.message = message; return this; }
        public Builder cart(List<CartItemDto> cart) { this.cart = cart; return this; }
        public Builder userMeasurements(UserMeasurementsDto userMeasurements) { this.userMeasurements = userMeasurements; return this; }
        public Builder currentProduct(Map<String, Object> currentProduct) { this.currentProduct = currentProduct; return this; }
        public ChatRequest build() { return new ChatRequest(message, cart, userMeasurements, currentProduct); }
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<CartItemDto> getCart() { return cart; }
    public void setCart(List<CartItemDto> cart) { this.cart = cart; }
    public UserMeasurementsDto getUserMeasurements() { return userMeasurements; }
    public void setUserMeasurements(UserMeasurementsDto userMeasurements) { this.userMeasurements = userMeasurements; }
    public Map<String, Object> getCurrentProduct() { return currentProduct; }
    public void setCurrentProduct(Map<String, Object> currentProduct) { this.currentProduct = currentProduct; }
}
