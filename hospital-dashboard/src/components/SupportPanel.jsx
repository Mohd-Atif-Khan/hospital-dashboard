"use client";

import { useState } from "react";
import api from "@/lib/api";

const STATUS_STYLES = {
  open: "bg-red-100 text-red-700",
  "in-progress": "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
};

const STATUS_OPTIONS = ["open", "in-progress", "resolved"];

export default function SupportPanel({ tickets, showHospital = false, onUpdated, onCreated, hospitalId }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await api.put(`/support/${id}`, { status });
      onUpdated?.(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    setCreating(true);
    try {
      const res = await api.post("/support", {
        patientName: form.get("patientName"),
        phone: form.get("phone"),
        message: form.get("message"),
        hospitalId: hospitalId || undefined,
      });
      onCreated?.(res.data);
      e.target.reset();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto -mx-1 px-1">
        {tickets.length === 0 && (
          <li className="text-sm text-slate-400 py-6 text-center">No support requests.</li>
        )}
        {tickets.map((t) => (
          <li key={t._id} className="border border-slate-200 rounded-xl px-3.5 py-3 text-sm hover:border-slate-300 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-alc-navy">{t.patientName}</div>
                <div className="text-xs text-slate-500">{t.phone}</div>
              </div>
              <select
                value={t.status}
                disabled={updatingId === t._id}
                onChange={(e) => handleStatusChange(t._id, e.target.value)}
                className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer shrink-0 disabled:opacity-50 ${STATUS_STYLES[t.status]}`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-slate-600 mt-2">{t.message}</p>
            {showHospital && t.hospitalId?.name && (
              <p className="text-xs text-slate-400 mt-1">Hospital: {t.hospitalId.name}</p>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleCreate} className="border-t border-slate-200 pt-4 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          Raise Support Request
        </h3>
        <input
          name="patientName"
          placeholder="Patient / contact name"
          required
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-alc-navy/30 focus:border-alc-navy"
        />
        <input
          name="phone"
          placeholder="Phone number"
          required
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-alc-navy/30 focus:border-alc-navy"
        />
        <textarea
          name="message"
          placeholder="Describe the issue..."
          required
          rows={2}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-alc-navy/30 focus:border-alc-navy resize-none"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-alc-navy text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-alc-navy-light transition disabled:opacity-50"
        >
          {creating ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
