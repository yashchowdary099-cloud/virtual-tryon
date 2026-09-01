// FILE: frontend/src/api/auth.js

const API_BASE_URL = 'http://localhost:5000/api/auth';

/**
 * Sends a 6-digit verification OTP to the specified email address via Resend.
 */
export async function sendOtp(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error sendOtp:', error);
    return {
      success: false,
      message: 'Failed to connect to the authentication server. Please check your network connection.'
    };
  }
}

/**
 * Verifies the 6-digit OTP code for the user's email address.
 */
export async function verifyOtp(email, otp) {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error verifyOtp:', error);
    return {
      success: false,
      message: 'Failed to connect to the verification server.'
    };
  }
}
