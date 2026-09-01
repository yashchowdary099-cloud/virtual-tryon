package com.sfit.model;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productId;

    private String name;

    private String size;

    private Double price;

    private Integer quantity;

    @Column(length = 1000)
    private String image;

    public OrderItem() {}

    public OrderItem(Long id, String productId, String name, String size, Double price, Integer quantity, String image) {
        this.id = id;
        this.productId = productId;
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
        private Long id;
        private String productId;
        private String name;
        private String size;
        private Double price;
        private Integer quantity;
        private String image;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder productId(String productId) { this.productId = productId; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder size(String size) { this.size = size; return this; }
        public Builder price(Double price) { this.price = price; return this; }
        public Builder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public Builder image(String image) { this.image = image; return this; }

        public OrderItem build() {
            return new OrderItem(id, productId, name, size, price, quantity, image);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
