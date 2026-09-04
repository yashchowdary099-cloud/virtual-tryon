// FILE: frontend/src/components/FitScoreBadge.jsx
import React from 'react';
import { Award, ShieldCheck, Zap } from 'lucide-react';

export default function FitScoreBadge({ score = 94, recommendedSize = 'M' }) {
  const getScoreTheme = (val) => {
    if (val >= 90) {
      return {
        bg: 'bg-white',
        border: 'border-[#E8E2D5]',
        text: 'text-[#1A1817]',
        badge: 'bg-[#F4EFE6] text-[#8C6D3F] border-[#E8E2D5]',
        label: 'Perfect Match'
      };
    } else if (val >= 80) {
      return {
        bg: 'bg-white',
        border: 'border-[#E8E2D5]',
        text: 'text-[#1A1817]',
        badge: 'bg-[#F4EFE6] text-[#8C6D3F] border-[#E8E2D5]',
        label: 'Good Fit'
      };
    } else {
      return {
        bg: 'bg-white',
        border: 'border-[#F5C2B8]',
        text: 'text-[#B85C38]',
        badge: 'bg-[#FFF8F6] text-[#B85C38] border-[#F5C2B8]',
        label: 'Tight Fit'
      };
    }
  };

  const theme = getScoreTheme(score);

  return (
    <div className={`p-6 rounded-3xl bg-white border ${theme.border} shadow-sm flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        {/* Radial Score Gauge */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#FAF7F2]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#1A1817]"
              strokeDasharray={`${score}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-base font-bold text-[#1A1817]">
            {score}%
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
              {theme.label}
            </span>
            <span className="text-xs text-[#6E675F] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C6D3F]" />
              AI Verified
            </span>
          </div>
          <h4 className="font-serif text-xl font-bold text-[#1A1817] leading-tight">
            Fit Confidence Score
          </h4>
          <p className="text-xs text-[#6E675F] mt-0.5">
            Based on 3D body tension maps & garment geometry
          </p>
        </div>
      </div>

      {/* Recommended Size Box */}
      <div className="bg-[#FAF7F2] border border-[#E8E2D5] p-3 rounded-2xl text-center min-w-[90px]">
        <span className="text-[10px] font-bold text-[#6E675F] uppercase tracking-widest block">
          Rec. Size
        </span>
        <span className="font-serif text-2xl font-bold text-[#1A1817]">
          {recommendedSize}
        </span>
      </div>
    </div>
  );
}
