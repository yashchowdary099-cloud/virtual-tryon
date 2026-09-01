package com.sfit.dto.checkout;

public class ReceiptItemDto {
    private String id;
    private String name;
    private String size;
    private double price;
    private int quantity;
    private String image;

    public ReceiptItemDto() {}

    public ReceiptItemDto(String id, String name, String size, double price, int quantity, String image) {
        this.id = id;
        this.name = name;
        this.size = size;
        this.price = price;
        this.quantity = quantity;
        this.image = image;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String name;
        private String size;
        private double price;
        private int quantity;
        private String image;

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder size(String size) { this.size = size; return this; }
        public Builder price(double price) { this.price = price; return this; }
        public Builder quantity(int quantity) { this.quantity = quantity; return this; }
        public Builder image(String image) { this.image = image; return this; }
        public ReceiptItemDto build() { return new ReceiptItemDto(id, name, size, price, quantity, image); }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
