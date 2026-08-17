export default function Card({ title, subtitle, icon, children, action }) {
  return (
    <section className="bg-[#0b1322] border border-slate-800/90 rounded-xl shadow-xl p-5 flex flex-col gap-4">
      {title && (
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            {icon && <span className="text-lg text-emerald-400">{icon}</span>}
            <div className="border-l-2 border-emerald-500 pl-3">
              <h2 className="text-sm font-bold text-slate-100 tracking-tight leading-none">{title}</h2>
              {subtitle && <p className="text-[11px] text-slate-400 font-medium leading-none mt-1">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
