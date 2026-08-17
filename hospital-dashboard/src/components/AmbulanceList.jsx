"use client";

import { useState } from "react";
import api from "@/lib/api";

const STATUS_STYLES = {
  available: "bg-emerald-950/80 text-emerald-300 border-emerald-800",
  "on-trip": "bg-red-950/90 text-red-300 border-red-800 animate-pulse-red",
  maintenance: "bg-amber-950/80 text-amber-300 border-amber-800",
};

const STATUS_OPTIONS = ["available", "on-trip", "maintenance"];

export default function AmbulanceList({ ambulances = [], showHospital = false, onUpdated }) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await api.put(`/ambulances/${id}`, { status });
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ul className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
      {ambulances.length === 0 && (
        <li className="text-xs text-slate-500 py-8 text-center border border-dashed border-slate-800 rounded-xl">
          No registered ambulances found.
        </li>
      )}
      {ambulances.map((a) => (
        <li
          key={a._id}
          className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-xs flex items-center justify-between gap-3 hover:border-slate-600 transition"
        >
          <div className="min-w-0 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center font-bold text-base shrink-0">
              🚨
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white font-mono text-sm">{a.vehicleNumber}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Driver: <strong className="text-slate-200">{a.driverName}</strong></span>
                <span>•</span>
                <a href={`tel:${a.driverPhone}`} className="text-cyan-400 hover:underline font-mono">
                  📞 {a.driverPhone}
                </a>
              </div>
              {showHospital && a.hospitalId?.name && (
                <div className="text-[10px] text-amber-400 mt-0.5 font-medium truncate">
                  🏥 {a.hospitalId.name}
                </div>
              )}
            </div>
          </div>

          <select
            value={a.status}
            disabled={updatingId === a._id}
            onChange={(e) => handleStatusChange(a._id, e.target.value)}
            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border cursor-pointer disabled:opacity-50 focus:outline-none ${STATUS_STYLES[a.status] || STATUS_STYLES.available}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-slate-900 text-white">
                {s.toUpperCase()}
              </option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  );
}

