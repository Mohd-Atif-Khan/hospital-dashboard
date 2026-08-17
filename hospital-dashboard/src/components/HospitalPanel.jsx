"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function HospitalPanel({ hospital, onUpdated }) {
  const [loading, setLoading] = useState(false);

  if (!hospital) return null;

  const updateBeds = async (newBeds, newIcu) => {
    setLoading(true);
    try {
      const res = await api.put(`/hospitals/${hospital._id}/beds`, {
        availableBeds: newBeds,
        availableIcuBeds: newIcu,
      });
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const bedRatio = hospital.totalBeds ? (hospital.availableBeds / hospital.totalBeds) * 100 : 0;
  const icuRatio = hospital.icuBeds ? (hospital.availableIcuBeds / hospital.icuBeds) * 100 : 0;

  return (
    <div className="bg-[#0b1322] border border-slate-800/90 rounded-xl p-5 text-white shadow-xl flex flex-col gap-4">
      {/* Header with Left Accent Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="border-l-2 border-emerald-500 pl-3">
          <h3 className="text-sm font-bold text-slate-100 tracking-tight">BED & ICU CAPACITY CONTROLS</h3>
          <p className="text-[11px] text-slate-400 font-medium">Instant staff allocation & dynamic reservation</p>
        </div>

        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-[#070d18] border border-slate-800 px-2.5 py-1 rounded">
          AUTO-RESERVE ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Regular Beds Control */}
        <div className="bg-[#070d18] border border-slate-800/90 rounded-lg p-4 flex flex-col justify-between gap-3 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Regular Beds</span>
            <span className="text-xs font-bold text-emerald-400">{hospital.availableBeds} / {hospital.totalBeds}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="text-3xl font-black text-white">
              {hospital.availableBeds}
            </div>

            <div className="flex gap-1">
              <button
                disabled={loading || hospital.availableBeds <= 0}
                onClick={() => updateBeds(hospital.availableBeds - 1, hospital.availableIcuBeds)}
                className="h-8 w-8 rounded bg-slate-800 hover:bg-red-600 text-white font-bold text-base flex items-center justify-center transition disabled:opacity-30 border border-slate-700"
                title="Decrement available bed"
              >
                -
              </button>
              <button
                disabled={loading || hospital.availableBeds >= hospital.totalBeds}
                onClick={() => updateBeds(hospital.availableBeds + 1, hospital.availableIcuBeds)}
                className="h-8 w-8 rounded bg-slate-800 hover:bg-emerald-600 text-white font-bold text-base flex items-center justify-center transition disabled:opacity-30 border border-slate-700"
                title="Increment available bed"
              >
                +
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#0b1322] h-1.5 rounded-sm overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                bedRatio <= 15 ? "bg-red-500" : bedRatio <= 40 ? "bg-amber-400" : "bg-emerald-500"
              }`}
              style={{ width: `${bedRatio}%` }}
            ></div>
          </div>
        </div>

        {/* ICU Beds Control */}
        <div className="bg-[#070d18] border border-slate-800/90 rounded-lg p-4 flex flex-col justify-between gap-3 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">ICU Beds</span>
            <span className="text-xs font-bold text-amber-400">{hospital.availableIcuBeds} / {hospital.icuBeds}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="text-3xl font-black text-white">
              {hospital.availableIcuBeds}
            </div>

            <div className="flex gap-1">
              <button
                disabled={loading || hospital.availableIcuBeds <= 0}
                onClick={() => updateBeds(hospital.availableBeds, hospital.availableIcuBeds - 1)}
                className="h-8 w-8 rounded bg-slate-800 hover:bg-red-600 text-white font-bold text-base flex items-center justify-center transition disabled:opacity-30 border border-slate-700"
                title="Decrement available ICU bed"
              >
                -
              </button>
              <button
                disabled={loading || hospital.availableIcuBeds >= hospital.icuBeds}
                onClick={() => updateBeds(hospital.availableBeds, hospital.availableIcuBeds + 1)}
                className="h-8 w-8 rounded bg-slate-800 hover:bg-emerald-600 text-white font-bold text-base flex items-center justify-center transition disabled:opacity-30 border border-slate-700"
                title="Increment available ICU bed"
              >
                +
              </button>
            </div>
          </div>

          {/* ICU Progress Bar */}
          <div className="w-full bg-[#0b1322] h-1.5 rounded-sm overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                icuRatio <= 15 ? "bg-red-500" : icuRatio <= 40 ? "bg-amber-400" : "bg-emerald-500"
              }`}
              style={{ width: `${icuRatio}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
