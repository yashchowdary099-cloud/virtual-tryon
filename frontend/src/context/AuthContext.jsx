import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (sbSession && isMounted) {
          setSession(sbSession);
          setUser(sbSession.user ?? null);
        }
      } catch (err) {
        console.warn('[Supabase Auth Warning] Could not fetch session:', err?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sbSession) => {
      setSession(sbSession);
      setUser(sbSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Send 6-digit OTP code to user's email via Supabase Auth
   */
  const sendEmailOtp = async (email) => {
    const cleanEmail = email.trim();
    const { data, error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to send OTP email.');
    }
    return data;
  };

  /**
   * Verify the 6-digit OTP code entered by user
   */
  const verifyEmailOtp = async (email, token) => {
    const cleanEmail = email.trim();
    const cleanToken = token.trim();

    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email'
    });

    if (error) {
      throw new Error(error.message || 'Invalid or expired OTP code. Please try again.');
    }

    if (data?.session) {
      setSession(data.session);
      setUser(data.user);
    }
    return data;
  };

  /**
   * Sign out user and clear Supabase session
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Supabase Auth Warning] SignOut failed:', err?.message);
    }
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    sendEmailOtp,
    verifyEmailOtp,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <div className="w-8 h-8 border-4 border-[#1A1817] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
