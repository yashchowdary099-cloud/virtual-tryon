package com.sfit.controller;

import com.sfit.dto.checkout.CheckoutRequest;
import com.sfit.dto.checkout.CheckoutResponse;
import com.sfit.service.CheckoutService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping
    public ResponseEntity<CheckoutResponse> processCheckout(@Valid @RequestBody CheckoutRequest request) {
        CheckoutResponse response = checkoutService.processCheckout(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
