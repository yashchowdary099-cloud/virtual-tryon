// FILE: frontend/src/pages/FittingProcess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, CheckCircle2, Loader2, Sparkles, AlertCircle, RefreshCw, ArrowLeft, Key } from 'lucide-react';
import ProgressStepper from '../components/ProgressStepper';
import { useTryOn } from '../context/TryOnContext';
import { processTryOn } from '../api';

export default function FittingProcess() {
  const navigate = useNavigate();
  const { selectedProduct, capturedImages, userMeasurements, setTryOnResult, setActiveStep } = useTryOn();

  const [currentStage, setCurrentStage] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const stages = [
    { title: 'Uploading Posture & Garment Assets', desc: 'Sending front posture photo and garment image to backend API' },
    { title: 'Replicate IDM-VTON Model Initialized', desc: 'Creating AI prediction worker on Nvidia A100 GPU compute node' },
    { title: 'Photorealistic AI Diffusion & Draping', desc: 'Synthesizing fabric transfer, lighting gradients & body alignment (~15–30s)' },
    { title: 'Rendering Final Composited Output', desc: 'Finalizing high-resolution try-on result and verifying size match' }
  ];

  useEffect(() => {
    setActiveStep(3);
    executeTryOnPipeline();
  }, []);

  const dataURLtoBlob = (dataurl) => {
    if (!dataurl || !dataurl.startsWith('data:')) return null;
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const executeTryOnPipeline = async () => {
    setErrorMessage(null);
    setCurrentStage(0);

    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 5000);

    try {
      const targetSize = userMeasurements?.userSize || 'L';

      const payload = {
        productId: selectedProduct?.id || 'myntra_men_1',
        preferredSize: targetSize,
        garmentImage: selectedProduct?.overlayImage || selectedProduct?.image,
        garmentName: selectedProduct?.name || 'Casual Shirt',
        front: dataURLtoBlob(capturedImages.front),
        back: dataURLtoBlob(capturedImages.back),
        left: dataURLtoBlob(capturedImages.left),
        right: dataURLtoBlob(capturedImages.right)
      };

      const result = await processTryOn(payload);

      clearInterval(timer);

      // STRICT VERIFICATION: Do NOT navigate to /result if backend returned success === false!
      if (result && result.success && result.angles && result.angles.front && result.angles.front.url) {
        setCurrentStage(stages.length - 1);
        setTryOnResult(result);
        setTimeout(() => {
          navigate('/result');
        }, 800);
      } else {
        throw new Error(result?.message || 'Replicate IDM-VTON model returned no output image URL');
      }

    } catch (err) {
      clearInterval(timer);
      console.error('Fitting Pipeline Error:', err);
      // STAY ON ERROR SCREEN - DO NOT FALL BACK TO FAKE RESULT!
      setErrorMessage(err.message || 'Virtual try-on generation failed. Please check your Replicate API key.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <ProgressStepper activeStep={3} />

      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-purple-500/40 animate-spin-slow" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/40">
            <Cpu className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-black uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          Replicate IDM-VTON AI Engine
        </span>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          {errorMessage ? 'Try-On Generation Failed' : 'Generating Real AI Try-On'}
        </h2>
        
        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-md mx-auto mb-8 font-medium">
          {errorMessage ? 'The AI model could not process your garment transfer request.' : 'Generating photorealistic garment transfer via Replicate IDM-VTON model — this takes ~15–30 seconds...'}
        </p>

        {/* STRICT ERROR DISPLAY BOX (NO FAKE FALLBACK) */}
        {errorMessage ? (
          <div className="max-w-lg mx-auto p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-left space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <span>Real Replicate API Error</span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-100/60 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 text-xs font-mono text-rose-800 dark:text-rose-300 leading-relaxed break-words">
              {errorMessage}
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-white">
                <Key className="w-4 h-4 text-amber-500" /> How to fix:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                <li>Get an API token from <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noreferrer" className="text-indigo-500 underline font-semibold">replicate.com/account/api-tokens</a></li>
                <li>Add it in <code className="bg-slate-200 dark:bg-slate-900 px-1 py-0.5 rounded text-pink-500">backend/.env</code> as: <code className="bg-slate-200 dark:bg-slate-900 px-1 py-0.5 rounded text-emerald-500">REPLICATE_API_TOKEN=r8_...</code></li>
                <li>Restart backend server: <code className="bg-slate-200 dark:bg-slate-900 px-1 py-0.5 rounded text-indigo-400">cd backend && npm start</code></li>
              </ol>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={executeTryOnPipeline}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <RefreshCw className="w-4 h-4" /> Retry AI Try-On
              </button>
              <button
                onClick={() => navigate('/capture')}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Photo Capture
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto space-y-4 text-left">
            {stages.map((stg, idx) => {
              const isDone = idx < currentStage;
              const isCurrent = idx === currentStage;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                    isDone
                      ? 'bg-slate-100 dark:bg-slate-950/80 border-emerald-500/30 text-slate-700 dark:text-slate-200'
                      : isCurrent
                      ? 'bg-white dark:bg-slate-950 border-indigo-500/60 ring-2 ring-indigo-500/20 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold">{stg.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stg.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
