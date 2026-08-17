"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import socket from "@/lib/socket";
import { getSession } from "@/lib/auth";
import DashboardHeader from "@/components/DashboardHeader";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import TripsPanel from "@/components/TripsPanel";
import VitalsPanel from "@/components/VitalsPanel";
import PatientPreparationCard from "@/components/PatientPreparationCard";
import DemoSimulator from "@/components/DemoSimulator";
import AmbulanceList from "@/components/AmbulanceList";
import SupportPanel from "@/components/SupportPanel";
import HospitalPanel from "@/components/HospitalPanel";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false });

export default function HospitalDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [backendConnected, setBackendConnected] = useState(null);
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [hospital, setHospital] = useState(null);
  const [trips, setTrips] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ambulancePosition, setAmbulancePosition] = useState(null);
  const [vitals, setVitals] = useState(null);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "hospital") {
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

  const refreshData = () => {
    if (!session) return;
    api
      .get("/hospitals")
      .then((res) => setHospital(res.data.find((h) => h._id === session.hospitalId) || null))
      .catch(console.error);
    api
      .get(`/trips/${session.hospitalId}`)
      .then((res) => setTrips(res.data))
      .catch(console.error);
    api
      .get(`/ambulances?hospitalId=${session.hospitalId}`)
      .then((res) => setAmbulances(res.data))
      .catch(console.error);
    api
      .get(`/support?hospitalId=${session.hospitalId}`)
      .then((res) => setTickets(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    refreshData();
  }, [session]);

  useEffect(() => {
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onLocation = (data) => setAmbulancePosition(data);
    const onVitals = (data) => setVitals(data);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("ambulance-location", onLocation);
    socket.on("live-vitals", onVitals);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("ambulance-location", onLocation);
      socket.off("live-vitals", onVitals);
    };
  }, []);

  const incomingTrips = useMemo(
    () => trips.filter((t) => t.status === "in-transit" || t.status === "accepted"),
    [trips]
  );
  const availableAmbulances = useMemo(
    () => ambulances.filter((a) => a.status === "available").length,
    [ambulances]
  );

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        subtitle="Emergency Response & Operations Command Center"
        roleLabel="Hospital Triage Staff"
        name={session.name}
        hospital={hospital}
        session={session}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Top Emergency Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Available Regular Beds" value={hospital?.availableBeds ?? "--"} accent="green" />
          <StatCard label="Available ICU Beds" value={hospital?.availableIcuBeds ?? "--"} accent="gold" />
          <StatCard label="Incoming Ambulances" value={incomingTrips.length} accent="red" />
          <StatCard label="Ambulances Free" value={`${availableAmbulances}/${ambulances.length}`} accent="navy" />
        </div>

        {/* Main Command Center Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7/12 width): Map Hero & Patient Emergency Deck */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Expanded Hero Map Container */}
            <div className="flex flex-col gap-3 bg-[#0b1322] border border-slate-800/90 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center justify-between px-1">
                <div className="border-l-2 border-emerald-500 pl-3">
                  <h2 className="text-sm font-bold text-slate-100 tracking-tight">LIVE EMERGENCY RADAR & TRAJECTORY MAP</h2>
                  <p className="text-[11px] text-slate-400 font-medium">Tracking incoming emergency units en route</p>
                </div>

                <DemoSimulator hospital={hospital} />
              </div>

              <div className="h-[480px] w-full">
                <LiveMap
                  hospital={hospital}
                  ambulancePosition={ambulancePosition}
                  incomingTrips={incomingTrips}
                />
              </div>
            </div>

            {/* Patient Emergency Preparation Card */}
            <PatientPreparationCard trips={trips} />
          </div>

          {/* Right Column (5/12 width): Telemetry, Bed Controls, Trips */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Dynamic Bed & ICU Management */}
            <HospitalPanel
              hospital={hospital}
              onUpdated={(updated) => setHospital(updated)}
            />

            {/* Patient Vitals Stream */}
            <VitalsPanel
              vitals={vitals}
              socketConnected={socketConnected}
              activePatientName={incomingTrips[0]?.patientName || "Rajesh Sharma"}
            />

            {/* Emergency Dispatches */}
            <TripsPanel
              hospitalId={session.hospitalId}
              trips={trips}
              onCreated={(trip) => {
                setTrips((prev) => [trip, ...prev]);
                refreshData();
              }}
              onStatusUpdated={(updated) => {
                setTrips((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
                refreshData();
              }}
            />
          </div>
        </div>

        {/* Fleet & Support Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-2">
          <Card title="Hospital Ambulance Fleet" icon="🚨">
            <AmbulanceList
              ambulances={ambulances}
              onUpdated={(updated) =>
                setAmbulances((prev) => prev.map((a) => (a._id === updated._id ? updated : a)))
              }
            />
          </Card>

          <Card title="Emergency Customer Support & Helpline" icon="☎️">
            <SupportPanel
              tickets={tickets}
              hospitalId={session.hospitalId}
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
        <span>Green Pulse Emergency Coordination System — <strong className="text-slate-400">powered by Allenhouse Business School</strong></span>
      </footer>
    </div>
  );
}

