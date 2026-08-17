"use client";

import { useEffect, useState } from "react";

export default function SplashScreen({ onFinished }) {
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFading(true);
    }, 1800);

    const timer2 = setTimeout(() => {
      setHidden(true);
      if (onFinished) onFinished();
    }, 2300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinished]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-gradient-to-br from-slate-950 via-[#051329] to-slate-950 flex flex-col items-center justify-center p-6 text-white transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Allenhouse Business School Logo Box */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-3xl bg-emerald-500/20 blur-xl animate-pulse"></div>
          <div className="relative h-20 w-20 rounded-2xl bg-white p-2 shadow-2xl border-2 border-emerald-500/40 flex items-center justify-center">
            <img src="/agoi-logo.png" alt="Allenhouse Business School" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Green Pulse Brand Title */}
        <div className="flex items-center gap-2 mb-1">
          <img src="/greenpulse-logo.png" alt="Green Pulse" className="h-8 w-8 object-contain" />
          <h1 className="text-3xl font-black tracking-tight text-white font-sans">
            GREEN <span className="text-emerald-400">PULSE</span>
          </h1>
        </div>

        {/* Powered by Subtitle */}
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          powered by <span className="text-white">allenhouse business school</span>
        </p>

        {/* Animated ECG Rhythm Loader */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mt-8 border border-slate-700">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-400 w-full animate-pulse"></div>
        </div>

        <div className="text-[10px] font-mono text-emerald-400/80 mt-3 tracking-wider uppercase">
          Initializing Emergency Command System...
        </div>
      </div>
    </div>
  );
}
