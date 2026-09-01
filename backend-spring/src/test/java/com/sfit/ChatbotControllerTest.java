package com.sfit;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ChatbotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testChatbotIntentSizeCalculation() throws Exception {
        String requestJson = "{\"message\":\"chest 108 cm\"}";
        mockMvc.perform(post("/api/chatbot")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.sizeRecommendation.recommendedSize").value("L"))
                .andExpect(jsonPath("$.sizeRecommendation.chestCm").value(108))
                .andExpect(jsonPath("$.text", containsString("Size L")));
    }

    @Test
    void testChatbotIntentProductDiscovery() throws Exception {
        String requestJson = "{\"message\":\"Show shirts under 1000\"}";
        mockMvc.perform(post("/api/chatbot")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.products").isArray());
    }

    @Test
    void testChatbotIntentCartSummary() throws Exception {
        String requestJson = "{\"message\":\"what is in my cart?\",\"cart\":[{\"id\":\"myntra_men_1\",\"price\":599,\"quantity\":2}]}";
        mockMvc.perform(post("/api/chatbot")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.text", containsString("Shopping Bag Summary")));
    }

    @Test
    void testChatbotIntentTryOnGuidance() throws Exception {
        String requestJson = "{\"message\":\"how does virtual try on work?\"}";
        mockMvc.perform(post("/api/chatbot")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.text", containsString("5 Easy Steps")));
    }
}
