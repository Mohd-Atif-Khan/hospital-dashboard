"use client";

export default function VitalsPanel({ vitals, socketConnected, activePatientName = "Rajesh Sharma" }) {
  const hr = vitals?.hr ?? 115;
  const spo2 = vitals?.spo2 ?? 91;
  const bp = vitals?.bp ?? "155/95";

  const isCritical = hr > 100 || spo2 < 92;

  return (
    <div className="bg-[#0b1322] border border-slate-800/90 rounded-xl p-4 text-white shadow-xl flex flex-col gap-4">
      {/* Header with Left Accent Line */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="border-l-2 border-emerald-500 pl-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
            REAL-TIME PATIENT TELEMETRY STREAM
          </h3>
          <p className="text-[10px] text-slate-400 font-mono">Active ambulance telemetry monitor</p>
        </div>

        <span
          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
            isCritical
              ? "bg-red-950/80 text-red-300 border-red-800"
              : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
          }`}
        >
          {isCritical ? "CRITICAL ALERT" : "STABLE STREAM"}
        </span>
      </div>

      {/* Active Patient Identifier */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-[#070d18] px-3 py-1.5 rounded border border-slate-800 font-mono">
        <span>Patient: <strong className="text-white">{activePatientName}</strong></span>
        <span className="text-emerald-400">100Hz STREAM</span>
      </div>

      {/* ECG Graph Wave */}
      <div className="relative h-14 bg-[#070d18] rounded border border-slate-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:10px_10px] opacity-30"></div>
        <svg className="w-full h-10 stroke-emerald-400 fill-none" viewBox="0 0 500 50">
          <path
            d="M 0,25 L 40,25 L 50,10 L 60,40 L 70,5 L 80,45 L 90,25 L 140,25 L 150,12 L 160,38 L 170,8 L 180,42 L 190,25 L 240,25 L 250,10 L 260,40 L 270,5 L 280,45 L 290,25 L 340,25 L 350,12 L 360,38 L 370,8 L 380,42 L 390,25 L 440,25 L 450,10 L 460,40 L 470,5 L 480,45 L 500,25"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-ecg"
          />
        </svg>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#070d18] border border-slate-800 rounded p-3 flex flex-col items-center justify-center font-mono">
          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
            <span className="text-red-500 animate-pulse">❤️</span> HR
          </div>
          <div className="text-xl font-black text-white mt-1">
            {hr} <span className="text-[10px] font-normal text-slate-400">BPM</span>
          </div>
          <div className={`text-[9px] font-semibold mt-0.5 ${hr > 100 ? "text-red-400" : "text-emerald-400"}`}>
            {hr > 100 ? "Tachycardia" : "Normal"}
          </div>
        </div>

        <div className="bg-[#070d18] border border-slate-800 rounded p-3 flex flex-col items-center justify-center font-mono">
          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
            <span className="text-cyan-400">🫁</span> SpO2
          </div>
          <div className="text-xl font-black text-white mt-1">
            {spo2}<span className="text-[10px] font-normal text-slate-400">%</span>
          </div>
          <div className={`text-[9px] font-semibold mt-0.5 ${spo2 < 92 ? "text-amber-400" : "text-emerald-400"}`}>
            {spo2 < 92 ? "Hypoxia Risk" : "Optimal"}
          </div>
        </div>

        <div className="bg-[#070d18] border border-slate-800 rounded p-3 flex flex-col items-center justify-center font-mono">
          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
            <span className="text-amber-400">🩸</span> BP
          </div>
          <div className="text-lg font-black text-white mt-1">
            {bp}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            mmHg
          </div>
        </div>
      </div>
    </div>
  );
}
