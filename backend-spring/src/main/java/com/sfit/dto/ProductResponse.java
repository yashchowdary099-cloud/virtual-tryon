package com.sfit.dto;

import com.sfit.model.Product;

public class ProductResponse {
    private boolean success = true;
    private Product product;

    public ProductResponse() {}

    public ProductResponse(boolean success, Product product) {
        this.success = success;
        this.product = product;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private boolean success = true;
        private Product product;

        public Builder success(boolean success) { this.success = success; return this; }
        public Builder product(Product product) { this.product = product; return this; }
        public ProductResponse build() { return new ProductResponse(success, product); }
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
}
