const ACCENT_BARS = {
  navy: "bg-cyan-500 text-cyan-400",
  green: "bg-emerald-500 text-emerald-400",
  gold: "bg-amber-500 text-amber-400",
  red: "bg-red-500 text-red-400",
};

export default function StatCard({ label, value, subtext, accent = "navy" }) {
  const accentColorClass = ACCENT_BARS[accent] || ACCENT_BARS.navy;
  const barClass = accentColorClass.split(" ")[0];
  const textClass = accentColorClass.split(" ")[1];

  return (
    <div className="bg-[#0b1322] border border-slate-800/90 rounded-xl p-4 relative overflow-hidden shadow-xl flex flex-col justify-between">
      <div className={`absolute top-0 left-0 h-0.5 w-full ${barClass}`} />
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        {label}
      </div>
      <div className={`text-3xl font-black font-mono mt-2 tracking-tight ${textClass}`}>
        {value}
      </div>
      {subtext && <div className="text-[10px] text-slate-500 mt-1 font-mono">{subtext}</div>}
    </div>
  );
}
