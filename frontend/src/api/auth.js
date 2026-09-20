// FILE: frontend/src/api/auth.js

/**
 * NOTE: Legacy Resend OTP authentication API calls have been removed.
 * Authentication is now handled directly by @supabase/supabase-js in AuthContext and Login.jsx using:
 * - supabase.auth.signUp()
 * - supabase.auth.signInWithPassword()
 * - supabase.auth.signOut()
 */

export const DEPRECATED_MSG = 'Use Supabase Auth client directly via useAuth() hook.';
