// FILE: frontend/src/components/ProgressStepper.jsx
import React from 'react';
import { Check, Shirt, Camera, Cpu, Sparkles, CreditCard } from 'lucide-react';

export default function ProgressStepper({ activeStep }) {
  const steps = [
    { id: 1, label: 'Select Outfit', icon: Shirt },
    { id: 2, label: 'Photo Capture', icon: Camera },
    { id: 3, label: 'AI Fitting', icon: Cpu },
    { id: 4, label: 'Fit Analysis', icon: Sparkles },
    { id: 5, label: 'Checkout', icon: CreditCard }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-10 px-4">
      <div className="relative flex items-center justify-between">
        
        {/* Background Connector Bar */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E8E2D5] -translate-y-1/2 z-0" />
        
        {/* Active Connector Progress */}
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-[#1A1817] -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < activeStep;
          const isCurrent = step.id === activeStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#1A1817] text-white shadow-md ring-2 ring-[#1A1817]/20'
                    : isCurrent
                    ? 'bg-[#1A1817] text-white shadow-md scale-110 ring-4 ring-[#8C6D3F]/20'
                    : 'bg-white text-[#9E968B] border border-[#E8E2D5] shadow-sm'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 text-[#C59B27]" /> : <Icon className="w-4 h-4" />}
              </div>
              
              <span
                className={`mt-2.5 text-[11px] font-semibold tracking-tight transition-colors duration-200 hidden sm:block ${
                  isCurrent
                    ? 'text-[#1A1817] font-bold'
                    : isCompleted
                    ? 'text-[#57524A]'
                    : 'text-[#9E968B]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
