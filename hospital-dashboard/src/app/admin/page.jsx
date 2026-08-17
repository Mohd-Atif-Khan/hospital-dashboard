"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { getSession } from "@/lib/auth";
import DashboardHeader from "@/components/DashboardHeader";
import Card from "@/components/Card";
import AmbulanceList from "@/components/AmbulanceList";
import SupportPanel from "@/components/SupportPanel";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import DriverRoadFeedbackPanel from "@/components/DriverRoadFeedbackPanel";

const KanpurAdminMap = dynamic(() => import("@/components/KanpurAdminMap"), { ssr: false });

function bedTone(available, total) {
  if (!total) return "text-slate-400";
  const ratio = available / total;
  if (ratio <= 0.15) return "text-red-400";
  if (ratio <= 0.4) return "text-amber-400";
  return "text-emerald-400";
}

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [backendConnected, setBackendConnected] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [trips, setTrips] = useState([]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") {
      router.replace("/login");
      return;
    }
    setSession(s);
  }, [router]);

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setBackendConnected(res.data.status === "Backend running"))
      .catch(() => setBackendConnected(false));
  }, []);

  const refreshAdminData = () => {
    if (!session) return;
    api.get("/hospitals").then((res) => setHospitals(res.data)).catch(console.error);
    api.get("/ambulances").then((res) => setAmbulances(res.data)).catch(console.error);
    api.get("/trips").then((res) => setTrips(res.data)).catch(console.error);
    api.get("/support").then((res) => setTickets(res.data)).catch(console.error);
  };

  useEffect(() => {
    refreshAdminData();
  }, [session]);

  const totals = useMemo(() => {
    return hospitals.reduce(
      (acc, h) => ({
        beds: acc.beds + (h.availableBeds ?? 0),
        icu: acc.icu + (h.availableIcuBeds ?? 0),
      }),
      { beds: 0, icu: 0 }
    );
  }, [hospitals]);

  const availableAmbulances = ambulances.filter((a) => a.status === "available").length;
  const activeDispatches = trips.filter((t) => t.status === "in-transit" || t.status === "accepted").length;

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        subtitle="Kanpur Emergency Network Master Command Center"
        roleLabel="System Administrator"
        name={session.name}
        session={session}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* System Dispatch Accuracy & Metric Deck */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Dispatch Accuracy" value="98.6%" subtext="Haversine Nearest GIS Engine" accent="green" />
          <StatCard label="Nearest Facility Rate" value="99.2%" subtext="Optimal Hospital Bed Allocation" accent="navy" />
          <StatCard label="Avg Response Time" value="6.4m" subtext="Kanpur Metro Region Fleet" accent="gold" />
          <StatCard label="Active Dispatches" value={`${activeDispatches}`} subtext="Real-time GPS Telemetry" accent="red" />
        </div>

        {/* Hero Graphical Analytics */}
        <AnalyticsCharts trips={trips} hospitals={hospitals} />

        {/* Kanpur City GIS Master Command Map */}
        <div className="bg-[#0b1322] border border-slate-800/90 rounded-xl p-4 shadow-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="border-l-2 border-emerald-500 pl-3">
              <h2 className="text-sm font-bold text-slate-100 tracking-tight">KANPUR METROPOLITAN EMERGENCY GIS COMMAND MAP</h2>
              <p className="text-[11px] text-slate-400 font-medium">Monitoring all registered Kanpur hospitals, active emergency dispatches & fleet ambulances</p>
            </div>

            <button
              onClick={refreshAdminData}
              className="text-xs font-mono font-semibold bg-[#070d18] hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded border border-slate-800 transition"
            >
              🔄 Refresh GIS Feed
            </button>
          </div>

          <KanpurAdminMap hospitals={hospitals} ambulances={ambulances} trips={trips} />
        </div>

        {/* Driver Road Alerts & Traffic Bottlenecks + Patient Reviews */}
        <DriverRoadFeedbackPanel />

        {/* Hospitals & Facilities Grid */}
        <div className="bg-[#0b1322] border border-slate-800/90 rounded-xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="border-l-2 border-emerald-500 pl-3">
              <h3 className="text-sm font-bold text-slate-100 tracking-tight">REGISTERED KANPUR HOSPITALS & OPERATIONAL CAPACITY</h3>
              <p className="text-[11px] text-slate-400 font-medium">Facility bed & ICU availability matrix</p>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Regular Beds: <strong className="text-emerald-400">{totals.beds}</strong> | ICU: <strong className="text-amber-400">{totals.icu}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {hospitals.map((h) => (
              <div key={h._id} className="bg-[#070d18] border border-slate-800/90 rounded-lg p-4 flex flex-col justify-between gap-3">
                <div>
                  <div className="font-bold text-xs text-white uppercase tracking-wide truncate">{h.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">{h.email}</div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono border-t border-slate-800/80 pt-2">
                  <span className={bedTone(h.availableBeds, h.totalBeds)}>
                    🛏️ {h.availableBeds}/{h.totalBeds} Beds
                  </span>
                  <span className={bedTone(h.availableIcuBeds, h.icuBeds)}>
                    🏥 {h.availableIcuBeds}/{h.icuBeds} ICU
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Directory with Driver Contact Numbers & Support */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card title="Registered Kanpur Fleet Ambulances & Drivers" icon="🚨">
            <AmbulanceList
              ambulances={ambulances}
              showHospital
              onUpdated={(updated) =>
                setAmbulances((prev) => prev.map((a) => (a._id === updated._id ? updated : a)))
              }
            />
          </Card>

          <Card title="Patient Support & Emergency Helpline" icon="☎️">
            <SupportPanel
              tickets={tickets}
              showHospital
              onCreated={(t) => setTickets((prev) => [t, ...prev])}
              onUpdated={(updated) =>
                setTickets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
              }
            />
          </Card>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500 py-6 border-t border-slate-900 flex items-center justify-center gap-2">
        <img src="/greenpulse-logo.png" alt="Green Pulse" className="h-4 w-4 object-contain" />
        <span>Green Pulse Emergency Network — Kanpur Metropolitan Command Center · <strong className="text-slate-400">powered by Allenhouse Business School</strong></span>
      </footer>
    </div>
  );
}


