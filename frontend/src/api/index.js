// FILE: frontend/src/api/index.js

/**
 * API Client Service for TrueFit Virtual Try-On Platform
 *
 * VITE_API_BASE_URL in Vercel should be:
 * https://virtual-tryon-backend-yjaw.onrender.com
 *
 * All backend API routes use /api.
 */

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api`;

/**
 * Fetch clothing catalog from backend
 * Optional category/search filters can be passed in params.
 */
export async function getProducts(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();

    const response = await fetch(
      `${API_BASE_URL}/products${query ? `?${query}` : ''}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch products: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (getProducts):', error);
    throw error;
  }
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch product ${id}: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (getProductById):', error);
    throw error;
  }
}

/**
 * Submit user images and garment information
 * to the AI Virtual Try-On backend.
 */
export async function processTryOn(payload) {
  try {
    const formData = new FormData();

    // User pose images
    if (payload.front) {
      formData.append('front', payload.front);
    }

    if (payload.back) {
      formData.append('back', payload.back);
    }

    if (payload.left) {
      formData.append('left', payload.left);
    }

    if (payload.right) {
      formData.append('right', payload.right);
    }

    // Product information
    if (payload.productId) {
      formData.append('productId', payload.productId);
    }

    if (payload.preferredSize) {
      formData.append('preferredSize', payload.preferredSize);
    }

    // Garment information
    if (payload.garmentImage) {
      formData.append('garmentImage', payload.garmentImage);
    }

    if (payload.garmentName) {
      formData.append('garmentName', payload.garmentName);
    }

    if (payload.category) {
      formData.append('category', payload.category);
    }

    /**
     * Correct production endpoint:
     * https://virtual-tryon-backend-yjaw.onrender.com/api/try-on
     */
    const response = await fetch(`${API_BASE_URL}/try-on`, {
      method: 'POST',
      body: formData
    });

    const responseText = await response.text();

    let data;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error(
        'Invalid Try-On response:',
        responseText
      );

      throw new Error(
        `AI fitting processing failed: Server returned invalid format (${response.status})`
      );
    }

    if (!response.ok || !data.success) {
      const errorMessage =
        data.details ||
        data.error ||
        data.message ||
        `AI fitting processing failed (${response.status})`;

      const error = new Error(errorMessage);

      error.stage = data.stage || 'try-on';
      error.details = data.details;

      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error (processTryOn):', error);
    throw error;
  }
}

/**
 * Extract garment image and product details
 * from shopping websites.
 */
export async function extractProductFromUrl(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/extract-url`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        url
      })
    });

    const responseText = await response.text();

    let data;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error(
        'Invalid extraction response:',
        responseText
      );

      throw new Error(
        `Extraction service returned invalid response format (${response.status})`
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.error ||
        data.message ||
        `Unable to extract garment image (${response.status})`
      );
    }

    return data;
  } catch (error) {
    console.error(
      'API Error (extractProductFromUrl):',
      error
    );

    throw error;
  }
}

/**
 * Process checkout
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
      throw new Error(
        `Checkout failed: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      'API Error (processCheckout):',
      error
    );

    throw error;
  }
}
