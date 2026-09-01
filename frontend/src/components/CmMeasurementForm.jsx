// FILE: frontend/src/components/CmMeasurementForm.jsx
import React, { useState } from 'react';
import { Ruler, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useTryOn } from '../context/TryOnContext';

export default function CmMeasurementForm({ onSave }) {
  const { userMeasurements, updateUserMeasurements } = useTryOn();

  const [chestCm, setChestCm] = useState(userMeasurements?.chestCm || 108);
  const [shoulderCm, setShoulderCm] = useState(userMeasurements?.shoulderCm || 46);
  const [waistCm, setWaistCm] = useState(userMeasurements?.waistCm || 92);
  const [heightCm, setHeightCm] = useState(userMeasurements?.heightCm || 178);
  const [weightKg, setWeightKg] = useState(userMeasurements?.weightKg || 76);

  // Size calculation algorithm based on standard international/Indian garment charts
  const calculateRecommendedSize = (chest) => {
    if (chest < 92) return { size: 'S', fitName: 'Slim Fit', range: '< 92 cm' };
    if (chest >= 92 && chest < 100) return { size: 'M', fitName: 'Tailored Fit', range: '92-99 cm' };
    if (chest >= 100 && chest < 110) return { size: 'L', fitName: 'Regular Fit', range: '100-109 cm' };
    if (chest >= 110 && chest < 118) return { size: 'XL', fitName: 'Relaxed Fit', range: '110-117 cm' };
    return { size: 'XXL', fitName: 'Comfort Fit', range: '≥ 118 cm' };
  };

  const currentResult = calculateRecommendedSize(chestCm);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserMeasurements({
      chestCm: Number(chestCm),
      shoulderCm: Number(shoulderCm),
      waistCm: Number(waistCm),
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      userSize: currentResult.size
    });
    if (onSave) onSave(currentResult.size);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-900/90 shadow-2xl">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
          <Ruler className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-white">Body Measurement Calculator (Centimeters)</h3>
          <p className="text-xs text-slate-400">Enter your exact cm body metrics for precise garment sizing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          
          {/* Chest cm */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Chest / Bust (cm)</label>
            <input
              type="number"
              min="70"
              max="150"
              value={chestCm}
              onChange={(e) => setChestCm(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              required
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. 108 cm</span>
          </div>

          {/* Shoulder cm */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Shoulders (cm)</label>
            <input
              type="number"
              min="30"
              max="70"
              value={shoulderCm}
              onChange={(e) => setShoulderCm(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              required
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. 46 cm</span>
          </div>

          {/* Waist cm */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Waist (cm)</label>
            <input
              type="number"
              min="60"
              max="140"
              value={waistCm}
              onChange={(e) => setWaistCm(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              required
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. 92 cm</span>
          </div>

          {/* Height cm */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Height (cm)</label>
            <input
              type="number"
              min="120"
              max="220"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              required
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. 178 cm</span>
          </div>

          {/* Weight kg */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Weight (kg)</label>
            <input
              type="number"
              min="30"
              max="160"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              required
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. 76 kg</span>
          </div>

          {/* Calculated Output Box */}
          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Calculated Size</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{currentResult.size}</span>
              <span className="text-[10px] text-slate-400 font-semibold">({currentResult.fitName})</span>
            </div>
            <span className="text-[10px] text-slate-400">Chest Range: {currentResult.range}</span>
          </div>

        </div>

        {/* Submit Save Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          Apply {chestCm} cm Measurements & Confirm Size {currentResult.size}
        </button>
      </form>
    </div>
  );
}
