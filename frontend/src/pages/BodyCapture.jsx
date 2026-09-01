// FILE: frontend/src/pages/BodyCapture.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Camera, Upload, CheckCircle2, RotateCcw, Sparkles, ArrowRight, ShieldCheck, Image as ImageIcon, Ruler, UserCheck } from 'lucide-react';
import ProgressStepper from '../components/ProgressStepper';
import PoseGuideOverlay from '../components/PoseGuideOverlay';
import CmMeasurementForm from '../components/CmMeasurementForm';
import { useTryOn } from '../context/TryOnContext';

export default function BodyCapture() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const { selectedProduct, capturedImages, updateCapturedAngle, userMeasurements, updateUserMeasurements, setActiveStep } = useTryOn();

  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [useWebcam, setUseWebcam] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [showCmModal, setShowCmModal] = useState(false);

  const angles = [
    { key: 'front', label: 'Front View', desc: 'Face forward, arms relaxed' },
    { key: 'back', label: 'Back View', desc: 'Turn around, spine straight' },
    { key: 'left', label: 'Left Side View', desc: 'Turn right 90 degrees' },
    { key: 'right', label: 'Right Side View', desc: 'Turn left 90 degrees' }
  ];

  const currentAngle = angles[currentAngleIndex];

  useEffect(() => {
    setActiveStep(2);
  }, []);

  const totalCaptured = Object.values(capturedImages).filter(Boolean).length;
  const isAllCaptured = totalCaptured === 4;

  const captureWebcamPhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        updateCapturedAngle(currentAngle.key, imageSrc);
        advanceToNextUncaptured();
      }
    } else {
      createMockPhoto();
    }
  };

  const createMockPhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    
    const grad = ctx.createLinearGradient(0, 0, 400, 500);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 500);

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 400; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 500); ctx.stroke();
    }

    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(200, 100, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(150, 160, 100, 180);
    ctx.fillRect(130, 160, 20, 140);
    ctx.fillRect(250, 160, 20, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`USER PHOTO: ${currentAngle.label.toUpperCase()}`, 200, 400);

    const mockDataUrl = canvas.toDataURL('image/jpeg');
    updateCapturedAngle(currentAngle.key, mockDataUrl);
    advanceToNextUncaptured();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCapturedAngle(currentAngle.key, reader.result);
        advanceToNextUncaptured();
      };
      reader.readAsDataURL(file);
    }
  };

  const advanceToNextUncaptured = () => {
    if (currentAngleIndex < 3) {
      setCurrentAngleIndex((prev) => prev + 1);
    }
  };

  const handleProceedToFitting = () => {
    navigate('/fitting');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto px-4 py-6"
    >
      <ProgressStepper activeStep={2} />

      {/* CM Measurements & Size Header Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Body Measurements (CM) & Sizing</h4>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                Chest {userMeasurements?.chestCm || 108} cm ➔ Size {userMeasurements?.userSize || 'L'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Shoulders: {userMeasurements?.shoulderCm || 46} cm | Waist: {userMeasurements?.waistCm || 92} cm | Height: {userMeasurements?.heightCm || 178} cm
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCmModal(!showCmModal)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 font-bold text-xs shadow-sm"
        >
          <Ruler className="w-4 h-4" /> {showCmModal ? 'Hide CM Form' : '✏️ Edit Measurements in CM'}
        </button>
      </div>

      {/* Embedded CM Measurement Form if toggled */}
      {showCmModal && (
        <div className="mb-6">
          <CmMeasurementForm onSave={() => setShowCmModal(false)} />
        </div>
      )}

      {/* Main Grid: Viewfinder Left, Angles Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Col: Camera & Viewfinder (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-xl">
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Angle {currentAngleIndex + 1} of 4
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{currentAngle.label}</h2>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setUseWebcam(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  useWebcam ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" /> Webcam
              </button>
              <button
                onClick={() => setUseWebcam(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  !useWebcam ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>
            </div>
          </div>

          {/* Viewfinder */}
          <div className="relative aspect-[3/4] max-h-[480px] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
            {useWebcam && !cameraError ? (
              <div className="relative w-full h-full">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  onUserMediaError={() => setCameraError(true)}
                  className="w-full h-full object-cover"
                />
                <PoseGuideOverlay
                  currentAngle={currentAngle.key}
                  capturedCount={totalCaptured}
                />
              </div>
            ) : (
              <div className="text-center p-6 max-w-sm">
                <ImageIcon className="w-12 h-12 text-indigo-400 mx-auto mb-3 animate-bounce" />
                <h4 className="text-base font-bold text-white mb-1">
                  Upload {currentAngle.label} Photo
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Select a clear full-body image facing in the indicated posture direction.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30"
                >
                  Choose Image File
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              onClick={createMockPhoto}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700"
            >
              ⚡ Auto Sim Capture
            </button>

            {useWebcam && !cameraError && (
              <button
                onClick={captureWebcamPhoto}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/40 hover:shadow-indigo-600/60 active:scale-95 transition-all"
              >
                <Camera className="w-5 h-5" />
                Snap {currentAngle.label}
              </button>
            )}
          </div>
        </div>

        {/* Right Col: Captured Thumbnails & Proceed CTA (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full">
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Captured Pose Angles</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">All 4 angles will be used to drape your garment ON your photo.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {angles.map((ang, idx) => {
                const img = capturedImages[ang.key];
                const isActive = currentAngleIndex === idx;

                return (
                  <div
                    key={ang.key}
                    onClick={() => setCurrentAngleIndex(idx)}
                    className={`relative rounded-2xl p-3 border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                        : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{ang.label}</span>
                      {img ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                      )}
                    </div>

                    <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
                      {img ? (
                        <img src={img} alt={ang.label} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-600">Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Submit CTA */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
              <span>Capture Progress:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalCaptured} / 4 Done</span>
            </div>

            <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden mb-4 border border-slate-200 dark:border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${(totalCaptured / 4) * 100}%` }}
              />
            </div>

            <button
              onClick={handleProceedToFitting}
              disabled={!isAllCaptured}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-extrabold text-sm transition-all duration-300 ${
                isAllCaptured
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98]'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {isAllCaptured ? `Drape Garment on My Photo (${userMeasurements?.chestCm || 108} cm ➔ Size ${userMeasurements?.userSize || 'L'})` : 'Capture All 4 Angles First'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
