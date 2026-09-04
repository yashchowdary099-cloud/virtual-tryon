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
    { title: 'Replicate IDM-VTON Model Initialized', desc: 'Creating AI prediction worker on Nvidia GPU compute node' },
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
        category: selectedProduct?.category || 'upper_body',
        front: dataURLtoBlob(capturedImages.front),
        back: dataURLtoBlob(capturedImages.back),
        left: dataURLtoBlob(capturedImages.left),
        right: dataURLtoBlob(capturedImages.right)
      };

      const result = await processTryOn(payload);

      clearInterval(timer);

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

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8E2D5] text-center relative overflow-hidden shadow-sm">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FAF7F2] rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-[#1A1817]/10 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-[#8C6D3F]/30 animate-spin-slow" />
          <div className="w-16 h-16 rounded-full bg-[#1A1817] flex items-center justify-center shadow-md">
            <Cpu className="w-8 h-8 text-[#C59B27] animate-pulse" />
          </div>
        </div>

        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4EFE6] border border-[#E8E2D5] text-[#8C6D3F] text-xs font-extrabold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
          Replicate IDM-VTON Neural Fitting
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1817] tracking-tight mb-2">
          {errorMessage ? 'Try-On Generation Notice' : 'Generating Neural Virtual Try-On'}
        </h2>
        
        <p className="text-[#6E675F] text-xs sm:text-sm max-w-md mx-auto mb-8 font-medium">
          {errorMessage ? 'The AI model could not process your garment transfer request.' : 'Draping photorealistic fabric transfer onto your body pose (~15–30s)...'}
        </p>

        {/* ERROR DISPLAY BOX */}
        {errorMessage ? (
          <div className="max-w-lg mx-auto p-6 rounded-2xl bg-[#FFF8F6] border border-[#F5C2B8] text-left space-y-4 shadow-sm">
            <div className="flex items-center gap-3 text-[#B85C38] font-bold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Replicate API Status Notice</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#F5C2B8] text-xs font-mono text-[#B85C38] leading-relaxed break-words">
              {errorMessage}
            </div>

            <div className="text-xs text-[#57524A] space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-[#1A1817]">
                <Key className="w-4 h-4 text-[#8C6D3F]" /> Setup Instructions:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                <li>Get an API token from <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noreferrer" className="text-[#8C6D3F] underline font-bold">replicate.com/account/api-tokens</a></li>
                <li>Add it in <code className="bg-[#FAF7F2] px-1 py-0.5 rounded text-[#1A1817]">backend/.env</code> as: <code className="bg-[#FAF7F2] px-1 py-0.5 rounded text-[#8C6D3F]">REPLICATE_API_TOKEN=r8_...</code></li>
                <li>Restart backend server: <code className="bg-[#FAF7F2] px-1 py-0.5 rounded text-[#1A1817]">cd backend && npm start</code></li>
              </ol>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={executeTryOnPipeline}
                className="px-4 py-2.5 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-4 h-4 text-[#C59B27]" /> Retry AI Try-On
              </button>
              <button
                onClick={() => navigate('/capture')}
                className="px-4 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#1A1817] border border-[#E8E2D5] text-xs font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Studio Capture
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto space-y-3 text-left">
            {stages.map((stg, idx) => {
              const isDone = idx < currentStage;
              const isCurrent = idx === currentStage;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                    isDone
                      ? 'bg-[#FAF7F2] border-[#E8E2D5] text-[#2D2A26]'
                      : isCurrent
                      ? 'bg-white border-[#1A1817] ring-1 ring-[#1A1817]/20 text-[#1A1817] shadow-sm'
                      : 'bg-[#FAF8F5]/60 border-[#E8E2D5] text-[#9E968B]'
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[#8C6D3F]" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-[#1A1817] animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[#E8E2D5] text-[10px] font-bold flex items-center justify-center text-[#9E968B]">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold">{stg.title}</h4>
                    <p className="text-xs text-[#6E675F] mt-0.5">{stg.desc}</p>
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
