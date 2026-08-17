"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom Leaflet DivIcon for Hospital
const hospitalDivIcon = new L.DivIcon({
  className: "custom-hospital-marker",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; background: #0f2856; border: 3px solid #60a5fa; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.6);">
      <span style="font-size: 22px;">🏥</span>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

// Custom Leaflet DivIcon for Emergency Incoming Ambulance
const createAmbulanceIcon = (isSimulated = false) =>
  new L.DivIcon({
    className: "custom-ambulance-marker",
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(239, 68, 68, 0.4); border: 2px solid #ef4444; animation: radar-pulse 1.6s infinite ease-out;"></div>
        <div style="position: relative; width: 36px; height: 36px; background: #ef4444; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(239,68,68,0.8); z-index: 10;">
          <span style="font-size: 18px;">🚨</span>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true });
  }, [position, map]);
  return null;
}

export default function LiveMap({ hospital, ambulancePosition, incomingTrips = [] }) {
  const hospitalPos = hospital
    ? [hospital.location.lat, hospital.location.lng]
    : [28.6304, 77.2177];

  const activeAmbulancePos = ambulancePosition
    ? [ambulancePosition.lat, ambulancePosition.lng]
    : null;

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900">
      {/* Map Overlay Badge */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span className="text-slate-200">RADAR ACTIVE</span>
        <span className="text-slate-500">|</span>
        <span className="text-amber-400 font-mono">
          {incomingTrips.filter((t) => t.status === "in-transit").length} IN-TRANSIT
        </span>
      </div>

      <MapContainer
        center={activeAmbulancePos || hospitalPos}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Hospital Pin */}
        {hospital && (
          <Marker position={hospitalPos} icon={hospitalDivIcon}>
            <Popup>
              <div className="text-xs p-1 font-sans">
                <div className="font-bold text-slate-900 text-sm">{hospital.name}</div>
                <div className="text-slate-600 mt-1">Available Beds: {hospital.availableBeds} / ICU: {hospital.availableIcuBeds}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Real-time Simulated / Live Socket Ambulance */}
        {activeAmbulancePos && (
          <>
            <Marker position={activeAmbulancePos} icon={createAmbulanceIcon(true)}>
              <Popup>
                <div className="text-xs p-1 font-sans">
                  <div className="font-bold text-red-600">🚨 Live Simulator Ambulance</div>
                  <div className="text-slate-700">En Route to {hospital?.name || "Hospital"}</div>
                  <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                    {activeAmbulancePos[0].toFixed(4)}, {activeAmbulancePos[1].toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
            <Polyline
              positions={[activeAmbulancePos, hospitalPos]}
              pathOptions={{ color: "#ef4444", weight: 4, dashArray: "8, 8", opacity: 0.8 }}
            />
          </>
        )}

        {/* Incoming Trips from Database */}
        {incomingTrips.map((trip) => {
          if (!trip.currentLocation?.lat || !trip.currentLocation?.lng) return null;
          const tripPos = [trip.currentLocation.lat, trip.currentLocation.lng];
          return (
            <div key={trip._id}>
              <Marker position={tripPos} icon={createAmbulanceIcon(false)}>
                <Popup>
                  <div className="text-xs p-1 font-sans">
                    <div className="font-bold text-slate-900">{trip.patientName} ({trip.patientAge}y)</div>
                    <div className="text-red-600 font-semibold mt-0.5">Vehicle: {trip.ambulanceId}</div>
                    <div className="text-slate-600">ETA: {trip.etaMinutes || 10} mins</div>
                    <div className="text-slate-500 text-[10px] mt-1 bg-slate-100 p-1 rounded">
                      "{trip.emergencyNotes}"
                    </div>
                  </div>
                </Popup>
              </Marker>
              <Polyline
                positions={[tripPos, hospitalPos]}
                pathOptions={{ color: trip.priority === "CRITICAL" ? "#ef4444" : "#f59e0b", weight: 3, opacity: 0.7 }}
              />
            </div>
          );
        })}

        {activeAmbulancePos && <RecenterMap position={activeAmbulancePos} />}
      </MapContainer>
    </div>
  );
}

