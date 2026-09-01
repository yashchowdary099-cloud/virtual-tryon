package com.sfit.dto.checkout;

import java.util.List;

public class CheckoutResponse {
    private boolean success = true;
    private String orderId;
    private String status = "CONFIRMED";
    private String timestamp;
    private CheckoutCustomerDto customer;
    private PaymentDetailsDto paymentDetails;
    private InvoiceDto invoice;
    private List<ReceiptItemDto> items;
    private String deliveryEstimate;

    public CheckoutResponse() {}

    public CheckoutResponse(boolean success, String orderId, String status, String timestamp, CheckoutCustomerDto customer, PaymentDetailsDto paymentDetails, InvoiceDto invoice, List<ReceiptItemDto> items, String deliveryEstimate) {
        this.success = success;
        this.orderId = orderId;
        this.status = status != null ? status : "CONFIRMED";
        this.timestamp = timestamp;
        this.customer = customer;
        this.paymentDetails = paymentDetails;
        this.invoice = invoice;
        this.items = items;
        this.deliveryEstimate = deliveryEstimate;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private boolean success = true;
        private String orderId;
        private String status = "CONFIRMED";
        private String timestamp;
        private CheckoutCustomerDto customer;
        private PaymentDetailsDto paymentDetails;
        private InvoiceDto invoice;
        private List<ReceiptItemDto> items;
        private String deliveryEstimate;

        public Builder success(boolean success) { this.success = success; return this; }
        public Builder orderId(String orderId) { this.orderId = orderId; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder timestamp(String timestamp) { this.timestamp = timestamp; return this; }
        public Builder customer(CheckoutCustomerDto customer) { this.customer = customer; return this; }
        public Builder paymentDetails(PaymentDetailsDto paymentDetails) { this.paymentDetails = paymentDetails; return this; }
        public Builder invoice(InvoiceDto invoice) { this.invoice = invoice; return this; }
        public Builder items(List<ReceiptItemDto> items) { this.items = items; return this; }
        public Builder deliveryEstimate(String deliveryEstimate) { this.deliveryEstimate = deliveryEstimate; return this; }
        public CheckoutResponse build() {
            return new CheckoutResponse(success, orderId, status, timestamp, customer, paymentDetails, invoice, items, deliveryEstimate);
        }
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public CheckoutCustomerDto getCustomer() { return customer; }
    public void setCustomer(CheckoutCustomerDto customer) { this.customer = customer; }
    public PaymentDetailsDto getPaymentDetails() { return paymentDetails; }
    public void setPaymentDetails(PaymentDetailsDto paymentDetails) { this.paymentDetails = paymentDetails; }
    public InvoiceDto getInvoice() { return invoice; }
    public void setInvoice(InvoiceDto invoice) { this.invoice = invoice; }
    public List<ReceiptItemDto> getItems() { return items; }
    public void setItems(List<ReceiptItemDto> items) { this.items = items; }
    public String getDeliveryEstimate() { return deliveryEstimate; }
    public void setDeliveryEstimate(String deliveryEstimate) { this.deliveryEstimate = deliveryEstimate; }
}
