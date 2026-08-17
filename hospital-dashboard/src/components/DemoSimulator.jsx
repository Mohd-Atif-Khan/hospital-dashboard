"use client";

import { useRef, useState } from "react";
import socket from "@/lib/socket";
import api from "@/lib/api";

export default function DemoSimulator({ hospital, onAutoDispatched }) {
  const timerRef = useRef(null);
  const [dispatching, setDispatching] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);

  const startSimulation = () => {
    if (!hospital || timerRef.current) return;
    let { lat, lng } = hospital.location;

    timerRef.current = setInterval(() => {
      lat += (Math.random() - 0.5) * 0.006;
      lng += (Math.random() - 0.5) * 0.006;
      socket.emit("location-update", { lat, lng });
      socket.emit("vitals-update", {
        hr: Math.floor(95 + Math.random() * 30),
        spo2: Math.floor(90 + Math.random() * 8),
        bp: `${Math.floor(130 + Math.random() * 25)}/${Math.floor(80 + Math.random() * 15)}`,
      });
    }, 2000);
  };

  const stopSimulation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Trigger Automatic Dispatch for Patient Distress Call in Kanpur (Swaroop Nagar area)
  const triggerAutoDispatch = async () => {
    setDispatching(true);
    try {
      const res = await api.post("/trips/dispatch-nearest", {
        patientName: "Dr. Alok Srivastava",
        patientAge: 62,
        patientGender: "Male",
        priority: "CRITICAL",
        emergencyNotes: "Acute chest discomfort reported via Patient App near Swaroop Nagar, Kanpur.",
        patientLocation: { lat: 26.4650, lng: 80.3180 },
        bedType: "icu",
        medicalHistory: ["Hypertension", "Previous Stent (2022)"],
      });

      const { hospital: assignedHosp, ambulance: assignedAmb, etaMinutes } = res.data;
      setLastNotification(`Assigned to ${assignedHosp.name} (${assignedHosp.distanceKm}km away) • Vehicle: ${assignedAmb.vehicleNumber} • ETA: ${etaMinutes} mins`);
      if (onAutoDispatched) onAutoDispatched(res.data);
    } catch (err) {
      console.error(err);
      setLastNotification("Dispatch error: " + (err.response?.data?.error || err.message));
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={triggerAutoDispatch}
          disabled={dispatching}
          className="flex-1 text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-lg px-3 py-2 hover:from-red-500 hover:to-amber-500 transition shadow-lg disabled:opacity-50"
        >
          {dispatching ? "Matching Nearest..." : "⚡ Patient Distress Call (Auto-Dispatch Kanpur Nearest)"}
        </button>

        <button
          onClick={startSimulation}
          disabled={!hospital}
          className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg px-3 py-2 transition disabled:opacity-50"
        >
          ▶ Live Simulator
        </button>

        <button
          onClick={stopSimulation}
          className="text-xs font-semibold bg-slate-800 text-slate-300 rounded-lg px-3 py-2 hover:bg-slate-700 transition border border-slate-700"
        >
          ■ Stop
        </button>
      </div>

      {lastNotification && (
        <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1.5 rounded-lg flex items-center justify-between">
          <span>🎯 {lastNotification}</span>
          <button onClick={() => setLastNotification(null)} className="text-slate-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}
    </div>
  );
}

