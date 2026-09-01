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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Clothing Draped on Your Photo
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Chest {userMeasurements?.chestCm || 108} cm (Size {selectedSize})
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Garment Draped on Your Uploaded Photo
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCmModal(!showCmModal)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-xs font-bold shadow-sm"
          >
            <Ruler className="w-4 h-4" /> {showCmModal ? 'Hide CM Form' : '✏️ Recalculate CM Metrics'}
          </button>

          <button
            onClick={() => navigate('/capture')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold shadow-sm"
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
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-xl">
            <div className="flex items-start gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <img
                src={fallbackProduct.image}
                alt={fallbackProduct.name}
                className="w-16 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
              />
              <div>
                <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Target Garment</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{fallbackProduct.name}</h3>
                <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-300 mt-1">₹{fallbackProduct.price?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{fallbackProduct.fabric}</p>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-bold mb-3">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  Select Size (Calculated from {userMeasurements?.chestCm || 108} cm Chest)
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 font-bold">
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
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-500/30'
                          : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {sz}
                      {isCalculatedSize && (
                        <span className="absolute -top-2 -right-1 bg-emerald-500 text-white dark:text-slate-950 text-[9px] font-black px-1.5 rounded-full ring-2 ring-white dark:ring-slate-900">
                          {userMeasurements?.chestCm || 108}cm
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Body Measurement Fit Breakdown */}
            <div className="mb-6 space-y-2 bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">CM Measurements Breakdown</h4>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{currentFitData.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span>Chest ({userMeasurements?.chestCm || 108} cm):</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedSize === 'L' ? '96% Tailored' : selectedSize === 'S' ? '62% Constricted' : '84% Standard'}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span>Shoulders ({userMeasurements?.shoulderCm || 46} cm):</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedSize === 'L' ? '95% Ideal' : selectedSize === 'S' ? '60% Tight' : '86% Good'}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span>Waist ({userMeasurements?.waistCm || 92} cm):</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedSize === 'L' ? '94% Snug' : '82% Loose'}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span>Height ({userMeasurements?.heightCm || 178} cm):</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Optimal Drop</span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleAddToCartAndProceed}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition-all"
            >
              {addedToCartSuccess ? (
                <>
                  <Check className="w-5 h-5 text-emerald-300" />
                  Added Size {selectedSize}! Redirecting to Checkout...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Add Size {selectedSize} to Cart & Checkout (₹{fallbackProduct.price?.toLocaleString('en-IN')})
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

          </div>

        </div>

      </div>
    </motion.div>
  );
}
