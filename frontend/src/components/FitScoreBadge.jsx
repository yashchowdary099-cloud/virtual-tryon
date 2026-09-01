// FILE: frontend/src/components/FitScoreBadge.jsx
import React from 'react';
import { Award, ShieldCheck, Zap } from 'lucide-react';

export default function FitScoreBadge({ score = 94, recommendedSize = 'M' }) {
  const getScoreTheme = (val) => {
    if (val >= 90) {
      return {
        bg: 'from-emerald-600/20 via-teal-600/10 to-transparent',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        label: 'Perfect Match'
      };
    } else if (val >= 80) {
      return {
        bg: 'from-amber-600/20 via-yellow-600/10 to-transparent',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        label: 'Good Fit'
      };
    } else {
      return {
        bg: 'from-rose-600/20 via-red-600/10 to-transparent',
        border: 'border-rose-500/40',
        text: 'text-rose-400',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        label: 'Tight Fit'
      };
    }
  };

  const theme = getScoreTheme(score);

  return (
    <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${theme.bg} border ${theme.border} backdrop-blur-md shadow-xl flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        {/* Radial Score Gauge */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={theme.text}
              strokeDasharray={`${score}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className={`absolute text-base font-extrabold ${theme.text}`}>
            {score}%
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${theme.badge}`}>
              {theme.label}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              AI Verified
            </span>
          </div>
          <h4 className="text-lg font-bold text-white leading-tight">
            Fit Confidence Score
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Based on 3D body tension maps & garment geometry
          </p>
        </div>
      </div>

      {/* Recommended Size Box */}
      <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center min-w-[90px]">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
          Rec. Size
        </span>
        <span className="text-2xl font-black text-indigo-400">
          {recommendedSize}
        </span>
      </div>
    </div>
  );
}
