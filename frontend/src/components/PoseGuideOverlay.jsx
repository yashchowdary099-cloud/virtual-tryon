// FILE: frontend/src/components/PoseGuideOverlay.jsx
import React from 'react';

export default function PoseGuideOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-[#1A1817]/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#E8E2D5]/30">
        <div className="flex items-center gap-2">
          <span className="text-lg">👤</span>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">Front View Pose Guide</h4>
            <p className="text-[11px] text-[#E8E2D5]">Stand facing the camera with arms relaxed slightly away from hips.</p>
          </div>
        </div>
        <div className="bg-[#FAF7F2]/20 text-white border border-[#E8E2D5]/30 text-xs font-bold px-3 py-1 rounded-lg">
          Front View Active
        </div>
      </div>

      {/* Center Silhouette Overlay */}
      <div className="relative flex-1 flex items-center justify-center py-4">
        <div className="w-64 h-80 relative flex items-center justify-center opacity-80 animate-pulse-slow">
          <svg viewBox="0 0 200 400" className="w-full h-full stroke-emerald-400/60 fill-emerald-500/10 stroke-[2]">
            {/* Head & Neck */}
            <circle cx="100" cy="50" r="24" strokeDasharray="4 4" />
            <path d="M 90 74 L 90 90 M 110 74 L 110 90" strokeDasharray="4 4" />
            {/* Torso & Arms */}
            <path d="M 55 100 Q 100 85 145 100 L 160 210 M 40 210 L 55 100 L 70 230 M 130 230 L 145 100" strokeDasharray="4 4" />
            {/* Waist & Legs */}
            <path d="M 70 230 L 75 360 M 130 230 L 125 360" strokeDasharray="4 4" />
            {/* Center line */}
            <line x1="100" y1="20" x2="100" y2="380" className="stroke-indigo-400/40" strokeDasharray="6 6" />
            {/* Shoulder line */}
            <line x1="40" y1="100" x2="160" y2="100" className="stroke-indigo-400/40" strokeDasharray="6 6" />
          </svg>
        </div>

        {/* Laser Scanner Effect Line */}
        <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-[#8C6D3F] to-transparent shadow-[0_0_15px_#8C6D3F] animate-scan" />
      </div>

      {/* Bottom Visual Indicator */}
      <div className="flex items-center justify-center">
        <span className="bg-[#1A1817]/90 backdrop-blur-md text-emerald-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-emerald-500/40 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Align your body within the silhouette contour
        </span>
      </div>
    </div>
  );
}
