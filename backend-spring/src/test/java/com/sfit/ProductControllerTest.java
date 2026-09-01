package com.sfit;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testGetAllProducts() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.count", greaterThanOrEqualTo(13)))
                .andExpect(jsonPath("$.products").isArray());
    }

    @Test
    void testGetProductsFilterCategory() throws Exception {
        mockMvc.perform(get("/api/products").param("category", "Men's Shirts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.count", greaterThanOrEqualTo(1)));
    }

    @Test
    void testGetProductsSortPriceLow() throws Exception {
        mockMvc.perform(get("/api/products").param("sort", "price-low"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testGetProductByIdSuccess() throws Exception {
        mockMvc.perform(get("/api/products/myntra_men_1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.product.id").value("myntra_men_1"))
                .andExpect(jsonPath("$.product.name").value("HIGHLANDER Men Slim Fit Navy Shirt"));
    }

    @Test
    void testGetProductByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/products/non_existing_id"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Product not found"));
    }
}
