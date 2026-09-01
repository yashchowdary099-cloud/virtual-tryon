// FILE: frontend/src/components/ProgressStepper.jsx
import React from 'react';
import { Check, Shirt, Camera, Cpu, Sparkles, CreditCard } from 'lucide-react';

export default function ProgressStepper({ activeStep }) {
  const steps = [
    { id: 1, label: 'Select Garment', icon: Shirt },
    { id: 2, label: '4-Angle Capture', icon: Camera },
    { id: 3, label: 'AI Fitting', icon: Cpu },
    { id: 4, label: 'Fit Analysis', icon: Sparkles },
    { id: 5, label: 'Checkout', icon: CreditCard }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      <div className="relative flex items-center justify-between">
        
        {/* Background Connector Bar */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
        
        {/* Active Connector Progress */}
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < activeStep;
          const isCurrent = step.id === activeStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-500'
                    : isCurrent
                    ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/50 ring-4 ring-indigo-500/20 scale-110'
                    : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              
              <span
                className={`mt-2 text-xs font-semibold tracking-tight transition-colors duration-200 hidden sm:block ${
                  isCurrent
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : isCompleted
                    ? 'text-slate-800 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-500'
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
