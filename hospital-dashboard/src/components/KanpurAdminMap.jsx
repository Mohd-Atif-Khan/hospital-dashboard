"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom Leaflet DivIcons for Kanpur Admin Map
const hospitalIcon = new L.DivIcon({
  className: "custom-admin-hospital",
  html: `
    <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #0f2856; border: 3px solid #60a5fa; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.6);">
      <span style="font-size: 20px;">🏥</span>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const activeAmbulanceIcon = new L.DivIcon({
  className: "custom-admin-active-amb",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 42px; height: 42px; border-radius: 50%; background: rgba(239, 68, 68, 0.4); border: 2px solid #ef4444; animation: radar-pulse 1.6s infinite ease-out;"></div>
      <div style="position: relative; width: 34px; height: 34px; background: #ef4444; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(239,68,68,0.8); z-index: 10;">
        <span style="font-size: 16px;">🚨</span>
      </div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const freeAmbulanceIcon = new L.DivIcon({
  className: "custom-admin-free-amb",
  html: `
    <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #10b981; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(16,185,129,0.5);">
      <span style="font-size: 15px;">🚑</span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function KanpurAdminMap({ hospitals = [], ambulances = [], trips = [] }) {
  // Kanpur City Center Coordinates
  const kanpurCenter = [26.4499, 80.3319];

  const incomingTrips = trips.filter((t) => t.status === "in-transit" || t.status === "accepted");

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-900">
      {/* Map Header Status Badge */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xl">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="text-white font-bold">KANPUR METRO GIS COMMAND MAP</span>
        <span className="text-slate-500">|</span>
        <span className="text-amber-400 font-mono">{hospitals.length} Hospitals</span>
        <span className="text-slate-500">|</span>
        <span className="text-cyan-400 font-mono">{ambulances.length} Fleet Ambulances</span>
      </div>

      <MapContainer
        center={kanpurCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Kanpur Hospitals */}
        {hospitals.map((h) => {
          if (!h.location?.lat || !h.location?.lng) return null;
          return (
            <Marker key={h._id} position={[h.location.lat, h.location.lng]} icon={hospitalIcon}>
              <Popup>
                <div className="text-xs p-1 font-sans">
                  <div className="font-bold text-slate-900 text-sm">{h.name}</div>
                  <div className="text-slate-600 mt-1">Available Beds: <strong className="text-emerald-600">{h.availableBeds} / {h.totalBeds}</strong></div>
                  <div className="text-slate-600">ICU Beds: <strong className="text-amber-600">{h.availableIcuBeds} / {h.icuBeds}</strong></div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Kanpur Ambulances */}
        {ambulances.map((amb) => {
          if (!amb.currentLocation?.lat || !amb.currentLocation?.lng) return null;
          const isBusy = amb.status === "on-trip";
          return (
            <Marker
              key={amb._id}
              position={[amb.currentLocation.lat, amb.currentLocation.lng]}
              icon={isBusy ? activeAmbulanceIcon : freeAmbulanceIcon}
            >
              <Popup>
                <div className="text-xs p-1 font-sans">
                  <div className="font-bold text-slate-900">{amb.vehicleNumber}</div>
                  <div className="text-slate-600">Driver: {amb.driverName} ({amb.driverPhone})</div>
                  <div className={`font-semibold mt-1 ${isBusy ? "text-red-600" : "text-emerald-600"}`}>
                    Status: {amb.status.toUpperCase()}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Active Emergency Trajectories in Kanpur */}
        {incomingTrips.map((trip) => {
          if (!trip.currentLocation?.lat || !trip.currentLocation?.lng) return null;
          const targetHospital = hospitals.find((h) => h._id === trip.hospitalId || h._id === trip.hospitalId?._id);
          if (!targetHospital?.location) return null;

          const tripPos = [trip.currentLocation.lat, trip.currentLocation.lng];
          const hospPos = [targetHospital.location.lat, targetHospital.location.lng];

          return (
            <Polyline
              key={trip._id}
              positions={[tripPos, hospPos]}
              pathOptions={{ color: "#ef4444", weight: 3, dashArray: "6, 6", opacity: 0.8 }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
