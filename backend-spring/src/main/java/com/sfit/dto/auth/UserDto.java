package com.sfit.dto.auth;

public class UserDto {
    private String id;
    private String phoneNumber;
    private String name;
    private String createdAt;

    public UserDto() {}

    public UserDto(String id, String phoneNumber, String name, String createdAt) {
        this.id = id;
        this.phoneNumber = phoneNumber;
        this.name = name;
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String phoneNumber;
        private String name;
        private String createdAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder createdAt(String createdAt) { this.createdAt = createdAt; return this; }
        public UserDto build() { return new UserDto(id, phoneNumber, name, createdAt); }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
