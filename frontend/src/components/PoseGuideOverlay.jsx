// FILE: frontend/src/components/PoseGuideOverlay.jsx
import React from 'react';
import { Camera, User, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function PoseGuideOverlay({ currentAngle, capturedCount }) {
  const guideConfigs = {
    front: {
      label: 'Front View',
      instruction: 'Stand facing the camera with arms relaxed slightly away from hips.',
      icon: '👤',
      svgSilhouette: (
        <svg viewBox="0 0 200 400" className="w-full h-full stroke-emerald-400/60 fill-emerald-500/10 stroke-[2] dash-array">
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
      )
    },
    back: {
      label: 'Back View',
      instruction: 'Turn around facing away from camera with posture upright.',
      icon: '🔄',
      svgSilhouette: (
        <svg viewBox="0 0 200 400" className="w-full h-full stroke-emerald-400/60 fill-emerald-500/10 stroke-[2]">
          <circle cx="100" cy="50" r="24" strokeDasharray="4 4" />
          {/* Spine indicator */}
          <line x1="100" y1="74" x2="100" y2="240" className="stroke-emerald-400/80 stroke-[3]" strokeDasharray="4 4" />
          <path d="M 55 100 Q 100 88 145 100 L 155 210 M 45 210 L 55 100 L 70 230 M 130 230 L 145 100" strokeDasharray="4 4" />
          <path d="M 70 230 L 75 360 M 130 230 L 125 360" strokeDasharray="4 4" />
        </svg>
      )
    },
    left: {
      label: 'Left Side View',
      instruction: 'Turn 90 degrees to your right so your left profile faces camera.',
      icon: '👈',
      svgSilhouette: (
        <svg viewBox="0 0 200 400" className="w-full h-full stroke-emerald-400/60 fill-emerald-500/10 stroke-[2]">
          {/* Head profile */}
          <circle cx="110" cy="50" r="24" strokeDasharray="4 4" />
          {/* Torso profile */}
          <path d="M 90 90 C 80 140, 85 200, 95 230 L 90 360 M 120 90 C 130 140, 125 200, 115 230 L 110 360" strokeDasharray="4 4" />
          {/* Vertical plum line */}
          <line x1="105" y1="20" x2="105" y2="380" className="stroke-indigo-400/40" strokeDasharray="6 6" />
        </svg>
      )
    },
    right: {
      label: 'Right Side View',
      instruction: 'Turn 90 degrees to your left so your right profile faces camera.',
      icon: '👉',
      svgSilhouette: (
        <svg viewBox="0 0 200 400" className="w-full h-full stroke-emerald-400/60 fill-emerald-500/10 stroke-[2]">
          {/* Head profile */}
          <circle cx="90" cy="50" r="24" strokeDasharray="4 4" />
          {/* Torso profile */}
          <path d="M 80 90 C 70 140, 75 200, 85 230 L 90 360 M 110 90 C 120 140, 115 200, 105 230 L 95 360" strokeDasharray="4 4" />
          {/* Vertical plum line */}
          <line x1="95" y1="20" x2="95" y2="380" className="stroke-indigo-400/40" strokeDasharray="6 6" />
        </svg>
      )
    }
  };

  const current = guideConfigs[currentAngle] || guideConfigs.front;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">{current.icon}</span>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">{current.label} Pose Guide</h4>
            <p className="text-[11px] text-slate-400">{current.instruction}</p>
          </div>
        </div>
        <div className="bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-3 py-1 rounded-lg">
          {capturedCount} of 4 Ready
        </div>
      </div>

      {/* Center Silhouette Overlay */}
      <div className="relative flex-1 flex items-center justify-center py-4">
        <div className="w-64 h-80 relative flex items-center justify-center opacity-80 animate-pulse-slow">
          {current.svgSilhouette}
        </div>

        {/* Laser Scanner Effect Line */}
        <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_#6366f1] animate-scan" />
      </div>

      {/* Bottom Visual Indicator */}
      <div className="flex items-center justify-center">
        <span className="bg-slate-950/90 backdrop-blur-md text-emerald-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-emerald-500/40 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Align your body within the silhouette contour
        </span>
      </div>
    </div>
  );
}
