package com.sfit;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CheckoutControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testCheckoutSuccess() throws Exception {
        String checkoutJson = """
            {
              "items": [
                {
                  "id": "myntra_men_1",
                  "name": "HIGHLANDER Men Slim Fit Navy Shirt",
                  "selectedSize": "L",
                  "price": 599.0,
                  "quantity": 1,
                  "image": "https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8117.png"
                }
              ],
              "customer": {
                "fullName": "Yash C",
                "phone": "+91 98765 43210",
                "city": "Bengaluru",
                "pincode": "560001"
              },
              "paymentMethod": "UPI",
              "upiId": "yash@upi"
            }
            """;

        mockMvc.perform(post("/api/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(checkoutJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.orderId", startsWith("SF-IND-")))
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.invoice.subtotal").value(599.0))
                .andExpect(jsonPath("$.invoice.totalGst").value(108))
                .andExpect(jsonPath("$.invoice.cgst").value(54))
                .andExpect(jsonPath("$.invoice.sgst").value(54))
                .andExpect(jsonPath("$.invoice.shippingCharge").value(99))
                .andExpect(jsonPath("$.invoice.grandTotal").value(806.0))
                .andExpect(jsonPath("$.items[0].id").value("myntra_men_1"));
    }

    @Test
    void testCheckoutEmptyCartValidationError() throws Exception {
        String emptyCheckoutJson = """
            {
              "items": [],
              "customer": {
                "fullName": "Yash C"
              }
            }
            """;

        mockMvc.perform(post("/api/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(emptyCheckoutJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
