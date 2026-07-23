import { RefreshCw } from "lucide-react";

/* Декоративная mini-scene: сравнение сценариев платежа. SVG/div + CSS (nv-calc-*, nv-val).
   Уважает prefers-reduced-motion (highlight фиксируется, значение показывается статично). */
export function AnimatedCalculatorIcon() {
  const values = ["280 ₼", "245 ₼", "310 ₼"];
  return (
    <div aria-hidden="true" className="rounded-2xl p-4" style={{ background: "#F8FAFF", border: "1px solid #E6ECF8" }}>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="nv-calc-optA rounded-xl p-2.5 text-center" style={{ border: "1px solid #E3E8F1" }}>
          <p className="text-[11.5px] font-bold leading-snug" style={{ color: "#0A1F44" }}>Aylıq ödənişi azalt</p>
        </div>
        <div className="nv-calc-optB rounded-xl p-2.5 text-center" style={{ border: "1px solid #E3E8F1" }}>
          <p className="text-[11.5px] font-bold leading-snug" style={{ color: "#0A1F44" }}>Müddəti azalt</p>
        </div>
      </div>

      <div className="relative h-1.5 rounded-full mb-3.5" style={{ background: "#E3E8F1" }}>
        <span className="nv-calc-dot absolute top-1/2 w-3.5 h-3.5 rounded-full -translate-y-1/2 -translate-x-1/2"
          style={{ background: "#2447F0", boxShadow: "0 0 0 4px rgba(36,71,240,.12)" }} />
      </div>

      <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "#fff", border: "1px solid #E6ECF8" }}>
        <span className="flex items-center gap-1.5 text-[12px]" style={{ color: "#5B6577" }}>
          <RefreshCw size={13} className="nv-calc-refresh" style={{ color: "#2447F0" }} /> Aylıq ödəniş
        </span>
        <span className="relative inline-block h-[18px] w-[52px] text-right text-[14px] font-extrabold" style={{ color: "#0A1F44" }}>
          {values.map((v, i) => (
            <span key={v} className={`nv-val absolute right-0${i === 0 ? " nv-val-first" : ""}`} style={{ animationDelay: `${i * 1.333}s` }}>{v}</span>
          ))}
        </span>
      </div>
    </div>
  );
}
