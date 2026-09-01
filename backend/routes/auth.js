// FILE: backend/routes/auth.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Resend } = require('resend');
require('dotenv').config();

const USERS_FILE_PATH = path.join(__dirname, '../data/users.json');

// In-memory OTP storage: email (lowercase) -> { hashedOtp, expiresAt, attempts }
const otpStore = new Map();

// In-memory Rate Limit tracking: email (lowercase) -> { lastRequestedAt, requestCount, windowStart }
const rateLimitStore = new Map();

// Configuration Constants
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds between resend requests
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 requests per 15-minute window
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_VERIFICATION_ATTEMPTS = 4; // Max 4 wrong attempts before invalidating OTP

/**
 * Helper to validate email format
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Helper to generate a secure hash of the OTP bound to the user's email
 */
function hashOtp(otp, email) {
  return crypto.createHash('sha256').update(`${otp}:${email.toLowerCase().trim()}`).digest('hex');
}

/**
 * Helper to load users from users.json
 */
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
    console.error('[SFit Auth] Error loading users:', error);
    return [];
  }
}

/**
 * Helper to save users to users.json
 */
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('[SFit Auth] Error saving users:', error);
  }
}

/**
 * Helper to initialize and get Resend client
 */
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_resend')) {
    return null;
  }
  return new Resend(apiKey.trim());
}

/**
 * Generates beautiful HTML email template for the OTP
 */
function generateOtpEmailHtml(otpCode, email) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your SFit Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f3f4f6;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="500" style="max-width: 500px; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                
                <!-- Logo & Brand Header -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); padding: 10px 18px; border-radius: 12px; font-weight: 900; font-size: 20px; color: #ffffff; letter-spacing: -0.5px;">
                      SFit
                    </div>
                    <div style="font-size: 11px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px;">
                      3D AI Virtual Try-On
                    </div>
                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
                      Verification Code
                    </h1>
                  </td>
                </tr>

                <!-- Description -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                      Use the 6-digit code below to log in to your <strong>SFit</strong> account for <span style="color: #cbd5e1;">${email}</span>.
                    </p>
                  </td>
                </tr>

                <!-- OTP Code Box -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <div style="background-color: #020617; border: 2px solid #6366f1; border-radius: 12px; padding: 18px 24px; display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: 900; color: #38bdf8; font-family: 'Courier New', Courier, monospace;">
                      ${otpCode}
                    </div>
                  </td>
                </tr>

                <!-- Expiry Note -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <p style="margin: 0; font-size: 12px; color: #64748b;">
                      ⏳ This code expires in <strong>5 minutes</strong> and can only be used once.<br>
                      If you did not request this code, please ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer Divider & Copyright -->
                <tr>
                  <td style="border-top: 1px solid #1e293b; padding-top: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #475569;">
                      © ${new Date().getFullYear()} SFit Inc. AI 3D Virtual Garment Fitting Platform.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * POST /api/auth/send-otp
 * Accepts email, validates format & rate limits, generates a 6-digit cryptographically secure OTP,
 * hashes it in memory, and dispatches an email via Resend.
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Email Format Validation
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address (e.g. name@gmail.com).'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = Date.now();

    // 2. Rate Limiting Protection
    const rateData = rateLimitStore.get(normalizedEmail) || {
      lastRequestedAt: 0,
      requestCount: 0,
      windowStart: now
    };

    // Reset 15-minute window if expired
    if (now - rateData.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateData.windowStart = now;
      rateData.requestCount = 0;
    }

    // Cooldown check (60 seconds between requests)
    const elapsedSinceLast = now - rateData.lastRequestedAt;
    if (elapsedSinceLast < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsedSinceLast) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting another verification code.`,
        retryAfterSeconds: waitSeconds
      });
    }

    // Window threshold check (max 5 requests per 15 minutes)
    if (rateData.requestCount >= MAX_REQUESTS_PER_WINDOW) {
      const windowRemainingMin = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - rateData.windowStart)) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many OTP requests for this email. Please try again in ${windowRemainingMin} minutes.`
      });
    }

    // 3. Verify Resend API Key Configuration
    const resend = getResendClient();
    if (!resend) {
      console.error('[SFit Auth Error] RESEND_API_KEY is not configured in backend/.env');
      return res.status(500).json({
        success: false,
        message: 'Email service is not configured. Please add RESEND_API_KEY in backend/.env'
      });
    }

    // 4. Generate 6-Digit Cryptographically Secure OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOtp(rawOtp, normalizedEmail);
    const expiresAt = now + OTP_EXPIRY_MS;

    // Store in-memory
    otpStore.set(normalizedEmail, {
      hashedOtp,
      expiresAt,
      attempts: 0
    });

    // Update rate limit store
    rateData.lastRequestedAt = now;
    rateData.requestCount += 1;
    rateLimitStore.set(normalizedEmail, rateData);

    // 5. Send Email via Resend
    const senderEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    console.log(`[SFit Auth] Sending OTP to ${normalizedEmail} via Resend (${senderEmail})...`);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `SFit <${senderEmail}>`,
      to: [normalizedEmail],
      subject: `Your SFit Verification Code: ${rawOtp}`,
      html: generateOtpEmailHtml(rawOtp, normalizedEmail),
      text: `Your SFit verification code is: ${rawOtp}. Valid for 5 minutes.`
    });

    if (emailError) {
      console.error('[SFit Auth Resend Error]:', emailError);
      return res.status(500).json({
        success: false,
        message: emailError.message || 'Failed to send verification email through Resend.'
      });
    }

    console.log(`[SFit Auth] Email sent successfully. Resend ID: ${emailData?.id}`);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email successfully.',
      cooldownSeconds: 60
    });

  } catch (error) {
    console.error('[SFit Auth Error] send-otp:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while processing your OTP request.'
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Accepts email + OTP, checks validity & single-use constraint, and returns user profile & session token.
 */
router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit verification code.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();
    const storedRecord = otpStore.get(normalizedEmail);

    // 1. Check if an active OTP exists
    if (!storedRecord) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP request found for this email. Please request a new code.'
      });
    }

    // 2. Check Expiry
    if (Date.now() > storedRecord.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: 'The verification code has expired. Please request a new one.'
      });
    }

    // 3. Increment and Check Attempt Limits
    storedRecord.attempts += 1;
    if (storedRecord.attempts > MAX_VERIFICATION_ATTEMPTS) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. For security, please request a new verification code.'
      });
    }

    // 4. Verify Hash
    const incomingHashed = hashOtp(cleanOtp, normalizedEmail);
    if (incomingHashed !== storedRecord.hashedOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your email and try again.'
      });
    }

    // 5. Code is valid! Delete immediately to ensure SINGLE-USE
    otpStore.delete(normalizedEmail);

    // 6. User Management: Load, Register or Update in users.json
    const users = loadUsers();
    let user = users.find(u => u.email && u.email.toLowerCase() === normalizedEmail);

    const displayName = normalizedEmail.split('@')[0];

    if (!user) {
      user = {
        id: 'usr_' + Date.now(),
        email: normalizedEmail,
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      users.push(user);
      saveUsers(users);
      console.log(`[SFit Auth] Registered new user profile: ${user.email}`);
    } else {
      user.lastLoginAt = new Date().toISOString();
      saveUsers(users);
      console.log(`[SFit Auth] User authenticated: ${user.email}`);
    }

    // 7. Generate Session Token
    const token = 'sfit_' + crypto.randomBytes(24).toString('hex');

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
      message: 'Verification failed due to a server error.'
    });
  }
});

module.exports = router;
