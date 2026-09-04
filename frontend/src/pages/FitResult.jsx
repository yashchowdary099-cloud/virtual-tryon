// FILE: frontend/src/pages/FitResult.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingBag, ArrowRight, RotateCcw, Check, ShieldCheck, Ruler, CheckCircle2 } from 'lucide-react';
import ProgressStepper from '../components/ProgressStepper';
import FitScoreBadge from '../components/FitScoreBadge';
import AngleViewer from '../components/AngleViewer';
import CmMeasurementForm from '../components/CmMeasurementForm';
import { useTryOn } from '../context/TryOnContext';

export default function FitResult() {
  const navigate = useNavigate();
  const { selectedProduct, tryOnResult, userMeasurements, updateUserMeasurements, addToCart, setActiveStep } = useTryOn();

  const defaultUserSize = userMeasurements?.userSize || tryOnResult?.recommendedSize || 'L';
  const [selectedSize, setSelectedSize] = useState(defaultUserSize);
  const [showCmModal, setShowCmModal] = useState(false);
  const [addedToCartSuccess, setAddedToCartSuccess] = useState(false);

  useEffect(() => {
    setActiveStep(4);
    if (userMeasurements?.userSize) {
      setSelectedSize(userMeasurements.userSize);
    }
  }, [tryOnResult, userMeasurements]);

  const fallbackProduct = selectedProduct || {
    id: 'prod_levis_1',
    name: "Levi's Barstow Western Denim Shirt",
    price: 2799,
    fabric: '100% Cotton Premium Denim',
    fitType: 'Regular Fit',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image: 'https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8117.png'
  };

  const getDynamicScore = (size) => {
    const chest = userMeasurements?.chestCm || 108;
    if (size === 'L') {
      return { score: 96, label: `Perfect Fit for ${chest} cm Chest`, category: 'True to Size' };
    }
    if (size === 'XL') {
      return { score: 86, label: 'Relaxed Comfort Fit', category: 'Slightly Loose' };
    }
    if (size === 'M') {
      return { score: 76, label: `Snug Fit for ${chest} cm Chest`, category: 'Tight Fit' };
    }
    if (size === 'S') {
      return { score: 62, label: `Restricted Fit for ${chest} cm Chest`, category: 'Too Small' };
    }
    return { score: 82, label: 'Oversized Fit', category: 'Loose' };
  };

  const currentFitData = getDynamicScore(selectedSize);

  const handleSizeChange = (sz) => {
    setSelectedSize(sz);
    updateUserMeasurements({ userSize: sz });
  };

  const handleAddToCartAndProceed = () => {
    addToCart(fallbackProduct, selectedSize);
    setAddedToCartSuccess(true);
    setTimeout(() => {
      navigate('/checkout');
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      <ProgressStepper activeStep={4} />

      {/* Header Result Summary */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EFE6] border border-[#E8E2D5] text-[#8C6D3F] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
              Virtual Fitting Complete
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E8E2D5] text-[#1A1817] text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#8C6D3F]" /> Chest {userMeasurements?.chestCm || 108} cm (Size {selectedSize})
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1817] tracking-tight">
            Garment Draped on Your Photo
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCmModal(!showCmModal)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-[#1A1817] border border-[#E8E2D5] hover:bg-[#FAF7F2] text-xs font-bold shadow-sm"
          >
            <Ruler className="w-4 h-4 text-[#8C6D3F]" /> {showCmModal ? 'Hide CM Form' : '✏️ Recalculate CM Metrics'}
          </button>

          <button
            onClick={() => navigate('/capture')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E8E2D5] text-[#1A1817] hover:bg-[#FAF7F2] text-xs font-bold shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> Retake Photo
          </button>
        </div>
      </div>

      {/* Embedded CM Modal if toggled */}
      {showCmModal && (
        <div className="mb-6">
          <CmMeasurementForm onSave={(newSz) => { setSelectedSize(newSz); setShowCmModal(false); }} />
        </div>
      )}

      {/* Main Grid: 4-Angle Viewer Left, Fit Details Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive 4-Angle Viewer with Draping on User Photo (7 cols) */}
        <div className="lg:col-span-7">
          <AngleViewer
            angles={tryOnResult?.angles}
            garmentImage={fallbackProduct.image}
            garmentName={fallbackProduct.name}
          />
        </div>

        {/* Right Column: Fit Confidence Score, Size Selector & Cart CTA (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Fit Score Badge */}
          <FitScoreBadge score={currentFitData.score} recommendedSize={selectedSize} />

          {/* Garment Details & Verified Size Selector */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-sm">
            <div className="flex items-start gap-4 mb-4 pb-4 border-b border-[#E8E2D5]">
              <img
                src={fallbackProduct.image}
                alt={fallbackProduct.name}
                className="w-16 h-20 object-contain rounded-xl border border-[#E8E2D5] bg-[#FAF7F2] p-1"
              />
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8C6D3F] tracking-widest">Selected Garment</span>
                <h3 className="font-serif text-xl font-bold text-[#1A1817] leading-tight mt-0.5">{fallbackProduct.name}</h3>
                <p className="text-sm font-extrabold text-[#1A1817] mt-1">₹{fallbackProduct.price?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-[#6E675F]">{fallbackProduct.fabric}</p>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-bold mb-3">
                <span className="text-[#1A1817] flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-[#8C6D3F]" />
                  Calculated Size ({userMeasurements?.chestCm || 108} cm Chest)
                </span>
                <span className="text-[#8C6D3F] bg-[#F4EFE6] px-2.5 py-0.5 rounded-full border border-[#E8E2D5] font-bold text-[11px]">
                  {currentFitData.category} ({currentFitData.score}%)
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                  const isCalculatedSize = sz === (userMeasurements?.userSize || 'L');
                  const isSelected = sz === selectedSize;

                  return (
                    <button
                      key={sz}
                      onClick={() => handleSizeChange(sz)}
                      className={`relative py-3 rounded-xl font-extrabold text-sm border transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#1A1817] border-[#1A1817] text-white shadow-md'
                          : 'bg-[#FAF7F2] border-[#E8E2D5] text-[#57524A] hover:text-[#1A1817]'
                      }`}
                    >
                      {sz}
                      {isCalculatedSize && (
                        <span className="absolute -top-2 -right-1 bg-[#C59B27] text-white text-[9px] font-black px-1.5 rounded-full border border-white">
                          {userMeasurements?.chestCm || 108}cm
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Body Measurement Fit Breakdown */}
            <div className="mb-6 space-y-2 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E2D5] text-xs">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#E8E2D5]">
                <h4 className="font-bold text-[#1A1817] uppercase tracking-wider text-[11px]">CM Measurements Breakdown</h4>
                <span className="text-[#8C6D3F] font-bold">{currentFitData.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between p-2 rounded-xl bg-white text-[#6E675F] border border-[#E8E2D5]">
                  <span>Chest ({userMeasurements?.chestCm || 108} cm):</span>
                  <span className="font-bold text-[#1A1817]">{selectedSize === 'L' ? '96% Tailored' : selectedSize === 'S' ? '62% Tight' : '84% Good'}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-white text-[#6E675F] border border-[#E8E2D5]">
                  <span>Shoulders ({userMeasurements?.shoulderCm || 46} cm):</span>
                  <span className="font-bold text-[#1A1817]">{selectedSize === 'L' ? '95% Ideal' : selectedSize === 'S' ? '60% Tight' : '86% Good'}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-white text-[#6E675F] border border-[#E8E2D5]">
                  <span>Waist ({userMeasurements?.waistCm || 92} cm):</span>
                  <span className="font-bold text-[#1A1817]">{selectedSize === 'L' ? '94% Snug' : '82% Loose'}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-white text-[#6E675F] border border-[#E8E2D5]">
                  <span>Height ({userMeasurements?.heightCm || 178} cm):</span>
                  <span className="font-bold text-[#1A1817]">Optimal Drop</span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleAddToCartAndProceed}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all"
            >
              {addedToCartSuccess ? (
                <>
                  <Check className="w-5 h-5 text-[#C59B27]" />
                  Added Size {selectedSize}! Redirecting to Bag...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#C59B27]" />
                  Add Size {selectedSize} to Bag & Checkout (₹{fallbackProduct.price?.toLocaleString('en-IN')})
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>

        </div>

      </div>
    </motion.div>
  );
}
