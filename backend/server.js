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
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const isSupabaseConfigured = Boolean(supabaseUrl && !supabaseUrl.includes('placeholder'));

  res.json({
    status: 'online',
    app: 'TrueFit Virtual Try-On & AI Assistant API',
    supabaseAuth: isSupabaseConfigured ? 'Configured' : 'Missing / Placeholder in backend/.env',
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

const server = app.listen(PORT, () => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const isSupabaseConfigured = Boolean(supabaseUrl && !supabaseUrl.includes('placeholder'));

  console.log(`===================================================`);
  console.log(` 🚀 TrueFit Backend Server Running on Port ${PORT}`);
  console.log(` 🔐 SUPABASE_AUTH:       ${isSupabaseConfigured ? 'Configured' : '❌ NOT CONFIGURED (Add SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY in .env)'}`);
  console.log(` 🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(` 📦 Product API:  http://localhost:${PORT}/api/products`);
  console.log(` 👔 Try-On API:   http://localhost:${PORT}/api/try-on`);
  console.log(` 🤖 Chatbot API:  http://localhost:${PORT}/api/chatbot`);
  console.log(` ===================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [Port Error] Port ${PORT} is already in use by another process.`);
    console.error(`👉 Run 'npx kill-port ${PORT}' or set a different PORT in backend/.env (e.g. PORT=5001).\n`);
  } else {
    console.error('[Server Error]:', err);
  }
});
