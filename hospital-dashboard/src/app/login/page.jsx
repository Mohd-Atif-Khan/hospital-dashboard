"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { saveSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("hospital");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { role, email, password });
      saveSession(res.data);
      router.push(role === "admin" ? "/admin" : "/hospital");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    if (role === "admin") {
      setEmail("admin@123");
      setPassword("1234");
    } else {
      setEmail("hospital@123");
      setPassword("1234");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-[#06172e] to-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative mb-3">
            <div className="absolute -inset-2 rounded-2xl bg-emerald-500/25 blur-lg animate-pulse"></div>
            <div className="relative h-20 w-20 rounded-2xl bg-white p-2 shadow-2xl border-2 border-emerald-500/40 flex items-center justify-center">
              <img src="/greenpulse-logo.png" alt="Green Pulse" className="h-full w-full object-contain" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-white tracking-tight">
            GREEN <span className="text-emerald-400">PULSE</span>
          </h1>
          
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            powered by <span className="text-emerald-400">allenhouse business school</span>
          </p>

          <div className="mt-2 flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-xs text-slate-300">
            <img src="/agoi-logo.png" alt="Allenhouse" className="h-4 w-4 object-contain" />
            <span>Emergency Command Platform</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole("hospital")}
              className={`flex-1 text-sm font-semibold rounded-lg py-2 transition ${
                role === "hospital" ? "bg-white text-alc-navy shadow-sm" : "text-slate-500"
              }`}
            >
              Hospital Login
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 text-sm font-semibold rounded-lg py-2 transition ${
                role === "admin" ? "bg-white text-alc-navy shadow-sm" : "text-slate-500"
              }`}
            >
              Admin Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="text-sm flex flex-col gap-1">
              <span className="text-slate-600 font-medium">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-alc-navy/30 focus:border-alc-navy"
              />
            </label>
            <label className="text-sm flex flex-col gap-1">
              <span className="text-slate-600 font-medium">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-alc-navy/30 focus:border-alc-navy"
              />
            </label>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-alc-navy text-white font-semibold rounded-lg py-2.5 hover:bg-alc-navy-light transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={fillDemo}
              className="text-xs text-alc-navy/70 hover:text-alc-navy underline text-center"
            >
              Fill demo {role} credentials
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
