// FILE: backend/routes/auth.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const USERS_FILE_PATH = path.join(__dirname, '../data/users.json');

// Temporary in-memory store for OTPs: phone -> { otp, expiresAt }
const otpStore = new Map();

// Helper to load users from users.json
function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) {
      fs.mkdirSync(path.dirname(USERS_FILE_PATH), { recursive: true });
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

// Helper to save users to users.json
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

/**
 * Helper function to send real SMS via Twilio API using native fetch
 */
async function sendRealSmsViaTwilio(phoneNumber, otpCode) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioPhone || 
      accountSid.includes('your_twilio') || authToken.includes('your_twilio')) {
    throw new Error('Twilio credentials are not configured in backend/.env. Please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.');
  }

  // Format recipient phone number with Indian country code (+91)
  const formattedTo = `+91${phoneNumber}`;
  const messageBody = `Your SFit login verification code is ${otpCode}. Valid for 5 minutes.`;

  console.log(`[Twilio SMS] Sending OTP to ${formattedTo}...`);

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const params = new URLSearchParams();
  params.append('To', formattedTo);
  params.append('From', twilioPhone);
  params.append('Body', messageBody);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const resData = await response.json();

  if (!response.ok) {
    console.error('[Twilio API Error Response]:', resData);
    throw new Error(resData.message || `Twilio error: ${resData.status}`);
  }

  console.log(`[Twilio SMS Success] SMS sent. Message SID: ${resData.sid}`);
  return resData;
}

/**
 * POST /api/auth/send-otp
 * Accepts a 10-digit mobile number, generates a 4-digit OTP, and sends a real SMS via Twilio.
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number.'
      });
    }

    // Generate a random 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    // Store in-memory
    otpStore.set(phoneNumber, { otp: generatedOtp, expiresAt });

    // Send real SMS
    try {
      await sendRealSmsViaTwilio(phoneNumber, generatedOtp);
    } catch (smsError) {
      console.error('[Twilio Send Error]:', smsError.message);
      return res.status(400).json({
        success: false,
        message: smsError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verification code sent successfully to your phone!'
    });
  } catch (error) {
    console.error('[SFit Auth Error] send-otp:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process OTP request.'
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Accepts phone number + OTP, verifies, and returns session token + user profile.
 */
router.post('/verify-otp', (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required.'
      });
    }

    const storedData = otpStore.get(phoneNumber);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP request found for this mobile number. Please send OTP again.'
      });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({
        success: false,
        message: 'The OTP has expired. Please request a new OTP.'
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect OTP. Please try again.'
      });
    }

    // OTP is valid! Clear it from temporary storage
    otpStore.delete(phoneNumber);

    // Retrieve or register user in users.json
    const users = loadUsers();
    let user = users.find(u => u.phoneNumber === phoneNumber);

    if (!user) {
      // Register new user profile
      user = {
        id: 'usr_' + Date.now(),
        phoneNumber,
        name: `SFit Shopper (+91 ${phoneNumber.substring(0, 5)} ${phoneNumber.substring(5)})`,
        createdAt: new Date().toISOString()
      };
      users.push(user);
      saveUsers(users);
      console.log(`[SFit Auth] Registered new user: ${user.name}`);
    } else {
      console.log(`[SFit Auth] User logged in: ${user.name}`);
    }

    // Generate a simple session token
    const token = 'token_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user
    });
  } catch (error) {
    console.error('[SFit Auth Error] verify-otp:', error);
    return res.status(500).json({
      success: false,
      message: 'Verification failed.'
    });
  }
});

module.exports = router;
