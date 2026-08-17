export default function StatusPill({ ok, onLabel, offLabel, pendingLabel }) {
  const state = ok === null || ok === undefined ? "pending" : ok ? "on" : "off";

  const dotColor = { on: "bg-emerald-400", off: "bg-red-400", pending: "bg-slate-400" }[state];
  const label = { on: onLabel, off: offLabel, pending: pendingLabel }[state];

  return (
    <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-xs font-medium">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor} ${state === "on" ? "animate-pulse" : ""}`} />
      {label}
    </span>
  );
}
