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
        className="bg-white rounded-3xl border border-[#E8E2D5] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative overflow-hidden"
      >
        {/* Background ambient glow effect */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-[#FAF7F2] rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1817] flex items-center justify-center text-white shadow-md mx-auto mb-4 border border-[#8C6D3F]/30">
            <Lock className="w-6 h-6 text-[#C59B27]" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#1A1817] tracking-tight">
            SFit <span className="text-[#8C6D3F]">Member Login</span>
          </h2>
          <p className="text-xs text-[#6E675F] mt-1.5 leading-relaxed">
            Sign in with email OTP to access your fitting studio, body measurements & virtual try-ons.
          </p>
        </div>

        {/* Dynamic Alerts */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-[#FFF8F6] border border-[#F5C2B8] text-xs text-[#B85C38] flex items-start gap-2.5 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-[#F4F9F4] border border-[#C2E0C2] text-xs text-[#2E6B2E] flex items-start gap-2.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2E6B2E]" />
              <span className="leading-relaxed font-medium">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Email Input Form */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-[11px] font-extrabold text-[#8C6D3F] uppercase tracking-widest mb-2">
                Gmail / Email Address
              </label>
              <div className="relative flex items-center bg-[#FAF8F5] border border-[#E8E2D5] rounded-2xl focus-within:border-[#1A1817] focus-within:bg-white transition-all shadow-inner">
                <Mail className="w-4 h-4 text-[#9E968B] absolute left-4" />
                <input
                  id="email"
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-xs text-[#1A1817] placeholder-[#9E968B] focus:outline-none font-medium"
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-white" />
                  Sending Security Code...
                </>
              ) : (
                <>
                  Send OTP Code
                  <ArrowRight className="w-4 h-4 text-[#C59B27]" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: 6-Digit OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="otp" className="block text-[11px] font-extrabold text-[#8C6D3F] uppercase tracking-widest">
                  6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] text-[#6E675F] hover:text-[#1A1817] font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Change Email
                </button>
              </div>

              <div className="relative flex items-center bg-[#FAF8F5] border border-[#E8E2D5] rounded-2xl focus-within:border-[#1A1817] focus-within:bg-white transition-all shadow-inner">
                <Key className="w-4 h-4 text-[#9E968B] absolute left-4" />
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-base tracking-[0.3em] font-mono text-[#1A1817] placeholder-[#9E968B] focus:outline-none"
                  disabled={loading}
                  autoComplete="one-time-code"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#6E675F]">
              <span>Didn't receive code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || resending}
                className="font-bold text-[#8C6D3F] hover:text-[#1A1817] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {resending ? (
                  <RotateCw className="w-3 h-3 animate-spin" />
                ) : cooldown > 0 ? (
                  `Resend in ${cooldown}s`
                ) : (
                  'Resend OTP'
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-4 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-white" />
                  Verifying...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#C59B27]" />
                  Verify & Enter SFit
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[#E8E2D5] text-center text-xs text-[#6E675F]">
          By continuing, you agree to SFit's <span className="underline cursor-pointer hover:text-[#1A1817]">Terms of Service</span> and <span className="underline cursor-pointer hover:text-[#1A1817]">Privacy Policy</span>.
        </div>
      </motion.div>
    </div>
  );
}
