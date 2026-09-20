import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Camera, Upload, CheckCircle2, RotateCcw, Sparkles, ArrowRight, ShieldCheck, Image as ImageIcon, Ruler, UserCheck, AlertCircle, ShoppingBag } from 'lucide-react';
import ProgressStepper from '../components/ProgressStepper';
import PoseGuideOverlay from '../components/PoseGuideOverlay';
import CmMeasurementForm from '../components/CmMeasurementForm';
import { useTryOn } from '../context/TryOnContext';
import { useAuth } from '../context/AuthContext';

export default function BodyCapture() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const { user } = useAuth();
  const { selectedProduct, capturedImages, updateCapturedAngle, userMeasurements, updateUserMeasurements, tagCapturedDataWithUser, setActiveStep } = useTryOn();

  const [useWebcam, setUseWebcam] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [showCmModal, setShowCmModal] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setActiveStep(2);
    if (user?.id) {
      tagCapturedDataWithUser(user.id);
    }
  }, [user]);

  const hasPhoto = Boolean(capturedImages.front);
  const hasGarment = Boolean(selectedProduct && (selectedProduct.image || selectedProduct.overlayImage));

  const captureWebcamPhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        updateCapturedAngle('front', imageSrc, user?.id);
        setValidationError('');
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
    grad.addColorStop(0, '#FAF7F2');
    grad.addColorStop(1, '#E8E2D5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 500);

    ctx.strokeStyle = 'rgba(26, 24, 23, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 400; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 500); ctx.stroke();
    }

    ctx.fillStyle = '#8C6D3F';
    ctx.beginPath();
    ctx.arc(200, 100, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(150, 160, 100, 180);
    ctx.fillRect(130, 160, 20, 140);
    ctx.fillRect(250, 160, 20, 140);

    ctx.fillStyle = '#1A1817';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('USER PHOTO: FRONT VIEW', 200, 400);

    const mockDataUrl = canvas.toDataURL('image/jpeg');
    updateCapturedAngle('front', mockDataUrl, user?.id);
    setValidationError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCapturedAngle('front', reader.result, user?.id);
        setValidationError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProceedToFitting = () => {
    setValidationError('');

    if (!hasPhoto) {
      setValidationError('Please upload or snap a front-facing photo first.');
      return;
    }

    if (!hasGarment) {
      setValidationError('Garment image is missing. Please select a garment from catalog or paste a product link.');
      return;
    }

    if (user?.id) {
      tagCapturedDataWithUser(user.id);
    }
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

      {/* Validation Error Banner if inputs missing */}
      {validationError && (
        <div className="bg-[#FFF8F6] border border-[#F5C2B8] p-4 rounded-2xl mb-6 flex items-center justify-between gap-4 text-xs text-[#B85C38] font-medium shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
          {!hasGarment && (
            <button
              onClick={() => navigate('/')}
              className="px-4 py-1.5 rounded-full bg-[#1A1817] text-white font-bold text-xs shrink-0 flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#C59B27]" /> Select Garment
            </button>
          )}
        </div>
      )}

      {/* Selected Garment Preview Banner */}
      {selectedProduct ? (
        <div className="bg-white border border-[#E8E2D5] p-4 rounded-2xl mb-6 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <img
              src={selectedProduct.image || selectedProduct.overlayImage}
              alt={selectedProduct.name}
              className="w-12 h-14 object-contain rounded-xl bg-[#FAF7F2] p-1 border border-[#E8E2D5]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-[#8C6D3F] bg-[#F4EFE6] px-2 py-0.5 rounded border border-[#E8E2D5]">
                  {selectedProduct.platform || 'Selected Garment'}
                </span>
                <span className="text-xs text-[#6E675F]">Category: {selectedProduct.garmentType || selectedProduct.category || 'Upper Body'}</span>
              </div>
              <h4 className="font-serif text-base font-bold text-[#1A1817] line-clamp-1 mt-0.5">{selectedProduct.name}</h4>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xs text-[#1A1817] hover:text-[#8C6D3F] font-bold bg-[#FAF7F2] hover:bg-[#F4EFE6] px-4 py-2 rounded-full border border-[#E8E2D5] transition-all shrink-0"
          >
            Change Link / Garment
          </button>
        </div>
      ) : (
        <div className="bg-[#FAF7F2] border border-[#E8E2D5] p-4 rounded-2xl mb-6 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#8C6D3F]" />
            <div>
              <h4 className="font-serif text-sm font-bold text-[#1A1817]">No Garment Selected Yet</h4>
              <p className="text-xs text-[#6E675F]">Select clothing from catalog or paste product link before virtual try-on.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xs text-white font-bold bg-[#1A1817] hover:bg-[#2D2A26] px-4 py-2 rounded-full transition-all shrink-0 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#C59B27]" /> Browse Catalog
          </button>
        </div>
      )}

      {/* CM Measurements & Size Header Bar */}
      <div className="bg-white border border-[#E8E2D5] p-4 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center text-[#8C6D3F]">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif text-base font-bold text-[#1A1817]">Body Measurements (CM) & Size Calculator</h4>
              <span className="bg-[#F4EFE6] text-[#8C6D3F] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#E8E2D5]">
                Chest {userMeasurements?.chestCm || 108} cm ➔ Size {userMeasurements?.userSize || 'L'}
              </span>
            </div>
            <p className="text-xs text-[#6E675F]">
              Shoulders: {userMeasurements?.shoulderCm || 46} cm | Waist: {userMeasurements?.waistCm || 92} cm | Height: {userMeasurements?.heightCm || 178} cm
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCmModal(!showCmModal)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#1A1817] border border-[#E8E2D5] font-bold text-xs shadow-sm"
        >
          <Ruler className="w-4 h-4 text-[#8C6D3F]" /> {showCmModal ? 'Hide CM Form' : '✏️ Edit CM Measurements'}
        </button>
      </div>

      {/* Embedded CM Measurement Form if toggled */}
      {showCmModal && (
        <div className="mb-6">
          <CmMeasurementForm onSave={() => setShowCmModal(false)} />
        </div>
      )}

      {/* Main Grid: Viewfinder Left, Captured Photo Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Col: Camera & Viewfinder (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-sm">
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-[#8C6D3F] uppercase tracking-widest">
                Front View Photo
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1A1817]">Front View Capture</h2>
            </div>

            <div className="flex items-center bg-[#FAF7F2] p-1 rounded-full border border-[#E8E2D5] text-xs">
              <button
                onClick={() => setUseWebcam(true)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold transition-all ${
                  useWebcam ? 'bg-[#1A1817] text-white shadow-sm' : 'text-[#6E675F] hover:text-[#1A1817]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" /> Webcam
              </button>
              <button
                onClick={() => setUseWebcam(false)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold transition-all ${
                  !useWebcam ? 'bg-[#1A1817] text-white shadow-sm' : 'text-[#6E675F] hover:text-[#1A1817]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>
            </div>
          </div>

          {/* Viewfinder */}
          <div className="relative aspect-[3/4] max-h-[480px] w-full rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center">
            {useWebcam && !cameraError ? (
              <div className="relative w-full h-full">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  onUserMediaError={() => setCameraError(true)}
                  className="w-full h-full object-cover"
                />
                <PoseGuideOverlay currentAngle="front" />
              </div>
            ) : (
              <div className="text-center p-6 max-w-sm">
                <ImageIcon className="w-12 h-12 text-[#8C6D3F] mx-auto mb-3 animate-bounce" />
                <h4 className="font-serif text-lg font-bold text-[#1A1817] mb-1">
                  Upload Front View Photo
                </h4>
                <p className="text-xs text-[#6E675F] mb-4">
                  Select a clear standing front-facing posture photo.
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
                  className="px-5 py-2.5 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white font-bold text-xs shadow-sm"
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
              className="px-4 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#2D2A26] text-xs font-semibold border border-[#E8E2D5]"
            >
              ⚡ Sample Photo
            </button>

            {useWebcam && !cameraError && (
              <button
                onClick={captureWebcamPhoto}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4 text-[#C59B27]" />
                Snap Front Photo
              </button>
            )}
          </div>
        </div>

        {/* Right Col: Captured Photo Preview & Proceed CTA (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-[#1A1817]">Your Front View Photo</h3>
              {hasPhoto ? (
                <span className="text-xs font-bold text-[#2E6B2E] bg-[#F4F9F4] px-2.5 py-1 rounded-full border border-[#C2E0C2] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              ) : (
                <span className="text-xs text-[#9E968B] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E8E2D5]">
                  Photo Required
                </span>
              )}
            </div>

            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center">
              {capturedImages.front ? (
                <img src={capturedImages.front} alt="Front View" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4 text-[#9E968B]">
                  <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No photo captured yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Submit CTA */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-sm">
            <button
              onClick={handleProceedToFitting}
              disabled={!hasPhoto || !hasGarment}
              className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full font-bold text-sm transition-all duration-300 ${
                hasPhoto && hasGarment
                  ? 'bg-[#1A1817] hover:bg-[#2D2A26] text-white shadow-md active:scale-[0.98]'
                  : 'bg-[#FAF7F2] text-[#9E968B] cursor-not-allowed border border-[#E8E2D5]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#C59B27]" />
              {!hasGarment
                ? 'Select a Garment First'
                : !hasPhoto
                ? 'Capture Front Photo First'
                : `Drape Outfit on My Photo (${userMeasurements?.userSize || 'L'})`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
