package com.sfit.dto.checkout;

public class InvoiceDto {
    private String currency = "₹";
    private int itemsCount;
    private double subtotal;
    private String gstRate = "18%";
    private long cgst;
    private long sgst;
    private long totalGst;
    private long shippingCharge;
    private double grandTotal;

    public InvoiceDto() {}

    public InvoiceDto(String currency, int itemsCount, double subtotal, String gstRate, long cgst, long sgst, long totalGst, long shippingCharge, double grandTotal) {
        this.currency = currency != null ? currency : "₹";
        this.itemsCount = itemsCount;
        this.subtotal = subtotal;
        this.gstRate = gstRate != null ? gstRate : "18%";
        this.cgst = cgst;
        this.sgst = sgst;
        this.totalGst = totalGst;
        this.shippingCharge = shippingCharge;
        this.grandTotal = grandTotal;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String currency = "₹";
        private int itemsCount;
        private double subtotal;
        private String gstRate = "18%";
        private long cgst;
        private long sgst;
        private long totalGst;
        private long shippingCharge;
        private double grandTotal;

        public Builder currency(String currency) { this.currency = currency; return this; }
        public Builder itemsCount(int itemsCount) { this.itemsCount = itemsCount; return this; }
        public Builder subtotal(double subtotal) { this.subtotal = subtotal; return this; }
        public Builder gstRate(String gstRate) { this.gstRate = gstRate; return this; }
        public Builder cgst(long cgst) { this.cgst = cgst; return this; }
        public Builder sgst(long sgst) { this.sgst = sgst; return this; }
        public Builder totalGst(long totalGst) { this.totalGst = totalGst; return this; }
        public Builder shippingCharge(long shippingCharge) { this.shippingCharge = shippingCharge; return this; }
        public Builder grandTotal(double grandTotal) { this.grandTotal = grandTotal; return this; }
        public InvoiceDto build() {
            return new InvoiceDto(currency, itemsCount, subtotal, gstRate, cgst, sgst, totalGst, shippingCharge, grandTotal);
        }
    }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public int getItemsCount() { return itemsCount; }
    public void setItemsCount(int itemsCount) { this.itemsCount = itemsCount; }
    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }
    public String getGstRate() { return gstRate; }
    public void setGstRate(String gstRate) { this.gstRate = gstRate; }
    public long getCgst() { return cgst; }
    public void setCgst(long cgst) { this.cgst = cgst; }
    public long getSgst() { return sgst; }
    public void setSgst(long sgst) { this.sgst = sgst; }
    public long getTotalGst() { return totalGst; }
    public void setTotalGst(long totalGst) { this.totalGst = totalGst; }
    public long getShippingCharge() { return shippingCharge; }
    public void setShippingCharge(long shippingCharge) { this.shippingCharge = shippingCharge; }
    public double getGrandTotal() { return grandTotal; }
    public void setGrandTotal(double grandTotal) { this.grandTotal = grandTotal; }
}
