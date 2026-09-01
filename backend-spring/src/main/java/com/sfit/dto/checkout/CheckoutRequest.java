package com.sfit.dto.checkout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class CheckoutRequest {

    @NotEmpty(message = "Cart cannot be empty")
    @Valid
    private List<CheckoutItemDto> items;

    private CheckoutCustomerDto customer;

    private String paymentMethod = "UPI";

    private String upiId;

    public CheckoutRequest() {}

    public CheckoutRequest(List<CheckoutItemDto> items, CheckoutCustomerDto customer, String paymentMethod, String upiId) {
        this.items = items;
        this.customer = customer;
        this.paymentMethod = paymentMethod != null ? paymentMethod : "UPI";
        this.upiId = upiId;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private List<CheckoutItemDto> items;
        private CheckoutCustomerDto customer;
        private String paymentMethod = "UPI";
        private String upiId;

        public Builder items(List<CheckoutItemDto> items) { this.items = items; return this; }
        public Builder customer(CheckoutCustomerDto customer) { this.customer = customer; return this; }
        public Builder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public Builder upiId(String upiId) { this.upiId = upiId; return this; }
        public CheckoutRequest build() { return new CheckoutRequest(items, customer, paymentMethod, upiId); }
    }

    public List<CheckoutItemDto> getItems() { return items; }
    public void setItems(List<CheckoutItemDto> items) { this.items = items; }
    public CheckoutCustomerDto getCustomer() { return customer; }
    public void setCustomer(CheckoutCustomerDto customer) { this.customer = customer; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }
}
