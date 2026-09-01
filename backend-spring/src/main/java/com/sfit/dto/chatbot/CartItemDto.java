package com.sfit.dto.chatbot;

public class CartItemDto {
    private String id;
    private String name;
    private Double price;
    private Integer quantity = 1;
    private String selectedSize;
    private String image;

    public CartItemDto() {}

    public CartItemDto(String id, String name, Double price, Integer quantity, String selectedSize, String image) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity != null ? quantity : 1;
        this.selectedSize = selectedSize;
        this.image = image;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String name;
        private Double price;
        private Integer quantity = 1;
        private String selectedSize;
        private String image;

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder price(Double price) { this.price = price; return this; }
        public Builder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public Builder selectedSize(String selectedSize) { this.selectedSize = selectedSize; return this; }
        public Builder image(String image) { this.image = image; return this; }
        public CartItemDto build() { return new CartItemDto(id, name, price, quantity, selectedSize, image); }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getSelectedSize() { return selectedSize; }
    public void setSelectedSize(String selectedSize) { this.selectedSize = selectedSize; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
