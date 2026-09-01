package com.sfit.dto;

import com.sfit.model.Product;
import java.util.List;

public class ProductListResponse {
    private boolean success = true;
    private int count;
    private List<Product> products;

    public ProductListResponse() {}

    public ProductListResponse(boolean success, int count, List<Product> products) {
        this.success = success;
        this.count = count;
        this.products = products;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private boolean success = true;
        private int count;
        private List<Product> products;

        public Builder success(boolean success) { this.success = success; return this; }
        public Builder count(int count) { this.count = count; return this; }
        public Builder products(List<Product> products) { this.products = products; return this; }
        public ProductListResponse build() { return new ProductListResponse(success, count, products); }
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }
}
