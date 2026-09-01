// FILE: frontend/src/api/chatbot.js

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Send a message to SFit AI Assistant Chatbot API using native fetch
 */
export const sendChatMessage = async ({ message, cart = [], userMeasurements = {}, currentProduct = null }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        cart,
        userMeasurements,
        currentProduct
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error sendChatMessage:', error);
    return {
      success: false,
      text: "I'm currently unable to reach the backend server. You can explore our shirts catalog or try on garments directly!",
      quickReplies: ["Show shirts under ₹1000", "Find my size in CM"]
    };
  }
};
