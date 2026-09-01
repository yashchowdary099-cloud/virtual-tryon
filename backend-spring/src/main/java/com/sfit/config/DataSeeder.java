package com.sfit.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sfit.model.Product;
import com.sfit.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final ProductRepository productRepository;
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    public DataSeeder(ProductRepository productRepository, ResourceLoader resourceLoader, ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.resourceLoader = resourceLoader;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            log.info("Product database is empty. Seeding initial product catalog from products.json...");
            Resource resource = resourceLoader.getResource("classpath:data/products.json");
            if (resource.exists()) {
                try (InputStream inputStream = resource.getInputStream()) {
                    List<Product> products = objectMapper.readValue(inputStream, new TypeReference<List<Product>>() {});
                    productRepository.saveAll(products);
                    log.info(" Successfully seeded {} products into database.", products.size());
                } catch (Exception e) {
                    log.error("Failed to seed product data: {}", e.getMessage(), e);
                }
            } else {
                log.warn("products.json not found in classpath:data/products.json");
            }
        } else {
            log.info("Product database already contains {} products. Skipping seeding.", productRepository.count());
        }
    }
}
