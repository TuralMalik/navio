import { Check } from "lucide-react";

/* Декоративная mini-scene: Navio проверяет кредитный профиль и даёт первичный результат.
   Только SVG + CSS-анимации (globals.css, класс nv-cc-*). Уважает prefers-reduced-motion. */
export function AnimatedCreditCheckIcon() {
  const rows = ["Borc yükü", "Risk göstəricisi", "Banklara sorğu göndərilmir"];
  return (
    <div aria-hidden="true" className="rounded-2xl p-4" style={{ background: "#F8FAFF", border: "1px solid #E6ECF8" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 64 64" width="64" height="64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#E3E8F1" strokeWidth="6" />
            <circle className="nv-cc-arc" cx="32" cy="32" r="26" fill="none" stroke="#2447F0" strokeWidth="6"
              strokeLinecap="round" strokeDasharray="163.4" transform="rotate(-90 32 32)" />
          </svg>
          <span className="nv-cc-num absolute inset-0 grid place-items-center text-[17px] font-extrabold" style={{ color: "#0A1F44" }}>72</span>
        </div>
        <div>
          <p className="text-[13px] font-bold" style={{ color: "#0A1F44" }}>Kredit profili</p>
          <span className="nv-fade-up inline-block text-[12px] font-bold mt-1 px-2 py-0.5 rounded-full"
            style={{ color: "#0BB07B", background: "#E7F7F1" }}>Yaxşı nəticə</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <div key={r} className="nv-cc-row flex items-center gap-2 text-[12.5px]"
            style={{ color: "#5B6577", animationDelay: `${0.9 + i * 0.28}s` }}>
            <span className="grid place-items-center w-4 h-4 rounded-full shrink-0" style={{ background: "#E7F7F1", color: "#0BB07B" }}>
              <Check size={11} strokeWidth={3} />
            </span>
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}
