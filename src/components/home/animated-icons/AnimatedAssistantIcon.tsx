import { Sparkles } from "lucide-react";

/* Декоративная mini-scene: Navio отвечает на вопросы о кредите. div + CSS (nv-q/nv-typing/nv-a/nv-spark).
   Уважает prefers-reduced-motion (typing скрывается, вопрос+ответ показываются статично). */
export function AnimatedAssistantIcon() {
  return (
    <div aria-hidden="true" className="rounded-2xl p-4" style={{ background: "#F8FAFF", border: "1px solid #E6ECF8" }}>
      <div className="nv-q flex justify-start mb-2">
        <span className="max-w-[85%] text-[12px] leading-snug rounded-2xl rounded-tl-sm px-3 py-2" style={{ background: "#F1EBFE", color: "#0A1F44" }}>
          Gecikməm varsa, bank nə edə bilər?
        </span>
      </div>

      <div className="nv-typing flex justify-end mb-2">
        <span className="flex items-center gap-1 rounded-2xl px-3 py-2.5" style={{ background: "#fff", border: "1px solid #E6ECF8" }}>
          <span className="nv-dot1 w-1.5 h-1.5 rounded-full" style={{ background: "#2447F0" }} />
          <span className="nv-dot2 w-1.5 h-1.5 rounded-full" style={{ background: "#2447F0" }} />
          <span className="nv-dot3 w-1.5 h-1.5 rounded-full" style={{ background: "#2447F0" }} />
        </span>
      </div>

      <div className="nv-a flex justify-end items-end gap-1.5">
        <span className="max-w-[85%] text-[12px] leading-snug rounded-2xl rounded-br-sm px-3 py-2 text-white" style={{ background: "#2447F0" }}>
          Bu, kredit profilinizə mənfi təsir edə bilər.
        </span>
        <Sparkles size={14} className="nv-spark shrink-0 mb-1" style={{ color: "#7C3AED" }} />
      </div>
    </div>
  );
}
