package com.sfit.dto.checkout;

import jakarta.validation.constraints.NotNull;

public class CheckoutItemDto {
    private String id;
    private String name;
    private String selectedSize;

    @NotNull(message = "Product price is required")
    private Double price;

    private Integer quantity = 1;
    private String image;

    public CheckoutItemDto() {}

    public CheckoutItemDto(String id, String name, String selectedSize, Double price, Integer quantity, String image) {
        this.id = id;
        this.name = name;
        this.selectedSize = selectedSize;
        this.price = price;
        this.quantity = quantity != null ? quantity : 1;
        this.image = image;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String name;
        private String selectedSize;
        private Double price;
        private Integer quantity = 1;
        private String image;

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder selectedSize(String selectedSize) { this.selectedSize = selectedSize; return this; }
        public Builder price(Double price) { this.price = price; return this; }
        public Builder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public Builder image(String image) { this.image = image; return this; }
        public CheckoutItemDto build() { return new CheckoutItemDto(id, name, selectedSize, price, quantity, image); }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSelectedSize() { return selectedSize; }
    public void setSelectedSize(String selectedSize) { this.selectedSize = selectedSize; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
