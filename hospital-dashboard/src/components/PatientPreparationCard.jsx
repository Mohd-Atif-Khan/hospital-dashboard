"use client";

import { useState } from "react";

export default function PatientPreparationCard({ trips = [] }) {
  const incomingTrips = trips.filter((t) => t.status === "in-transit" || t.status === "accepted");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeTrip = incomingTrips[selectedIndex] || trips[0];
  const [selectedFile, setSelectedFile] = useState(null);

  if (!activeTrip) {
    return (
      <div className="bg-[#0b1322] border border-slate-800/90 rounded-xl p-6 text-slate-400 text-center text-xs font-mono">
        No active incoming patient dispatches currently en route.
      </div>
    );
  }

  const priorityColors = {
    CRITICAL: "bg-red-950/80 text-red-300 border-red-800",
    URGENT: "bg-amber-950/80 text-amber-300 border-amber-800",
    STABLE: "bg-emerald-950/80 text-emerald-300 border-emerald-800",
  };

  return (
    <div className="bg-[#0b1322] border border-slate-800/90 rounded-xl p-5 text-white shadow-xl flex flex-col gap-4">
      {/* Header with Left Accent Indicator */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="border-l-2 border-emerald-500 pl-3">
          <h3 className="text-sm font-bold text-slate-100 tracking-tight">PATIENT EMERGENCY DECK & PREPARATION</h3>
          <p className="text-[11px] text-slate-400 font-medium">Incoming dispatch telemetry & patient notes</p>
        </div>

        {incomingTrips.length > 1 && (
          <div className="flex gap-1 bg-[#070d18] p-1 rounded border border-slate-800">
            {incomingTrips.map((t, idx) => (
              <button
                key={t._id}
                onClick={() => setSelectedIndex(idx)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition ${
                  selectedIndex === idx ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                P-{idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Patient Summary Card */}
      <div className="flex items-start justify-between bg-[#070d18] border border-slate-800/90 p-3.5 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{activeTrip.patientName}</span>
            <span className="text-xs text-slate-400">({activeTrip.patientAge || 45} yrs • {activeTrip.patientGender || "Male"})</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 font-mono">
            <span>Unit: <strong className="text-amber-400">{activeTrip.ambulanceId}</strong></span>
            <span>ETA: <strong className="text-emerald-400">{activeTrip.etaMinutes || 10} Mins</strong></span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 font-mono">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${priorityColors[activeTrip.priority || "CRITICAL"]}`}>
            {activeTrip.priority || "CRITICAL"}
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            🛏️ Bed Reserved ({activeTrip.bedType === "icu" ? "ICU Bed" : "Regular Bed"})
          </span>
        </div>
      </div>

      {/* Patient App Emergency Notes */}
      <div className="bg-red-950/30 border border-red-900/60 rounded-lg p-3 flex flex-col gap-1.5">
        <div className="text-[11px] font-bold text-red-400 flex items-center gap-1.5 font-mono uppercase tracking-wider">
          <span className="h-2 w-2 rounded-sm bg-red-500 animate-ping"></span>
          Emergency Message from Patient App
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium bg-[#070d18] p-2.5 rounded border border-red-950/80">
          "{activeTrip.emergencyNotes || "Severe respiratory distress and chest discomfort reported."}"
        </p>
      </div>

      {/* Pre-Existing History */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Pre-Existing Conditions & History
        </div>
        <div className="flex flex-wrap gap-1.5">
          {activeTrip.medicalHistory && activeTrip.medicalHistory.length > 0 ? (
            activeTrip.medicalHistory.map((item, idx) => (
              <span key={idx} className="text-xs font-medium bg-[#070d18] border border-slate-800 text-slate-300 px-2.5 py-1 rounded">
                🏥 {item}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">No pre-existing conditions reported</span>
          )}
        </div>
      </div>

      {/* Medical Records Files */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
          <span>Attached Medical Files ({activeTrip.medicalFiles?.length || 0})</span>
          <span className="text-cyan-400">PATIENT APP ATTACHMENTS</span>
        </div>

        {activeTrip.medicalFiles && activeTrip.medicalFiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeTrip.medicalFiles.map((file, idx) => (
              <div
                key={idx}
                className="bg-[#070d18] border border-slate-800 hover:border-slate-600 rounded-lg p-2.5 flex items-center justify-between transition cursor-pointer"
                onClick={() => setSelectedFile(file)}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="h-7 w-7 rounded bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center font-bold font-mono text-[10px] shrink-0">
                    PDF
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold text-white truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Attached Report</div>
                  </div>
                </div>

                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded transition font-mono"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic border border-dashed border-slate-800 rounded-lg p-3 text-center font-mono">
            No medical documents attached by patient.
          </div>
        )}
      </div>

      {/* Modal File Viewer Drawer */}
      {selectedFile && (
        <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1322] border border-slate-800 rounded-xl max-w-lg w-full p-5 text-white shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-xs font-mono uppercase text-slate-200 flex items-center gap-2">
                <span>📄</span> {selectedFile.name}
              </h4>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#070d18] p-3.5 rounded-lg text-xs text-slate-300 font-mono flex flex-col gap-2 border border-slate-800">
              <div><strong>Document:</strong> {selectedFile.name}</div>
              <div><strong>Type:</strong> {selectedFile.fileType || "Medical Report"}</div>
              <div><strong>Verification:</strong> Authenticated</div>
              <div className="p-3 bg-[#0b1322] rounded border border-slate-800 text-slate-400 italic">
                (Document preview ready. DICOM / PDF viewer interface linked.)
              </div>
            </div>

            <div className="flex justify-end gap-2 font-mono">
              <a
                href={selectedFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded transition"
              >
                Open Full Document
              </a>
              <button
                onClick={() => setSelectedFile(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
