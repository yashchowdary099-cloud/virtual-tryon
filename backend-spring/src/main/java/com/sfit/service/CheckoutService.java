package com.sfit.service;

import com.sfit.dto.checkout.*;
import com.sfit.model.Order;
import com.sfit.model.OrderItem;
import com.sfit.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class CheckoutService {

    private static final Logger log = LoggerFactory.getLogger(CheckoutService.class);
    private final OrderRepository orderRepository;
    private final Random random = new Random();

    public CheckoutService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public CheckoutResponse processCheckout(CheckoutRequest request) {
        List<CheckoutItemDto> items = request.getItems();
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Cart cannot be empty");
        }

        // Calculate financials in INR (₹)
        double subtotal = items.stream()
                .mapToDouble(i -> (i.getPrice() != null ? i.getPrice() : 0.0) * (i.getQuantity() != null ? i.getQuantity() : 1))
                .sum();

        double gstRate = 0.18;
        long totalGst = Math.round(subtotal * gstRate);
        long cgst = Math.round(totalGst / 2.0);
        long sgst = Math.round(totalGst / 2.0);

        long shippingCharge = subtotal >= 1999 ? 0 : 99;
        double grandTotal = subtotal + totalGst + shippingCharge;

        String orderId = "SF-IND-" + (100000 + random.nextInt(900000));
        LocalDate deliveryDate = LocalDate.now().plusDays(4);
        String formattedDeliveryDate = deliveryDate.format(DateTimeFormatter.ofPattern("EEE, MMM d, yyyy", Locale.ENGLISH));

        CheckoutCustomerDto customer = request.getCustomer() != null ? request.getCustomer() : new CheckoutCustomerDto();
        String paymentMethod = request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI";
        String upiId = "UPI".equalsIgnoreCase(paymentMethod) 
                ? (request.getUpiId() != null && !request.getUpiId().isBlank() ? request.getUpiId() : "user@upi") 
                : null;

        // Persist Order in JPA
        List<OrderItem> orderEntities = items.stream().map(i -> OrderItem.builder()
                .productId(i.getId())
                .name(i.getName())
                .size(i.getSelectedSize() != null ? i.getSelectedSize() : "M")
                .price(i.getPrice())
                .quantity(i.getQuantity() != null ? i.getQuantity() : 1)
                .image(i.getImage())
                .build()).collect(Collectors.toList());

        Order order = Order.builder()
                .orderId(orderId)
                .status("CONFIRMED")
                .timestamp(Instant.now().toString())
                .customerName(customer.getFullName())
                .customerPhone(customer.getPhone())
                .customerCity(customer.getCity())
                .customerPincode(customer.getPincode())
                .paymentMethod(paymentMethod)
                .upiId(upiId)
                .subtotal(subtotal)
                .totalGst((double) totalGst)
                .cgst((double) cgst)
                .sgst((double) sgst)
                .shippingCharge((double) shippingCharge)
                .grandTotal(grandTotal)
                .deliveryEstimate(formattedDeliveryDate)
                .items(orderEntities)
                .build();

        orderRepository.save(order);
        log.info("[SFit Checkout] Order {} created successfully in database. Total: ₹{}", orderId, grandTotal);

        InvoiceDto invoice = InvoiceDto.builder()
                .currency("₹")
                .itemsCount(items.size())
                .subtotal(subtotal)
                .gstRate("18%")
                .cgst(cgst)
                .sgst(sgst)
                .totalGst(totalGst)
                .shippingCharge(shippingCharge)
                .grandTotal(grandTotal)
                .build();

        PaymentDetailsDto paymentDetails = PaymentDetailsDto.builder()
                .method(paymentMethod)
                .upiId(upiId)
                .transactionStatus("SUCCESS")
                .gateway("Mock Razorpay / UPI Express")
                .build();

        List<ReceiptItemDto> receiptItems = items.stream().map(i -> ReceiptItemDto.builder()
                .id(i.getId())
                .name(i.getName())
                .size(i.getSelectedSize() != null ? i.getSelectedSize() : "M")
                .price(i.getPrice() != null ? i.getPrice() : 0.0)
                .quantity(i.getQuantity() != null ? i.getQuantity() : 1)
                .image(i.getImage())
                .build()).collect(Collectors.toList());

        return CheckoutResponse.builder()
                .success(true)
                .orderId(orderId)
                .status("CONFIRMED")
                .timestamp(Instant.now().toString())
                .customer(customer)
                .paymentDetails(paymentDetails)
                .invoice(invoice)
                .items(receiptItems)
                .deliveryEstimate(formattedDeliveryDate)
                .build();
    }
}
