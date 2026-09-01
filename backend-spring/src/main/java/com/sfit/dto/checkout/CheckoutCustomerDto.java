package com.sfit.dto.checkout;

public class CheckoutCustomerDto {
    private String fullName = "SFit User";
    private String phone = "+91 98765 43210";
    private String city = "Bengaluru";
    private String pincode = "560001";

    public CheckoutCustomerDto() {}

    public CheckoutCustomerDto(String fullName, String phone, String city, String pincode) {
        this.fullName = fullName != null ? fullName : "SFit User";
        this.phone = phone != null ? phone : "+91 98765 43210";
        this.city = city != null ? city : "Bengaluru";
        this.pincode = pincode != null ? pincode : "560001";
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String fullName = "SFit User";
        private String phone = "+91 98765 43210";
        private String city = "Bengaluru";
        private String pincode = "560001";

        public Builder fullName(String n) { this.fullName = n; return this; }
        public Builder phone(String p) { this.phone = p; return this; }
        public Builder city(String c) { this.city = c; return this; }
        public Builder pincode(String pc) { this.pincode = pc; return this; }
        public CheckoutCustomerDto build() { return new CheckoutCustomerDto(fullName, phone, city, pincode); }
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
}
