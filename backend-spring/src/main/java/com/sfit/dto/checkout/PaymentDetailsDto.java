package com.sfit.dto.checkout;

public class PaymentDetailsDto {
    private String method = "UPI";
    private String upiId;
    private String transactionStatus = "SUCCESS";
    private String gateway = "Mock Razorpay / UPI Express";

    public PaymentDetailsDto() {}

    public PaymentDetailsDto(String method, String upiId, String transactionStatus, String gateway) {
        this.method = method != null ? method : "UPI";
        this.upiId = upiId;
        this.transactionStatus = transactionStatus != null ? transactionStatus : "SUCCESS";
        this.gateway = gateway != null ? gateway : "Mock Razorpay / UPI Express";
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String method = "UPI";
        private String upiId;
        private String transactionStatus = "SUCCESS";
        private String gateway = "Mock Razorpay / UPI Express";

        public Builder method(String method) { this.method = method; return this; }
        public Builder upiId(String upiId) { this.upiId = upiId; return this; }
        public Builder transactionStatus(String transactionStatus) { this.transactionStatus = transactionStatus; return this; }
        public Builder gateway(String gateway) { this.gateway = gateway; return this; }
        public PaymentDetailsDto build() { return new PaymentDetailsDto(method, upiId, transactionStatus, gateway); }
    }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }
    public String getTransactionStatus() { return transactionStatus; }
    public void setTransactionStatus(String transactionStatus) { this.transactionStatus = transactionStatus; }
    public String getGateway() { return gateway; }
    public void setGateway(String gateway) { this.gateway = gateway; }
}
