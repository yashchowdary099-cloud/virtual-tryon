package com.sfit.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @Column(nullable = false, unique = true)
    private String orderId;

    private String status;

    private String timestamp;

    private String customerName;

    private String customerPhone;

    private String customerCity;

    private String customerPincode;

    private String paymentMethod;

    private String upiId;

    private Double subtotal;

    private Double totalGst;

    private Double cgst;

    private Double sgst;

    private Double shippingCharge;

    private Double grandTotal;

    private String deliveryEstimate;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items = new ArrayList<>();

    public Order() {}

    public Order(String orderId, String status, String timestamp, String customerName, String customerPhone, String customerCity, String customerPincode, String paymentMethod, String upiId, Double subtotal, Double totalGst, Double cgst, Double sgst, Double shippingCharge, Double grandTotal, String deliveryEstimate, List<OrderItem> items) {
        this.orderId = orderId;
        this.status = status;
        this.timestamp = timestamp;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.customerCity = customerCity;
        this.customerPincode = customerPincode;
        this.paymentMethod = paymentMethod;
        this.upiId = upiId;
        this.subtotal = subtotal;
        this.totalGst = totalGst;
        this.cgst = cgst;
        this.sgst = sgst;
        this.shippingCharge = shippingCharge;
        this.grandTotal = grandTotal;
        this.deliveryEstimate = deliveryEstimate;
        this.items = items != null ? items : new ArrayList<>();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String orderId;
        private String status;
        private String timestamp;
        private String customerName;
        private String customerPhone;
        private String customerCity;
        private String customerPincode;
        private String paymentMethod;
        private String upiId;
        private Double subtotal;
        private Double totalGst;
        private Double cgst;
        private Double sgst;
        private Double shippingCharge;
        private Double grandTotal;
        private String deliveryEstimate;
        private List<OrderItem> items = new ArrayList<>();

        public Builder orderId(String id) { this.orderId = id; return this; }
        public Builder status(String s) { this.status = s; return this; }
        public Builder timestamp(String t) { this.timestamp = t; return this; }
        public Builder customerName(String n) { this.customerName = n; return this; }
        public Builder customerPhone(String p) { this.customerPhone = p; return this; }
        public Builder customerCity(String c) { this.customerCity = c; return this; }
        public Builder customerPincode(String pc) { this.customerPincode = pc; return this; }
        public Builder paymentMethod(String m) { this.paymentMethod = m; return this; }
        public Builder upiId(String u) { this.upiId = u; return this; }
        public Builder subtotal(Double s) { this.subtotal = s; return this; }
        public Builder totalGst(Double g) { this.totalGst = g; return this; }
        public Builder cgst(Double c) { this.cgst = c; return this; }
        public Builder sgst(Double s) { this.sgst = s; return this; }
        public Builder shippingCharge(Double sc) { this.shippingCharge = sc; return this; }
        public Builder grandTotal(Double gt) { this.grandTotal = gt; return this; }
        public Builder deliveryEstimate(String de) { this.deliveryEstimate = de; return this; }
        public Builder items(List<OrderItem> items) { this.items = items; return this; }

        public Order build() {
            return new Order(orderId, status, timestamp, customerName, customerPhone, customerCity, customerPincode, paymentMethod, upiId, subtotal, totalGst, cgst, sgst, shippingCharge, grandTotal, deliveryEstimate, items);
        }
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getCustomerCity() { return customerCity; }
    public void setCustomerCity(String customerCity) { this.customerCity = customerCity; }
    public String getCustomerPincode() { return customerPincode; }
    public void setCustomerPincode(String customerPincode) { this.customerPincode = customerPincode; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }
    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
    public Double getTotalGst() { return totalGst; }
    public void setTotalGst(Double totalGst) { this.totalGst = totalGst; }
    public Double getCgst() { return cgst; }
    public void setCgst(Double cgst) { this.cgst = cgst; }
    public Double getSgst() { return sgst; }
    public void setSgst(Double sgst) { this.sgst = sgst; }
    public Double getShippingCharge() { return shippingCharge; }
    public void setShippingCharge(Double shippingCharge) { this.shippingCharge = shippingCharge; }
    public Double getGrandTotal() { return grandTotal; }
    public void setGrandTotal(Double grandTotal) { this.grandTotal = grandTotal; }
    public String getDeliveryEstimate() { return deliveryEstimate; }
    public void setDeliveryEstimate(String deliveryEstimate) { this.deliveryEstimate = deliveryEstimate; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
