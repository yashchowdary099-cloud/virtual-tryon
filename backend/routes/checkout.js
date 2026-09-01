// FILE: backend/routes/checkout.js
const express = require('express');
const router = express.Router();

/**
 * POST /api/checkout
 * Processes order creation, calculates subtotal, GST (18%), shipping, and returns order invoice.
 */
router.post('/', (req, res) => {
  try {
    const { items, customer, paymentMethod, upiId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart cannot be empty' });
    }

    // Calculate financials in INR (₹)
    const subtotal = items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    const gstRate = 0.18; // 18% Indian GST
    const gstAmount = Math.round(subtotal * gstRate);
    const cgst = Math.round(gstAmount / 2);
    const sgst = Math.round(gstAmount / 2);

    const shippingCharge = subtotal >= 1999 ? 0 : 99;
    const totalAmount = subtotal + gstAmount + shippingCharge;

    const orderId = 'SF-IND-' + Math.floor(100000 + Math.random() * 900000);
    const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const orderReceipt = {
      success: true,
      orderId,
      status: 'CONFIRMED',
      timestamp: new Date().toISOString(),
      customer: customer || {
        fullName: 'SFit User',
        phone: '+91 98765 43210',
        city: 'Bengaluru',
        pincode: '560001'
      },
      paymentDetails: {
        method: paymentMethod || 'UPI',
        upiId: paymentMethod === 'UPI' ? (upiId || 'user@upi') : null,
        transactionStatus: 'SUCCESS',
        gateway: 'Mock Razorpay / UPI Express'
      },
      invoice: {
        currency: '₹',
        itemsCount: items.length,
        subtotal: subtotal,
        gstRate: '18%',
        cgst: cgst,
        sgst: sgst,
        totalGst: gstAmount,
        shippingCharge: shippingCharge,
        grandTotal: totalAmount
      },
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        size: item.selectedSize || 'M',
        price: item.price,
        quantity: item.quantity || 1,
        image: item.image
      })),
      deliveryEstimate: estimatedDelivery
    };

    console.log(`[SFit Checkout] Order ${orderId} created successfully. Total: ₹${totalAmount}`);
    res.status(201).json(orderReceipt);
  } catch (error) {
    console.error('[SFit Checkout Error]:', error);
    res.status(500).json({ success: false, message: 'Checkout failed to process order' });
  }
});

module.exports = router;
