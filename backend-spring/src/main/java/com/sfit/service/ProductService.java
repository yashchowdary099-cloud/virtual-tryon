package com.sfit.service;

import com.sfit.exception.ResourceNotFoundException;
import com.sfit.model.Product;
import com.sfit.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getProducts(String category, String search, String sort) {
        List<Product> products = productRepository.findAll();

        // 1. Filter by category
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("All")) {
            products = products.stream()
                    .filter(p -> p.getCategory() != null && p.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        // 2. Filter by search query
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            products = products.stream()
                    .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(q)) ||
                                 (p.getDescription() != null && p.getDescription().toLowerCase().contains(q)) ||
                                 (p.getBrand() != null && p.getBrand().toLowerCase().contains(q)) ||
                                 (p.getTags() != null && p.getTags().stream().anyMatch(t -> t.toLowerCase().contains(q))))
                    .collect(Collectors.toList());
        }

        // 3. Apply sorting
        if ("price-low".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparing(p -> p.getPrice() != null ? p.getPrice() : 0.0));
        } else if ("price-high".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparing((Product p) -> p.getPrice() != null ? p.getPrice() : 0.0).reversed());
        } else if ("rating".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparing((Product p) -> p.getRating() != null ? p.getRating() : 0.0).reversed());
        }

        return products;
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}
