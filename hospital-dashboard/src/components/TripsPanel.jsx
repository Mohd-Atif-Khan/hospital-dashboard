"use client";

import { useState } from "react";
import api from "@/lib/api";

const STATUS_STYLES = {
  pending: "bg-[#070d18] text-slate-400 border-slate-800",
  accepted: "bg-amber-950/80 text-amber-300 border-amber-800",
  "in-transit": "bg-red-950/80 text-red-300 border-red-800",
  arrived: "bg-emerald-950/80 text-emerald-300 border-emerald-800",
};

export default function TripsPanel({ hospitalId, trips = [], onCreated, onStatusUpdated }) {
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (tripId, newStatus) => {
    setUpdatingId(tripId);
    try {
      const res = await api.put(`/trips/${tripId}/status`, { status: newStatus, bedReserved: true });
      if (onStatusUpdated) onStatusUpdated(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!hospitalId) return;
    const form = new FormData(e.target);
    setCreating(true);
    try {
      const res = await api.post("/trips", {
        patientName: form.get("patientName"),
        patientAge: Number(form.get("patientAge")) || 40,
        ambulanceId: form.get("ambulanceId"),
        priority: form.get("priority"),
        emergencyNotes: form.get("emergencyNotes"),
        hospitalId,
        status: "in-transit",
        bedReserved: true,
      });
      if (onCreated) onCreated(res.data);
      e.target.reset();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-[#0b1322] border border-slate-800/90 rounded-xl p-5 text-white shadow-xl flex flex-col gap-4">
      {/* Header with Left Accent Line */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="border-l-2 border-emerald-500 pl-3">
          <h3 className="text-sm font-bold text-slate-100 tracking-tight">EMERGENCY DISPATCHES & INCOMING FLEET</h3>
          <p className="text-[11px] text-slate-400 font-medium">Live incoming ambulances en route to facility</p>
        </div>

        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-[#070d18] border border-slate-800 px-2.5 py-1 rounded">
          {trips.filter((t) => t.status === "in-transit").length} EN ROUTE
        </span>
      </div>

      <ul className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1 font-mono">
        {trips.length === 0 && (
          <li className="text-xs text-slate-500 py-8 text-center border border-dashed border-slate-800 rounded-lg font-mono">
            No emergency dispatches currently logged.
          </li>
        )}
        {trips.map((t) => {
          const isIncoming = t.status === "in-transit";
          return (
            <li
              key={t._id}
              className={`border rounded-lg p-3 text-xs flex flex-col gap-2 transition ${
                isIncoming
                  ? "bg-[#070d18] border-red-900/80 shadow-md"
                  : "bg-[#070d18] border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between font-sans">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{t.patientName}</span>
                  <span className="text-[11px] text-slate-400 font-mono">({t.patientAge || 45}y)</span>
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${STATUS_STYLES[t.status]}`}>
                    {t.status}
                  </span>
                  {t.bedReserved && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                      🛏️ Reserved
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Unit: <strong className="text-amber-400">{t.ambulanceId}</strong></span>
                <span>ETA: <strong className="text-emerald-400">{t.etaMinutes || 8} Mins</strong></span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 font-sans">
                <span className="text-[10px] text-slate-400 italic truncate max-w-[180px]">
                  "{t.emergencyNotes || "Dispatch active"}"
                </span>

                <div className="flex gap-1 font-mono">
                  {t.status === "pending" && (
                    <button
                      disabled={updatingId === t._id}
                      onClick={() => handleStatusChange(t._id, "in-transit")}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] px-2.5 py-1 rounded transition uppercase"
                    >
                      Accept & Dispatch
                    </button>
                  )}
                  {t.status === "in-transit" && (
                    <button
                      disabled={updatingId === t._id}
                      onClick={() => handleStatusChange(t._id, "arrived")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1 rounded transition uppercase"
                    >
                      Mark Arrived 🏁
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {hospitalId && (
        <form onSubmit={handleCreate} className="border-t border-slate-800 pt-3 flex flex-col gap-2.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Manually Log Emergency Dispatch
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              name="patientName"
              placeholder="Patient Name"
              required
              className="bg-[#070d18] border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              name="patientAge"
              type="number"
              placeholder="Age (e.g. 52)"
              className="bg-[#070d18] border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              name="ambulanceId"
              placeholder="Vehicle ID (AMB-AL-01)"
              required
              className="bg-[#070d18] border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <select
              name="priority"
              defaultValue="CRITICAL"
              className="bg-[#070d18] border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="URGENT">URGENT</option>
              <option value="STABLE">STABLE</option>
            </select>
          </div>
          <input
            name="emergencyNotes"
            placeholder="Emergency complaint / Patient notes"
            className="bg-[#070d18] border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded py-2 transition disabled:opacity-50 font-mono uppercase tracking-wider shadow-md"
          >
            {creating ? "Dispatching..." : "🚨 Dispatch Incoming Ambulance"}
          </button>
        </form>
      )}
    </div>
  );
}
