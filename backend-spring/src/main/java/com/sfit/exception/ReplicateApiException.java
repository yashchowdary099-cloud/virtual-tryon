package com.sfit.exception;

public class ReplicateApiException extends RuntimeException {
    public ReplicateApiException(String message) {
        super(message);
    }

    public ReplicateApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
