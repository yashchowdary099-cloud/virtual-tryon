package com.sfit.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @Column(nullable = false, unique = true)
    private String id;

    @Column(nullable = false)
    private String name;

    private String brand;

    private String gender;

    private String category;

    private Double price;

    private Double mrp;

    private Double rating;

    private Integer reviewsCount;

    @Column(length = 2000)
    private String description;

    private String fabric;

    private String fitType;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_colors", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "color")
    private List<String> colors = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_sizes", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "size_name")
    private List<String> sizes = new ArrayList<>();

    @Column(length = 1000)
    private String image;

    @Column(length = 1000)
    private String overlayImage;

    private Boolean inStock;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    public Product() {}

    public Product(String id, String name, String brand, String gender, String category, Double price, Double mrp, Double rating, Integer reviewsCount, String description, String fabric, String fitType, List<String> colors, List<String> sizes, String image, String overlayImage, Boolean inStock, List<String> tags) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.gender = gender;
        this.category = category;
        this.price = price;
        this.mrp = mrp;
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.description = description;
        this.fabric = fabric;
        this.fitType = fitType;
        this.colors = colors != null ? colors : new ArrayList<>();
        this.sizes = sizes != null ? sizes : new ArrayList<>();
        this.image = image;
        this.overlayImage = overlayImage;
        this.inStock = inStock;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String name;
        private String brand;
        private String gender;
        private String category;
        private Double price;
        private Double mrp;
        private Double rating;
        private Integer reviewsCount;
        private String description;
        private String fabric;
        private String fitType;
        private List<String> colors = new ArrayList<>();
        private List<String> sizes = new ArrayList<>();
        private String image;
        private String overlayImage;
        private Boolean inStock;
        private List<String> tags = new ArrayList<>();

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder brand(String brand) { this.brand = brand; return this; }
        public Builder gender(String gender) { this.gender = gender; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder price(Double price) { this.price = price; return this; }
        public Builder mrp(Double mrp) { this.mrp = mrp; return this; }
        public Builder rating(Double rating) { this.rating = rating; return this; }
        public Builder reviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder fabric(String fabric) { this.fabric = fabric; return this; }
        public Builder fitType(String fitType) { this.fitType = fitType; return this; }
        public Builder colors(List<String> colors) { this.colors = colors; return this; }
        public Builder sizes(List<String> sizes) { this.sizes = sizes; return this; }
        public Builder image(String image) { this.image = image; return this; }
        public Builder overlayImage(String overlayImage) { this.overlayImage = overlayImage; return this; }
        public Builder inStock(Boolean inStock) { this.inStock = inStock; return this; }
        public Builder tags(List<String> tags) { this.tags = tags; return this; }

        public Product build() {
            return new Product(id, name, brand, gender, category, price, mrp, rating, reviewsCount, description, fabric, fitType, colors, sizes, image, overlayImage, inStock, tags);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Double getMrp() { return mrp; }
    public void setMrp(Double mrp) { this.mrp = mrp; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFabric() { return fabric; }
    public void setFabric(String fabric) { this.fabric = fabric; }
    public String getFitType() { return fitType; }
    public void setFitType(String fitType) { this.fitType = fitType; }
    public List<String> getColors() { return colors; }
    public void setColors(List<String> colors) { this.colors = colors; }
    public List<String> getSizes() { return sizes; }
    public void setSizes(List<String> sizes) { this.sizes = sizes; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getOverlayImage() { return overlayImage; }
    public void setOverlayImage(String overlayImage) { this.overlayImage = overlayImage; }
    public Boolean getInStock() { return inStock; }
    public void setInStock(Boolean inStock) { this.inStock = inStock; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
