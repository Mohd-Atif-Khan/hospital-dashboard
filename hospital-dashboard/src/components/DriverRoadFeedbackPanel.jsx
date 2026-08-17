"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function DriverRoadFeedbackPanel() {
  const [feedback, setFeedback] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const loadFeedback = () => {
    api
      .get("/feedback")
      .then((res) => setFeedback(Array.isArray(res.data) ? res.data : []))
      .catch(() => setFeedback([]));
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    setSubmitting(true);
    try {
      await api.post("/feedback", {
        type: "driver_road",
        authorName: form.get("authorName"),
        authorRole: "Ambulance Driver",
        vehicleNumber: form.get("vehicleNumber"),
        locationName: form.get("locationName"),
        roadStatus: form.get("roadStatus"),
        trafficDelayMinutes: Number(form.get("trafficDelayMinutes")) || 0,
        comment: form.get("comment"),
      });
      e.target.reset();
      loadFeedback();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = feedback.filter((f) => {
    if (activeTab === "driver") return f.type === "driver_road";
    if (activeTab === "patient") return f.type === "patient_review";
    return true;
  });

  const statusColors = {
    "Green Corridor": "bg-emerald-950/80 text-emerald-300 border-emerald-800",
    Clear: "bg-cyan-950/80 text-cyan-300 border-cyan-800",
    Congested: "bg-amber-950/80 text-amber-300 border-amber-800",
    Construction: "bg-red-950/80 text-red-300 border-red-800",
  };

  return (
    <div className="bg-[#0b1322] border border-slate-800/90 rounded-xl p-5 text-white shadow-xl flex flex-col gap-4">
      {/* Header with Left Accent Indicator */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="border-l-2 border-emerald-500 pl-3">
          <h3 className="text-sm font-bold text-slate-100 tracking-tight">DRIVER ROAD ALERTS & PATIENT FEEDBACK INTELLIGENCE</h3>
          <p className="text-[11px] text-slate-400 font-medium">Kanpur traffic bottleneck alerts & emergency routing optimization</p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-[#070d18] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 text-xs font-semibold rounded transition ${
              activeTab === "all" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setActiveTab("driver")}
            className={`px-3 py-1 text-xs font-semibold rounded transition ${
              activeTab === "driver" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            🚧 Traffic Alerts
          </button>
          <button
            onClick={() => setActiveTab("patient")}
            className={`px-3 py-1 text-xs font-semibold rounded transition ${
              activeTab === "patient" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            ⭐ Reviews
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Stream */}
        <div className="lg:col-span-7 flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <div className="text-xs text-slate-500 py-8 text-center border border-dashed border-slate-800 rounded-lg">
              No feedback entries logged yet.
            </div>
          )}

          {filtered.map((item) => {
            const isDriverReport = item.type === "driver_road";
            return (
              <div
                key={item._id}
                className="bg-[#070d18] border border-slate-800/90 rounded-lg p-3 text-xs flex flex-col gap-2 transition hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-xs">{item.authorName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.authorRole})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isDriverReport ? (
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${statusColors[item.roadStatus || "Clear"]}`}>
                        {item.roadStatus || "Clear"}
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold text-xs">
                        {"★".repeat(item.rating || 5)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-slate-300 leading-relaxed font-medium bg-[#0b1322] p-2.5 rounded border border-slate-800">
                  "{item.comment}"
                </div>

                <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                  <span>📍 {item.locationName}</span>
                  {item.vehicleNumber && <span>Vehicle: <strong className="text-amber-400">{item.vehicleNumber}</strong></span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Alert Form */}
        <form onSubmit={handleSubmitReport} className="lg:col-span-5 bg-[#070d18] border border-slate-800/90 rounded-lg p-4 flex flex-col gap-2.5">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            📢 Log Traffic Delay / Road Condition
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              name="authorName"
              placeholder="Driver Name"
              required
              className="bg-[#0b1322] border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              name="vehicleNumber"
              placeholder="Vehicle (UP78-AMB-01)"
              required
              className="bg-[#0b1322] border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              name="locationName"
              placeholder="Location (e.g. Tatmill Chauraha)"
              required
              className="bg-[#0b1322] border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <select
              name="roadStatus"
              defaultValue="Congested"
              className="bg-[#0b1322] border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Congested">Traffic Congested</option>
              <option value="Clear">Road Clear</option>
              <option value="Green Corridor">Green Corridor Active</option>
              <option value="Construction">Road Construction</option>
            </select>
          </div>

          <input
            name="trafficDelayMinutes"
            type="number"
            placeholder="Delay in Minutes (e.g. 5)"
            className="bg-[#0b1322] border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <textarea
            name="comment"
            placeholder="Route feedback / fast alternative route suggestion"
            required
            rows={2}
            className="bg-[#0b1322] border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          ></textarea>

          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded py-2 transition disabled:opacity-50 shadow-md font-mono uppercase tracking-wider"
          >
            {submitting ? "Submitting..." : "Submit Road Alert"}
          </button>
        </form>
      </div>
    </div>
  );
}
