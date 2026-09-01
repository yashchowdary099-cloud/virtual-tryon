package com.sfit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testSendOtpValidation() throws Exception {
        String invalidReq = "{\"phoneNumber\":\"123\"}";
        mockMvc.perform(post("/api/auth/send-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidReq))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testSendOtpSuccess() throws Exception {
        String validReq = "{\"phoneNumber\":\"9876543210\"}";
        mockMvc.perform(post("/api/auth/send-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validReq))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").exists());
    }
}
