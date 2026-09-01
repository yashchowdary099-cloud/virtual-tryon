// FILE: frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Key, Phone, Sparkles, AlertCircle, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendOtp, verifyOtp } from '../api/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Phone Input, 2 = OTP Input
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const redirectPath = location.state?.from || '/';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(phoneNumber);
      setLoading(false);

      if (res.success) {
        setDemoOtp(res.demoOtp);
        setStep(2);
        setSuccessMsg('OTP code sent successfully!');
      } else {
        setErrorMsg(res.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error. Failed to reach the authentication server.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otp || !/^\d{4}$/.test(otp)) {
      setErrorMsg('Please enter the 4-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(phoneNumber, otp);
      setLoading(false);

      if (res.success) {
        login(res.user, res.token);
        setSuccessMsg('Verification successful! Logging in...');
        
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 800);
      } else {
        setErrorMsg(res.message || 'Incorrect OTP code. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error. Failed to reach the verification server.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xl relative overflow-hidden"
      >
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mx-auto mb-4 ring-2 ring-indigo-500/30">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="font-brand text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
            SFit <span className="bg-gradient-to-r from-indigo-600 to-pink-500 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">Login Gateway</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authenticate to save measurements, bags & check out securely.
          </p>
        </div>

        {/* Errors / Success displays */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        {step === 1 ? (
          // STEP 1: Phone Input
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Enter Mobile Number
              </label>
              <div className="relative flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus-within:border-indigo-500/60 transition-all">
                <Phone className="w-4 h-4 text-slate-400 absolute left-4" />
                <span className="text-slate-500 text-xs font-bold pl-11 pr-1 border-r border-slate-200 dark:border-slate-800 shrink-0">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  className="w-full bg-transparent pl-3 pr-4 py-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating OTP...
                </>
              ) : (
                <>
                  Send OTP Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          // STEP 2: OTP Input
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {/* Demo Mode helper code box */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-start gap-3 shadow-sm">
              <Sparkles className="w-5 h-5 shrink-0 mt-0.5 animate-pulse text-amber-500" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Demo Mode Active</h4>
                <p className="text-[11px] mt-1 leading-relaxed">
                  Your simulated OTP code is <strong className="text-amber-600 dark:text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/20">{demoOtp}</strong>. 
                  Enter it below to complete verification.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="otp" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Enter Verification Code (4 Digits)
              </label>
              <div className="relative flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus-within:border-indigo-500/60 transition-all">
                <Key className="w-4 h-4 text-slate-400 absolute left-4" />
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter 4-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 4))}
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-bold tracking-[0.25em]"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setStep(1); setErrorMsg(''); setSuccessMsg(''); }}
                className="py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                disabled={loading}
              >
                Back
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-black text-xs shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-[0.98]"
              >
                {loading ? 'Verifying...' : 'Verify & Log In'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// Simple loader icon component helper
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
