package com.sfit.controller;

import com.sfit.dto.ProductListResponse;
import com.sfit.dto.ProductResponse;
import com.sfit.model.Product;
import com.sfit.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ProductListResponse> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort) {
        
        List<Product> products = productService.getProducts(category, search, sort);
        
        ProductListResponse response = ProductListResponse.builder()
                .success(true)
                .count(products.size())
                .products(products)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable String id) {
        Product product = productService.getProductById(id);
        ProductResponse response = ProductResponse.builder()
                .success(true)
                .product(product)
                .build();

        return ResponseEntity.ok(response);
    }
}
