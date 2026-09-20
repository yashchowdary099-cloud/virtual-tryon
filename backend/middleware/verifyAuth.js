const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseAdmin = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.warn(
    '[Supabase Backend Warning] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in backend/.env'
  );
}

/**
 * Middleware to verify Supabase Auth access tokens sent in the Authorization header:
 * Authorization: Bearer <access_token>
 */
async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access',
        message: 'No authorization token provided. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!supabaseAdmin) {
      // If Supabase service role is not yet configured, allow request but warn
      console.warn('[verifyAuth Warning] Supabase admin client not configured. Bypassing token validation.');
      req.user = { id: 'anon_user', email: 'guest@truefit.ai' };
      return next();
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error('[verifyAuth Error] Invalid token:', error?.message);
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access',
        message: 'Invalid or expired authorization token.'
      });
    }

    // Attach authenticated user payload to request
    req.user = user;
    req.token = token;
    next();

  } catch (err) {
    console.error('[verifyAuth Exception]:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Server authentication failure'
    });
  }
}

/**
 * Optional Auth Middleware: Attaches req.user if a valid token is present, but doesn't block unauthenticated requests.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && supabaseAdmin) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
  } catch (err) {
    // Ignore errors for optional auth
  }
  next();
}

module.exports = {
  verifyAuth,
  optionalAuth
};
