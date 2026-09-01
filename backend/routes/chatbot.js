// FILE: backend/routes/chatbot.js
const express = require('express');
const router = express.Router();
const productsData = require('../data/products.json');

/**
 * POST /api/chatbot
 * Intelligent Shopping Assistant Endpoint
 * Expects JSON body:
 *  {
 *    message: string,
 *    cart: Array,
 *    userMeasurements: Object,
 *    currentProduct: Object
 *  }
 */
router.post('/', (req, res) => {
  try {
    const { message = '', cart = [], userMeasurements = {}, currentProduct = null } = req.body;
    const query = message.trim().toLowerCase();

    console.log(`[SFit Chatbot] Received query: "${message}"`);

    /* 
    =================================================================================
    * PRODUCTION LLM API INTEGRATION POINT (OpenAI / Claude / Gemini API):
    * -------------------------------------------------------------------------------
    * In a production deployment, this is where you pass the conversation history,
    * current catalog dataset, and user cart context into an LLM client:
    * 
    * const response = await openai.chat.completions.create({
    *   model: "gpt-4o",
    *   messages: [{ role: "system", content: systemPrompt }, ...history]
    * });
    =================================================================================
    */

    let textResponse = "";
    let returnedProducts = null;
    let quickReplies = [];
    let sizeRecommendation = null;
    let showHumanAgent = false;

    // INTENT 1: Size Calculation & Measurements (e.g., "108 cm", "chest 96 cm", "find my size")
    const cmMatch = query.match(/(\d+)\s*(cm|centimeters|centimeter)?/i);
    if (query.includes('size') || query.includes('chest') || query.includes('measurement') || cmMatch) {
      let chestVal = cmMatch ? parseInt(cmMatch[1]) : (userMeasurements.chestCm || 108);

      let calculatedSize = 'L';
      let fitCategory = 'Tailored Fit';
      if (chestVal < 92) { calculatedSize = 'S'; fitCategory = 'Slim Fit'; }
      else if (chestVal < 100) { calculatedSize = 'M'; fitCategory = 'Regular Fit'; }
      else if (chestVal < 110) { calculatedSize = 'L'; fitCategory = 'Tailored Fit'; }
      else if (chestVal < 118) { calculatedSize = 'XL'; fitCategory = 'Relaxed Fit'; }
      else { calculatedSize = 'XXL'; fitCategory = 'Comfort Fit'; }

      textResponse = `Based on a **${chestVal} cm chest measurement**, your ideal size is **Size ${calculatedSize}** (${fitCategory}).\n\nI can auto-fill this size for your 3D virtual try-on!`;
      
      sizeRecommendation = {
        chestCm: chestVal,
        recommendedSize: calculatedSize,
        fitCategory
      };

      quickReplies = ["Auto-fill Size L", "How does 3D try-on work?", "Show shirts in Size L"];
    }

    // INTENT 2: Product Discovery & Price Filter (e.g. "under ₹1000", "Levi's", "women tops", "formal shirts")
    else if (
      query.includes('show') || query.includes('find') || query.includes('shirt') || 
      query.includes('top') || query.includes('under') || query.includes('price') ||
      query.includes('levi') || query.includes('roadster') || query.includes('zara') ||
      query.includes('women') || query.includes('men')
    ) {
      let filtered = [...productsData];

      // Gender filter
      if (query.includes('women') || query.includes('girl') || query.includes('top')) {
        filtered = filtered.filter(p => p.gender === 'Women' || p.category.includes("Women's"));
      } else if (query.includes('men') || query.includes('boy') || query.includes('shirt')) {
        filtered = filtered.filter(p => p.gender === 'Men' || p.category.includes("Men's"));
      }

      // Price filter (e.g. under 1000, under 2500)
      const priceMatch = query.match(/under\s*₹?\s*(\d+)/i);
      if (priceMatch) {
        const maxPrice = parseInt(priceMatch[1]);
        filtered = filtered.filter(p => p.price <= maxPrice);
      }

      // Brand filter
      if (query.includes('levi')) filtered = filtered.filter(p => p.brand.toLowerCase().includes('levi'));
      if (query.includes('roadster')) filtered = filtered.filter(p => p.brand.toLowerCase().includes('roadster'));
      if (query.includes('zara')) filtered = filtered.filter(p => p.brand.toLowerCase().includes('zara'));
      if (query.includes('highlander')) filtered = filtered.filter(p => p.brand.toLowerCase().includes('highlander'));

      returnedProducts = filtered.slice(0, 4);

      if (returnedProducts.length > 0) {
        textResponse = `Here are **${returnedProducts.length} top options** matching your search from our SFit catalog:`;
      } else {
        textResponse = `I couldn't find exact matches for "${message}", but here are popular bestsellers:`;
        returnedProducts = productsData.slice(0, 3);
      }

      quickReplies = ["Show shirts under ₹1000", "Women's Tops", "Find my size in CM"];
    }

    // INTENT 3: Live Shopping Bag & GST Support (e.g. "cart", "bag", "gst", "order total")
    else if (query.includes('cart') || query.includes('bag') || query.includes('gst') || query.includes('total')) {
      if (!cart || cart.length === 0) {
        textResponse = "Your shopping bag is currently empty. Pick any garment from the catalog to try on or add to bag!";
        quickReplies = ["Show Men's Shirts", "Show Women's Tops"];
      } else {
        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const gstAmount = Math.round(subtotal * 0.18);
        const shipping = subtotal >= 1999 ? 0 : 99;
        const grandTotal = subtotal + gstAmount + shipping;

        textResponse = `🛒 **Your Shopping Bag Summary:**\n• **Items:** ${cart.length} item(s)\n• **Subtotal:** ₹${subtotal.toLocaleString('en-IN')}\n• **18% GST:** ₹${gstAmount.toLocaleString('en-IN')}\n• **Shipping:** ${shipping === 0 ? 'FREE' : '₹' + shipping}\n• **Grand Total:** **₹${grandTotal.toLocaleString('en-IN')}**`;
        
        quickReplies = ["Proceed to Checkout", "Find my size in CM", "Shipping & Delivery info"];
      }
    }

    // INTENT 4: Virtual Try-On Guidance (e.g. "how tryon works", "how to try")
    else if (query.includes('try') || query.includes('how') || query.includes('work') || query.includes('studio')) {
      textResponse = `✨ **How SFit 3D Virtual Try-On Works in 5 Easy Steps:**\n\n1. **Select Garment**: Pick any shirt/top from the catalog & click "Try It On Me".\n2. **4-Angle Capture**: Snap or upload 4 photos (Front, Back, Left, Right).\n3. **3D Neural Fitting**: Old clothes are erased & new garment drapes onto your posture.\n4. **3D Results & CM Fit**: Inspect 4-angle views, adjust 3D perspective & verify your size.\n5. **Checkout**: Pay via UPI/Card in ₹ with GST billing!`;
      
      quickReplies = ["Find my size in CM", "Show Men's Shirts", "What's in my bag?"];
    }

    // INTENT 5: Shipping, Returns & FAQs
    else if (query.includes('ship') || query.includes('deliver') || query.includes('return') || query.includes('pay')) {
      textResponse = `🚚 **SFit Shopping FAQs:**\n\n• **Shipping:** FREE delivery on orders above ₹1,999 (standard delivery ₹99).\n• **Estimated Delivery:** 3–4 business days across India.\n• **Returns:** 7-day hassle-free returns & instant exchange.\n• **Payment:** UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Cash on Delivery.`;
      
      quickReplies = ["Track my order", "Find my size in CM", "Show shirts under ₹1000"];
    }

    // FALLBACK: Unknown Query
    else {
      textResponse = `I'm here to help you discover clothes, calculate your size in CM, guide virtual try-on, or check your bag. What would you like to explore?`;
      showHumanAgent = true;
      quickReplies = ["Show shirts under ₹1000", "Find my size in CM", "How does 3D try-on work?", "Talk to Support Agent"];
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      text: textResponse,
      products: returnedProducts,
      quickReplies,
      sizeRecommendation,
      showHumanAgent
    });

  } catch (error) {
    console.error('[SFit Chatbot Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Chatbot processing failed'
    });
  }
});

module.exports = router;
