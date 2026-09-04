// FILE: backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const productsRoute = require('./routes/products');
const tryOnRoute = require('./routes/tryOn');
const checkoutRoute = require('./routes/checkout');
const chatbotRoute = require('./routes/chatbot');
const authRoute = require('./routes/auth');
const extractUrlRoute = require('./routes/extractUrl');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  const token = process.env.REPLICATE_API_TOKEN || '';
  const isConfigured = token && !token.includes('your_replicate');
  const maskedToken = isConfigured ? `${token.substring(0, 5)}...${token.substring(token.length - 4)}` : 'NOT CONFIGURED (Placeholder)';

  res.json({
    status: 'online',
    app: 'SFit Virtual Try-On & AI Assistant API',
    replicateApiTokenStatus: isConfigured ? 'Valid Format Loaded' : 'Missing / Placeholder',
    replicateTokenMasked: maskedToken,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/products', productsRoute);
app.use('/api/try-on', tryOnRoute);
app.use('/api/checkout', checkoutRoute);
app.use('/api/chatbot', chatbotRoute);
app.use('/api/auth', authRoute);
app.use('/api/extract-url', extractUrlRoute);

// Start Server
app.listen(PORT, () => {
  const token = process.env.REPLICATE_API_TOKEN || '';
  const isConfigured = token && !token.includes('your_replicate');
  const maskedToken = isConfigured ? `${token.substring(0, 5)}...${token.substring(token.length - 4)}` : '❌ NOT CONFIGURED (Using Placeholder)';

  const resendKey = process.env.RESEND_API_KEY || '';
  const isResendConfigured = resendKey && !resendKey.includes('your_resend') && resendKey.startsWith('re_');
  const maskedResend = isResendConfigured ? `${resendKey.substring(0, 5)}...${resendKey.substring(resendKey.length - 4)}` : '❌ NOT CONFIGURED (Add RESEND_API_KEY in .env)';

  console.log(`===================================================`);
  console.log(` 🚀 SFit Backend Server Running on Port ${PORT}`);
  console.log(` 🔑 REPLICATE_API_TOKEN: ${maskedToken}`);
  console.log(` 📧 RESEND_API_KEY:      ${maskedResend}`);
  console.log(` 🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(` 📦 Product API:  http://localhost:${PORT}/api/products`);
  console.log(` 👔 Try-On API:   http://localhost:${PORT}/api/try-on`);
  console.log(` 🤖 Chatbot API:  http://localhost:${PORT}/api/chatbot`);
  console.log(` 🔑 Auth API:     http://localhost:${PORT}/api/auth`);
  console.log(` ===================================================`);
});
