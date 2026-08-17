"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";

export default function DashboardHeader({ subtitle, roleLabel, name, hospital, session }) {
  const router = useRouter();
  const [showAccountModal, setShowAccountModal] = useState(false);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const isAdmin = roleLabel?.toLowerCase().includes("admin");

  return (
    <>
      <header className="bg-[#070d18] border-b border-slate-800 text-white sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Brand & Logo Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white p-1 shadow-md border border-emerald-500/40 flex items-center justify-center shrink-0">
              <img src="/greenpulse-logo.png" alt="Green Pulse" className="h-full w-full object-contain" />
            </div>

            <div className="border-l border-slate-800 pl-3">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-wider text-white font-sans uppercase">
                  GREEN <span className="text-emerald-400">PULSE</span>
                </h1>
                <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.5 rounded font-semibold">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
                {subtitle} · <span className="text-emerald-400 font-semibold">powered by allenhouse business school</span>
              </p>
            </div>
          </div>

          {/* Account Profile Bar & Logout Button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAccountModal(!showAccountModal)}
              className="flex items-center gap-2.5 bg-[#0e1726] hover:bg-[#132035] border border-slate-800 hover:border-emerald-500/40 rounded-lg px-3 py-1.5 transition text-left group"
              title="View Account Profile"
            >
              <div className="h-7 w-7 rounded bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                {isAdmin ? "🛡️" : "🏥"}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-semibold text-slate-100 max-w-[160px] truncate leading-tight">
                  {name || "User Account"}
                </span>
                <span className="text-[10px] text-emerald-400/90 font-mono leading-tight">
                  {roleLabel || "Member"}
                </span>
              </div>
              <svg
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showAccountModal ? "rotate-180 text-emerald-400" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-[#0e1726] hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-800 hover:border-red-800/80 rounded-lg px-3 py-2 text-xs font-semibold transition"
              title="Sign Out"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Account Profile Drawer Modal */}
      {showAccountModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setShowAccountModal(false)}
        >
          <div
            className="w-full max-w-sm bg-[#0b1322] border border-slate-800 rounded-xl p-5 text-white shadow-2xl animate-in fade-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg">
                  {isAdmin ? "🛡️" : "🏥"}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">{name || "Account Profile"}</h3>
                  <p className="text-[10px] text-emerald-400 font-mono font-semibold">{roleLabel}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="bg-[#070d18] p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5 font-mono">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Credentials</span>
                <div className="text-slate-300">Email: <strong className="text-white">{session?.email || hospital?.email || "staff@greenpulse.org"}</strong></div>
                <div className="text-slate-300">Status: <strong className="text-emerald-400">Active & Operational</strong></div>
                <div className="text-slate-300">Region: <strong className="text-slate-300">Kanpur Metro GIS</strong></div>
              </div>

              {hospital && (
                <div className="bg-[#070d18] p-3 rounded-lg border border-slate-800 flex flex-col gap-2 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hospital Capacity</span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-[#0e1726] p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">Normal Beds</div>
                      <div className="text-xs font-bold text-emerald-400">{hospital.availableBeds} / {hospital.totalBeds}</div>
                    </div>
                    <div className="bg-[#0e1726] p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">ICU Units</div>
                      <div className="text-xs font-bold text-amber-400">{hospital.availableIcuBeds} / {hospital.icuBeds}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Green Pulse Network</span>
                <span className="text-emerald-400">Allenhouse Business School</span>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-950/40 hover:bg-red-900/60 text-red-300 font-bold py-2 rounded-lg border border-red-800/80 transition flex items-center justify-center gap-2 mt-1 text-xs"
              >
                <span>🚪</span> Sign Out of System
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
