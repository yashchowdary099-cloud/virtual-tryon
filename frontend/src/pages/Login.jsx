import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, Lock, AlertCircle, CheckCircle2, ArrowRight, RotateCw, KeyRound, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sendEmailOtp, verifyEmailOtp } = useAuth();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Destination path after login
  const redirectPath = location.state?.from || '/capture';
  const savedProduct = location.state?.product;

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true, state: { product: savedProduct } });
    }
  }, [user, navigate, redirectPath, savedProduct]);

  // Cooldown timer effect for Resend OTP
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await sendEmailOtp(email);
      setLoading(false);
      setOtpSent(true);
      setCooldown(30);
      setSuccessMsg(`A 6-digit OTP security code has been sent to ${email.trim()}.`);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to send OTP code. Please verify your email.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otp || otp.trim().length < 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      await verifyEmailOtp(email, otp);
      setLoading(false);
      setSuccessMsg('Authentication successful! Redirecting to TrueFit Studio...');
      setTimeout(() => {
        navigate(redirectPath, { replace: true, state: { product: savedProduct } });
      }, 600);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Invalid or expired OTP code. Please check and try again.');
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
            TrueFit <span className="text-[#8C6D3F]">Email OTP Login</span>
          </h2>
          <p className="text-xs text-[#6E675F] mt-1.5 leading-relaxed">
            {otpSent
              ? `Enter the 6-digit verification code sent to ${email}`
              : 'Sign in passwordlessly to access your fitting studio & 3D body scans.'}
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

        {/* Input Form */}
        {!otpSent ? (
          /* STEP 1: Email Input Form */
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[11px] font-extrabold text-[#8C6D3F] uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative flex items-center bg-[#FAF8F5] border border-[#E8E2D5] rounded-2xl focus-within:border-[#1A1817] focus-within:bg-white transition-all shadow-inner">
                <Mail className="w-4 h-4 text-[#9E968B] absolute left-4" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-xs text-[#1A1817] placeholder-[#9E968B] focus:outline-none font-medium"
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-white" />
                    Sending OTP Code...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
                    Send OTP Code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: 6-Digit OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label htmlFor="otp" className="block text-[11px] font-extrabold text-[#8C6D3F] uppercase tracking-widest mb-2">
                6-Digit Security OTP Code
              </label>
              <div className="relative flex items-center bg-[#FAF8F5] border border-[#E8E2D5] rounded-2xl focus-within:border-[#1A1817] focus-within:bg-white transition-all shadow-inner">
                <KeyRound className="w-4 h-4 text-[#9E968B] absolute left-4" />
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm tracking-widest font-mono text-[#1A1817] placeholder-[#9E968B] focus:outline-none font-bold"
                  disabled={loading}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-4 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-white" />
                    Verifying Code...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#C59B27]" />
                    Verify OTP & Log In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setErrorMsg('');
                  }}
                  className="text-[#6E675F] hover:text-[#1A1817] underline font-medium"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={cooldown > 0 || loading}
                  className="text-[#8C6D3F] hover:text-[#1A1817] font-bold flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[#E8E2D5] text-center text-xs text-[#6E675F]">
          By continuing, you agree to TrueFit's <span className="underline cursor-pointer hover:text-[#1A1817]">Terms of Service</span> and <span className="underline cursor-pointer hover:text-[#1A1817]">Privacy Policy</span>.
        </div>
      </motion.div>
    </div>
  );
}
