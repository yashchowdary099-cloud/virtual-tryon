// FILE: frontend/src/api/index.js
/**
 * API Client Service for TrueFit Virtual Try-On Platform
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Fetch clothing catalog from backend with optional category and search filters
 */
export async function getProducts(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/products?${query}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error (getProducts):', error);
    throw error;
  }
}

/**
 * Fetch single product details by ID
 */
export async function getProductById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch product ${id}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error (getProductById):', error);
    throw error;
  }
}

/**
 * Submit 4 pose images to AI fitting engine backend
 * @param {Object} payload - { front: File/Blob, back: File/Blob, left: File/Blob, right: File/Blob, productId: string, preferredSize: string }
 */
export async function processTryOn(payload) {
  try {
    const formData = new FormData();
    if (payload.front) formData.append('front', payload.front);
    if (payload.back) formData.append('back', payload.back);
    if (payload.left) formData.append('left', payload.left);
    if (payload.right) formData.append('right', payload.right);
    if (payload.productId) formData.append('productId', payload.productId);
    if (payload.preferredSize) formData.append('preferredSize', payload.preferredSize);
    if (payload.garmentImage) formData.append('garmentImage', payload.garmentImage);
    if (payload.garmentName) formData.append('garmentName', payload.garmentName);
    if (payload.category) formData.append('category', payload.category);

    const response = await fetch(`${API_BASE_URL}/try-on`, {
      method: 'POST',
      body: formData
    });

    const responseText = await response.text();
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseErr) {
      throw new Error(`AI fitting processing failed: Server returned invalid format (${response.status})`);
    }

    if (!response.ok || !data.success) {
      const errorMsg = data.details || data.error || data.message || `AI fitting processing failed (${response.status})`;
      const err = new Error(errorMsg);
      err.stage = data.stage || 'replicate';
      err.details = data.details;
      throw err;
    }

    return data;
  } catch (error) {
    console.error('API Error (processTryOn):', error);
    throw error;
  }
}

/**
 * Extract garment image and product details from a shopping product URL
 * @param {string} url - Product page link from Myntra, AJIO, Amazon, Flipkart, etc.
 */
export async function extractProductFromUrl(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/extract-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const responseText = await response.text();
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseErr) {
      throw new Error(`Extraction service returned invalid response format (${response.status}).`);
    }

    if (!response.ok || !data.success) {
      throw new Error(data.error || `Unable to extract garment image (${response.status}).`);
    }
    return data;
  } catch (error) {
    console.error('API Error (extractProductFromUrl):', error);
    throw error;
  }
}

/**
 * Process order checkout with GST and INR payment selection
 * @param {Object} orderData - { items: Array, customer: Object, paymentMethod: string, upiId: string }
 */
export async function processCheckout(orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error(`Checkout failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (processCheckout):', error);
    throw error;
  }
}
