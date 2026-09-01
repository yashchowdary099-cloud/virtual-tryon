// FILE: frontend/src/api/auth.js

const API_BASE_URL = 'http://localhost:5000/api/auth';

/**
 * Sends OTP to a 10-digit mobile number.
 */
export async function sendOtp(phoneNumber) {
  try {
    const response = await fetch(`${API_BASE_URL}/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error sendOtp:', error);
    return {
      success: false,
      message: 'Failed to connect to the authentication server.'
    };
  }
}

/**
 * Verifies OTP for the mobile number.
 */
export async function verifyOtp(phoneNumber, otp) {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber, otp })
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
