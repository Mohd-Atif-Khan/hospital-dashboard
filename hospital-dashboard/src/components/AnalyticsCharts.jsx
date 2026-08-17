"use client";

export default function AnalyticsCharts({ trips = [], hospitals = [] }) {
  const totalTrips = trips.length || 24;
  const delayedTrips = trips.filter((t) => (t.etaMinutes || 10) > 12).length || 3;
  const onTimeTrips = Math.max(1, totalTrips - delayedTrips);
  const onTimePercent = ((onTimeTrips / totalTrips) * 100).toFixed(1);

  return (
    <div className="bg-[#0b1322] border border-slate-800/90 rounded-xl p-5 text-white shadow-xl flex flex-col gap-5">
      {/* Section Header with Left Accent Line */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="border-l-2 border-emerald-500 pl-3">
          <h3 className="text-sm font-bold text-slate-100 tracking-tight">OPERATIONAL ANALYTICS & SPEED PERFORMANCE</h3>
          <p className="text-[11px] text-slate-400 font-medium">Kanpur Metro dispatch accuracy & traffic delay analytics</p>
        </div>

        <div className="text-xs font-mono font-bold text-emerald-400 bg-[#070d18] border border-slate-800 px-3 py-1 rounded">
          SCORE: 98.6 / 100
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chart 1: Donut Visualizer */}
        <div className="bg-[#070d18] border border-slate-800/80 rounded-lg p-4 flex flex-col items-center justify-between">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
            Dispatch Accuracy Ratio
          </div>

          <div className="relative w-32 h-32 flex items-center justify-center my-1">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-1000"
                strokeDasharray={`${onTimePercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="square"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black font-mono text-emerald-400">{onTimePercent}%</span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase">On-Time</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono mt-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-emerald-500 rounded-sm"></span>
              <span className="text-slate-300">On-Time: {onTimeTrips}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-red-500 rounded-sm"></span>
              <span className="text-slate-300">Delayed: {delayedTrips}</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Hourly Dispatch Volume Bar Graph */}
        <div className="bg-[#070d18] border border-slate-800/80 rounded-lg p-4 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
            Hourly Emergency Volume
          </div>

          <div className="h-24 flex items-end justify-between gap-1 px-1 pt-3 border-b border-slate-800">
            {[3, 6, 12, 18, 9, 14, 22, 17, 11, 8, 15, 20].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-emerald-500/80 hover:bg-emerald-400 rounded-t-sm transition-all duration-200"
                  style={{ height: `${(val / 22) * 100}%` }}
                  title={`${val} dispatches at ${idx * 2}:00`}
                ></div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-2 px-1">
            <span>00:00</span>
            <span>08:00</span>
            <span>16:00</span>
            <span>24:00</span>
          </div>
        </div>

        {/* Chart 3: Facility Response Time Index */}
        <div className="bg-[#070d18] border border-slate-800/80 rounded-lg p-4 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
            Hospital Speed Performance Index
          </div>

          <div className="flex flex-col gap-2.5">
            {[
              { name: "Regency Swaroop Nagar", speed: 96, time: "5.2m" },
              { name: "GSVM Medical College", speed: 92, time: "6.1m" },
              { name: "Kanpur Heart Institute", speed: 89, time: "6.8m" },
              { name: "Allen Life Care Center", speed: 94, time: "5.6m" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span className="truncate max-w-[160px] text-[11px]">{item.name}</span>
                  <span className="font-mono text-emerald-400 font-bold text-[11px]">{item.time}</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-sm overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 rounded-sm"
                    style={{ width: `${item.speed}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
