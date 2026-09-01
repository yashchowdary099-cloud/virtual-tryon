// FILE: frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Mail, Sparkles, AlertCircle, CheckCircle2, Lock, ArrowRight, RotateCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendOtp, verifyOtp } from '../api/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Email Input, 2 = OTP Input
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const redirectPath = location.state?.from || '/';

  // Countdown timer for Resend OTP cooldown
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const isValidEmailFormat = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !isValidEmailFormat(email)) {
      setErrorMsg('Please enter a valid email address (e.g. yourname@gmail.com).');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(email.trim());
      setLoading(false);

      if (res.success) {
        setStep(2);
        setCooldown(res.cooldownSeconds || 60);
        setSuccessMsg(res.message || `Verification code sent to ${email.trim()}! Please check your inbox.`);
      } else {
        if (res.retryAfterSeconds) {
          setCooldown(res.retryAfterSeconds);
        }
        setErrorMsg(res.message || 'Failed to send verification email. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error. Failed to reach the authentication server.');
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setResending(true);
      const res = await sendOtp(email.trim());
      setResending(false);

      if (res.success) {
        setCooldown(res.cooldownSeconds || 60);
        setSuccessMsg(`New verification code sent to ${email.trim()}!`);
      } else {
        if (res.retryAfterSeconds) {
          setCooldown(res.retryAfterSeconds);
        }
        setErrorMsg(res.message || 'Could not resend OTP at this moment.');
      }
    } catch (err) {
      setResending(false);
      setErrorMsg('Network error while resending verification code.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || !/^\d{6}$/.test(cleanOtp)) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(email.trim(), cleanOtp);
      setLoading(false);

      if (res.success) {
        login(res.user, res.token);
        setSuccessMsg('Verification successful! Welcome to SFit...');
        
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 800);
      } else {
        setErrorMsg(res.message || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error. Failed to connect to the verification server.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xl relative overflow-hidden"
      >
        {/* Background ambient glow effect */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mx-auto mb-4 ring-2 ring-indigo-500/30">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="font-brand text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
            SFit <span className="bg-gradient-to-r from-indigo-600 to-pink-500 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">Email Login</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in with email OTP to access your bag, measurements & 3D AI try-ons.
          </p>
        </div>

        {/* Dynamic Alerts */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Email Input Form */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Enter Gmail / Email Address
              </label>
              <div className="relative flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus-within:border-indigo-500/60 transition-all">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4" />
                <input
                  id="email"
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Verification Code via Resend...
                </>
              ) : (
                <>
                  Send 6-Digit OTP Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: 6-Digit OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="truncate max-w-[200px] font-semibold text-slate-900 dark:text-slate-200">
                {email}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-[11px] flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Change
              </button>
            </div>

            <div>
              <label htmlFor="otp" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Enter 6-Digit OTP Code
              </label>
              <div className="relative flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus-within:border-indigo-500/60 transition-all">
                <Key className="w-4 h-4 text-slate-400 absolute left-4" />
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-black tracking-[0.4em] text-center"
                  disabled={loading}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.trim().length !== 6}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Code...
                </>
              ) : (
                <>
                  Verify & Log In
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend OTP Button with Cooldown Countdown */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || resending}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:hover:text-slate-500 transition-colors"
              >
                <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {cooldown > 0 ? (
                  <span>Resend OTP in <strong className="text-indigo-500">{cooldown}s</strong></span>
                ) : (
                  <span>Didn't get code? <strong className="text-indigo-600 dark:text-indigo-400 underline">Resend OTP</strong></span>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

function Loader2({ className }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
