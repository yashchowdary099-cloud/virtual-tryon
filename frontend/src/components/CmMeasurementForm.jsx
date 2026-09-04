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
    <div className="bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-sm">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E8E2D5]">
        <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#8C6D3F] border border-[#E8E2D5] flex items-center justify-center">
          <Ruler className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-[#1A1817]">Body Measurement Calculator (Centimeters)</h3>
          <p className="text-xs text-[#6E675F]">Enter your exact cm body metrics for precise garment sizing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          
          {/* Chest cm */}
          <div>
            <label className="block font-bold text-[#1A1817] mb-1">Chest / Bust (cm)</label>
            <input
              type="number"
              min="70"
              max="150"
              value={chestCm}
              onChange={(e) => setChestCm(Number(e.target.value))}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl px-3 py-2 text-[#1A1817] font-mono focus:outline-none focus:border-[#1A1817]"
              required
            />
            <span className="text-[10px] text-[#6E675F] mt-0.5 block">e.g. 108 cm</span>
          </div>

          {/* Shoulder cm */}
          <div>
            <label className="block font-bold text-[#1A1817] mb-1">Shoulders (cm)</label>
            <input
              type="number"
              min="30"
              max="70"
              value={shoulderCm}
              onChange={(e) => setShoulderCm(Number(e.target.value))}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl px-3 py-2 text-[#1A1817] font-mono focus:outline-none focus:border-[#1A1817]"
              required
            />
            <span className="text-[10px] text-[#6E675F] mt-0.5 block">e.g. 46 cm</span>
          </div>

          {/* Waist cm */}
          <div>
            <label className="block font-bold text-[#1A1817] mb-1">Waist (cm)</label>
            <input
              type="number"
              min="60"
              max="140"
              value={waistCm}
              onChange={(e) => setWaistCm(Number(e.target.value))}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl px-3 py-2 text-[#1A1817] font-mono focus:outline-none focus:border-[#1A1817]"
              required
            />
            <span className="text-[10px] text-[#6E675F] mt-0.5 block">e.g. 92 cm</span>
          </div>

          {/* Height cm */}
          <div>
            <label className="block font-bold text-[#1A1817] mb-1">Height (cm)</label>
            <input
              type="number"
              min="120"
              max="220"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl px-3 py-2 text-[#1A1817] font-mono focus:outline-none focus:border-[#1A1817]"
              required
            />
            <span className="text-[10px] text-[#6E675F] mt-0.5 block">e.g. 178 cm</span>
          </div>

          {/* Weight kg */}
          <div>
            <label className="block font-bold text-[#1A1817] mb-1">Weight (kg)</label>
            <input
              type="number"
              min="30"
              max="160"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl px-3 py-2 text-[#1A1817] font-mono focus:outline-none focus:border-[#1A1817]"
              required
            />
            <span className="text-[10px] text-[#6E675F] mt-0.5 block">e.g. 76 kg</span>
          </div>

          {/* Calculated Output Box */}
          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E2D5] flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#8C6D3F] uppercase">Calculated Size</span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-bold text-[#1A1817]">{currentResult.size}</span>
              <span className="text-[10px] text-[#6E675F] font-semibold">({currentResult.fitName})</span>
            </div>
            <span className="text-[10px] text-[#6E675F]">Chest Range: {currentResult.range}</span>
          </div>

        </div>

        {/* Submit Save Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#C59B27]" />
          Apply {chestCm} cm Measurements & Confirm Size {currentResult.size}
        </button>
      </form>
    </div>
  );
}
