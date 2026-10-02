## 🌐 Live Demo

🚀 **Try TrueFit AI Virtual Try-On here:**

https://virtual-try-on-liard.vercel.app
# SFit - AI-Powered 3D Virtual Garment Try-On & Shopping Platform

**SFit** is an AI-powered 3D virtual clothing try-on platform that enables online shoppers to virtually "wear" apparel directly on their own posture photos before buying. It features exact centimeter (CM) body measurements, 4-angle posture try-on results, and an **AI-Powered Shopping Assistant Chatbot**.

---

## 🌟 Key Features

1. **AI 3D Body Fitting & Zero-Overlay Replacement**:
   - Automatically erases old clothing in user photos using neural inpainting.
   - Fits new garments onto body curves, shoulders (`46 cm`), and chest (`108 cm`).
   - Clips user head/neck inside the shirt collar for natural wearing.

2. **🤖 SFit AI Shopping Assistant Chatbot**:
   - **Floating Chat Widget**: Visible across every page with subtle glowing pulse animation.
   - **Product Discovery**: Queries like *"Show Levi's under ₹2500"* return interactive product cards directly in chat with **"Try It On"** CTAs.
   - **CM Size Help**: Calculates exact size (e.g. 108 cm ➔ Size L) and auto-fills user measurements.
   - **Live Bag & GST Support**: Calculates cart totals & 18% GST in real time.
   - **FAQs & Human Agent Fallback**: Shipping, 7-day returns, UPI/Card payments, and mock agent handoff.

3. **Exact Centimeter (CM) Size Calculator**:
   - Real-time chest cm matching (Size S, M, L, XL, XXL).
   - Verifies Size L (e.g., 108 cm chest = 96% Match).

4. **Multi-Angle Try-On Viewer (4 Angles)**:
   - Front View, Back View, Left Side, Right Side with 3D perspective rotation.

5. **Indian Rupee (₹) Checkout & GST Invoice**:
   - Itemized 18% GST (9% CGST + 9% SGST).
   - Indian UPI (GPay, PhonePe, Paytm) and Credit/Debit card payment flows.

---

## 📁 Repository & File Structure

```text
virtual tryon/
├── backend/
│   ├── data/
│   │   └── products.json          # Myntra Men's Shirts & Women's Tops catalog
│   ├── routes/
│   │   ├── checkout.js            # POST /api/checkout (GST calculation & receipts)
│   │   ├── products.js            # GET /api/products
│   │   ├── tryOn.js               # POST /api/try-on (Multi-part image fitting API)
│   │   └── chatbot.js             # POST /api/chatbot (AI Assistant intent engine)
│   └── server.js                  # Express backend entry point (Port 5000)
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── index.js           # REST API client
    │   │   └── chatbot.js         # Chatbot REST API client
    │   ├── components/
    │   │   ├── AngleViewer.jsx    # 3D Pose Mesh & Wearing Viewport
    │   │   ├── ChatbotWidget.jsx  # Floating chat button & slide-up panel
    │   │   ├── ChatMessage.jsx    # Message bubble with embedded cards & suggestion chips
    │   │   ├── CmMeasurementForm.jsx # Centimeter measurement input form
    │   │   ├── Navbar.jsx         # SFit Header navigation & logo
    │   │   └── ProductCard.jsx    # Catalog product card with ₹ prices & discounts
    │   ├── context/
    │   │   ├── ChatContext.jsx    # Chatbot session message history & open state
    │   │   └── TryOnContext.jsx   # Global application state (cart, images, measurements)
    │   ├── pages/
    │   │   ├── BodyCapture.jsx    # 4-angle posture capture page
    │   │   ├── Catalog.jsx        # Floating hero banner & garment catalog
    │   │   ├── Checkout.jsx       # INR Payment & GST receipt page
    │   │   ├── FitResult.jsx      # 3D fitting results & CM size metrics
    │   │   └── FittingProcess.jsx # Processing pipeline animation
    │   └── App.jsx                # Main React router entry point
    └── package.json
```

---

## 🚀 How to Run in VS Code

### 1. Start the Backend Server (Terminal 1)
```powershell
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### 2. Start the Frontend App (Terminal 2)
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173/`*
