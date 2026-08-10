"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, XCircle, CheckCircle, Info, ArrowRight, Building2, Landmark } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { SliderRow } from "@/components/ui/SliderRow";
import { track } from "@vercel/analytics";
import {
  type Mode, type GelirNovu, type KreditNovu, type IsStaji,
  type BankForm, type BoktForm,
  FORM_RANGES, clampToRange,
} from "@/lib/scoring-types";
import type { PublicScoreResult, Tone } from "@/lib/score-contract";
import { useDebouncedCallback, useLatestRequest } from "@/lib/useDebouncedCallback";


/* ─── Тултип-расшифровка BOKT: работает по тапу/клику (мобайл-friendly),
   закрывается повторным тапом или тапом вне области ─── */
function BoktTooltip({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <span
        role="button"
        tabIndex={0}
        aria-label="BOKT nədir?"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(o => !o); } }}
        className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[11px] font-bold cursor-pointer select-none transition-colors ${
          dark ? "bg-white/25 text-white hover:bg-white/40" : "bg-blue-100 text-blue-600 hover:bg-blue-200"
        }`}
      >
        i
      </span>
      {open && (
        <span className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[230px] px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium leading-snug text-center shadow-lg">
          Banka olmayan kredit təşkilatı
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900" />
        </span>
      )}
    </span>
  );
}

/* ─── Gauge SVG ─── */
function Gauge({ score }: { score: number }) {
  const pct = Math.min(score / 100, 1);
  const r = 70;
  const cx = 90, cy = 85;
  const arcLen = Math.PI * r;
  const dashLen = pct * arcLen;
  const needleX = cx + r * Math.cos(Math.PI - pct * Math.PI);
  const needleY = cy - r * Math.sin(pct * Math.PI);

  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-xs mx-auto">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="url(#scoreGrad)"
        strokeWidth="14" strokeLinecap="round" strokeDasharray={`${dashLen} ${arcLen}`} />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#1e293b" />
      <text x={cx - r - 2} y={cy + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">0</text>
      <text x={cx + r + 2} y={cy + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">100</text>
      <text x={cx} y={cy - 16} textAnchor="middle" fontSize="26" fontWeight="800" fill="#0f172a">{score}</text>
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="8" fill="#64748b">/ 100</text>
    </svg>
  );
}

/* ─── BGN Bar ─── */
function BgnBar({ bgn, limit }: { bgn: number; limit: number }) {
  const pct = Math.min(bgn / 100, 1);
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>BGN: <strong className="text-gray-800">{bgn.toFixed(1)}%</strong></span>
        <span>Limit: {limit}%</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500">
        <div className="absolute top-0 bottom-0 right-0 bg-gray-100/60" style={{ left: `${pct * 100}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-gray-700 shadow"
          style={{ left: `calc(${pct * 100}% - 5px)` }} />
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
        <span>Yaxşı</span><span>Orta</span><span>Yüksək</span><span>Stop</span>
      </div>
    </div>
  );
}

/* ─── Оформление тона результата.
   Сам уровень («Yüksək şans» и т.д.) считает сервер — здесь только цвета. ─── */
const TONE_CLASS: Record<Tone, { color: string; bg: string }> = {
  good:      { color: "text-green-600",   bg: "bg-green-50 border-green-200" },
  normal:    { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  attention: { color: "text-yellow-600",  bg: "bg-yellow-50 border-yellow-200" },
  risk:      { color: "text-orange-600",  bg: "bg-orange-50 border-orange-200" },
  high:      { color: "text-red-600",     bg: "bg-red-50 border-red-200" },
  na:        { color: "text-gray-600",    bg: "bg-gray-50 border-gray-200" },
};

function Field({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
const selectCls = inputCls;
const sectionTitle = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-3";

// Короткая «анализ»-анимация перед показом результата (~1.3с)
const ANALYZE_STEPS = [
  "Məlumatlar yoxlanılır...",
  "Borc yükü hesablanır...",
  "Risk faktorları qiymətləndirilir...",
  "Nəticə hazırlanır...",
];

/* ─── Main ─── */
function KreditYoxlamaContent() {
  const searchParams = useSearchParams();
  const initNov = (searchParams.get("nov") as KreditNovu) || "naqd";
  const initMebleq = searchParams.get("mebleq") || (initNov === "naqd" ? "200" : "500");
  const initMuddet = searchParams.get("muddet") || "24";
  const initFaiz = searchParams.get("faiz") || "24";

  const [mode, setMode] = useState<Mode>("bank");
  const [submitted, setSubmitted] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [result, setResult] = useState<PublicScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [bank, setBank] = useState<BankForm>({
    kreditNovu: initNov,
    mebleg: initMebleq,
    muddət: initMuddet,
    faiz: initFaiz,
    gelirNovu: "resmi",
    gelir: "",
    isStaji: "12_plus",
    yas: "30",
    movcudNaqdOdenis: "0",
    movcudKartLimit: "0",
    cariGecikmeGun: "0",
    maks12ay: "0",
  });

  const [bokt, setBokt] = useState<BoktForm>({
    mebleg: "",
    gelir: "",
    kreditTarixce: "yox",
  });

  const { next: nextRequest, isLatest } = useLatestRequest();

  /* Расчёт живёт на сервере: форма уходит в /api/score, обратно приходит только
     то, что можно показать. Пороги, веса и таблицы ставок в браузер не попадают. */
  const runScoring = useCallback(async () => {
    const reqId = nextRequest();
    setError(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input: mode === "bank" ? bank : bokt }),
      });
      if (!isLatest(reqId)) return; // пришёл ответ на устаревший запрос — игнорируем
      if (!res.ok) {
        const msg = res.status === 429
          ? "Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd edin."
          : "Hesablama alınmadı. Bir az sonra yenidən cəhd edin.";
        setError(msg);
        setResult(null);
        return;
      }
      const data: PublicScoreResult = await res.json();
      if (!isLatest(reqId)) return;
      setResult(data);
      track("scoring_calculated", {
        mode,
        kreditNovu: mode === "bank" ? bank.kreditNovu : "bokt",
        gelirNovu: mode === "bank" ? bank.gelirNovu : "-",
        scoreBucket: data.score >= 80 ? "80+" : data.score >= 65 ? "65-79" : data.score >= 45 ? "45-64" : "<45",
        hasStops: data.stops.length ? "yes" : "no",
      });
    } catch {
      if (!isLatest(reqId)) return;
      setError("Şəbəkə xətası. İnternet bağlantınızı yoxlayın.");
      setResult(null);
    }
  }, [mode, bank, bokt, nextRequest, isLatest]);

  // Дебаунс: гасит двойные нажатия и быстрые повторные отправки
  const debouncedScoring = useDebouncedCallback(() => { void runScoring(); }, 300);

  function switchToBokt() {
    setBokt(n => ({ ...n, mebleg: bank.mebleg, gelir: bank.gelir }));
    setMode("bokt");
    setSubmitted(false);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasStops = Boolean(result?.blocked);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Kredit şansınızı yoxlayın</h1>
          <p className="text-blue-100 text-base">Banka müraciət etməzdən əvvəl nəticənizi öyrənin — sorğusuz və pulsuz</p>

          <div className="mt-6 inline-flex rounded-2xl bg-white/15 p-1 border border-white/20">
            <button onClick={() => { setMode("bank"); setSubmitted(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${mode === "bank" ? "bg-white text-blue-700 shadow-md" : "text-white/80 hover:text-white"}`}>
              <Landmark size={16} /> Bank
            </button>
            <button onClick={() => { setMode("bokt"); setSubmitted(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${mode === "bokt" ? "bg-white text-blue-700 shadow-md" : "text-white/80 hover:text-white"}`}>
              <Building2 size={16} /> BOKT <BoktTooltip dark={mode !== "bokt"} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── FORM ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

            {mode === "bank" ? (
              <>

                {/* ── Kredit parametrləri ── */}
                <div>
                  <p className={sectionTitle}>Kredit parametrləri</p>
                  <div className="space-y-4">
                    <Field label="Kredit növü"
                      note={bank.gelirNovu === "qeyri_resmi" ? "İpoteka və avtokredit rəsmi gəlir tələb edir" : undefined}>
                      <select value={bank.kreditNovu} onChange={e => setBank(b => {
                        const nov = e.target.value as KreditNovu;
                        // Диапазоны зависят от типа кредита — поджимаем сумму/срок под новый диапазон
                        const m = FORM_RANGES.mebleg(nov);
                        const d = FORM_RANGES.muddet(nov);
                        const meblegVal = clampToRange(parseFloat(b.mebleg) || m.min, m.min, m.max);
                        const muddetVal = clampToRange(parseInt(b.muddət) || d.min, d.min, d.max);
                        return { ...b, kreditNovu: nov, mebleg: String(meblegVal), muddət: String(muddetVal) };
                      })} className={selectCls}>
                        <option value="naqd">Nağd kredit</option>
                        <option value="kart">Kredit kartı</option>
                        <option value="ipoteka" disabled={bank.gelirNovu === "qeyri_resmi"}>
                          İpoteka{bank.gelirNovu === "qeyri_resmi" ? " — rəsmi gəlir tələb edir" : ""}
                        </option>
                        <option value="avto" disabled={bank.gelirNovu === "qeyri_resmi"}>
                          Avtomobil krediti{bank.gelirNovu === "qeyri_resmi" ? " — rəsmi gəlir tələb edir" : ""}
                        </option>
                      </select>
                    </Field>

                    <SliderRow label="Tələb olunan məbləğ"
                      value={parseFloat(bank.mebleg) || FORM_RANGES.mebleg(bank.kreditNovu).min}
                      min={FORM_RANGES.mebleg(bank.kreditNovu).min}
                      max={FORM_RANGES.mebleg(bank.kreditNovu).max} step={1}
                      format={(v) => `₼ ${formatNumber(v)}`} unit="₼"
                      onChange={(v) => setBank(b => ({ ...b, mebleg: String(v) }))} />

                    <SliderRow label="Kredit müddəti" value={parseInt(bank.muddət) || 24}
                      min={FORM_RANGES.muddet(bank.kreditNovu).min}
                      max={FORM_RANGES.muddet(bank.kreditNovu).max} step={1}
                      format={(v) => `${v} ay`} unit="ay"
                      onChange={(v) => setBank(b => ({ ...b, muddət: String(v) }))} />

                    {bank.kreditNovu !== "naqd" && (
                      <SliderRow label="İllik faiz dərəcəsi" value={parseFloat(bank.faiz) || 24}
                        min={FORM_RANGES.faiz.min} max={FORM_RANGES.faiz.max} step={0.5}
                        format={(v) => `${v}%`} unit="%"
                        onChange={(v) => setBank(b => ({ ...b, faiz: String(v) }))} />
                    )}
                  </div>
                </div>

                {/* ── Gəlir məlumatları ── */}
                <div className="border-t border-gray-100 pt-4">
                  <p className={sectionTitle}>Gəlir məlumatları</p>
                  <div className="space-y-4">
                    <Field label="Gəlir növü">
                      <select value={bank.gelirNovu}
                        onChange={e => {
                          const nov = e.target.value as GelirNovu;
                          setBank(b => ({
                            ...b,
                            gelirNovu: nov,
                            // Для неофиц. дохода ипотека/авто недоступны — сброс на наличный
                            kreditNovu: nov === "qeyri_resmi" && (b.kreditNovu === "ipoteka" || b.kreditNovu === "avto") ? "naqd" : b.kreditNovu,
                          }));
                        }} className={selectCls}>
                        <option value="resmi">Rəsmi gəlir</option>
                        <option value="qeyri_resmi">Qeyri-rəsmi gəlir</option>
                        <option value="teqaud">Təqaüd</option>
                        <option value="fs">VÖEN / Fərdi sahibkar</option>
                        <option value="xarici">Xaricdə qazanc</option>
                      </select>
                    </Field>

                    <Field label="Aylıq gəlir (net, AZN)" note="Vergi çıxıldıqdan sonra">
                      <input type="number" placeholder="1000" min={0} value={bank.gelir}
                        onChange={e => setBank(b => ({ ...b, gelir: e.target.value }))} className={inputCls} />
                    </Field>

                    {/* Стаж не применяется для пенсионера и неофициального дохода */}
                    {bank.gelirNovu !== "teqaud" && bank.gelirNovu !== "qeyri_resmi" && (
                      <Field label="Cari iş yerində staj" note={bank.gelirNovu === "resmi" ? "Rəsmi gəlir üçün minimum 6 ay tələb olunur" : "Minimum 12 ay tələb olunur"}>
                        <select value={bank.isStaji} onChange={e => setBank(b => ({ ...b, isStaji: e.target.value as IsStaji }))} className={selectCls}>
                          <option value="0_2">0 – 2 ay</option>
                          <option value="3_5">3 – 5 ay</option>
                          <option value="6_11">6 – 11 ay</option>
                          <option value="12_plus">12 ay və daha çox</option>
                        </select>
                      </Field>
                    )}
                  </div>
                </div>

                {/* ── Şəxsi məlumatlar ── */}
                <div className="border-t border-gray-100 pt-4">
                  <p className={sectionTitle}>Şəxsi məlumatlar</p>
                  <SliderRow label="Yaş" value={parseInt(bank.yas) || 30}
                    min={FORM_RANGES.yas.min} max={FORM_RANGES.yas.max} step={1}
                    format={(v) => `${v} yaş`} unit="yaş"
                    onChange={(v) => setBank(b => ({ ...b, yas: String(v) }))} />
                </div>

                {/* ── Mövcud öhdəliklər ── */}
                <div className="border-t border-gray-100 pt-4">
                  <p className={sectionTitle}>Mövcud öhdəliklər</p>
                  <div className="space-y-4">
                    <Field label="Mövcud aylıq nağd kredit ödənişi (AZN)" note="Aktiv kreditlər üzrə cəmi aylıq ödəniş. Yoxdursa 0 yazın.">
                      <input type="number" placeholder="0" min={0} value={bank.movcudNaqdOdenis}
                        onChange={e => setBank(b => ({ ...b, movcudNaqdOdenis: e.target.value }))} className={inputCls} />
                    </Field>

                    <Field label="Mövcud kredit kartı limiti (AZN)" note="Bütün aktiv kredit kartlarının ümumi limiti. Yoxdursa 0 yazın.">
                      <input type="number" placeholder="0" min={0} value={bank.movcudKartLimit}
                        onChange={e => setBank(b => ({ ...b, movcudKartLimit: e.target.value }))} className={inputCls} />
                    </Field>
                  </div>
                </div>

                {/* ── Kredit tarixçəsi ── */}
                <div className="border-t border-gray-100 pt-4">
                  <p className={sectionTitle}>Kredit tarixçəsi</p>
                  <div className="space-y-4">
                    <Field label="Cari (aktiv) gecikmə (gün)" note="Hazırda gecikmiş ödənişiniz yoxdursa 0 yazın. Bir neçə kreditiniz gecikmədədirsə, ən böyük gecikmə gününü qeyd edin.">
                      <input type="number" placeholder="0" min={0} value={bank.cariGecikmeGun}
                        onChange={e => setBank(b => ({ ...b, cariGecikmeGun: e.target.value }))} className={inputCls} />
                    </Field>

                    <Field label="Son 12 ayda maksimum gecikmə (gün)" note="Son 12 ayda ən uzun tək gecikmə. Yoxdursa 0 yazın.">
                      <input type="number" placeholder="0" min={0} value={bank.maks12ay}
                        onChange={e => setBank(b => ({ ...b, maks12ay: e.target.value }))} className={inputCls} />
                    </Field>

                  </div>
                </div>
              </>
            ) : (
              <>
                {/* BOKT form */}

                <SliderRow label="Tələb olunan məbləğ" value={parseFloat(bokt.mebleg) || 100} min={50} max={1000} step={1}
                  format={(v) => `₼ ${v}`} unit="₼"
                  onChange={(v) => setBokt(n => ({ ...n, mebleg: String(v) }))} />

                <SliderRow label="Aylıq gəlir" value={parseFloat(bokt.gelir) || 300} min={100} max={5000} step={50}
                  format={(v) => `₼ ${formatNumber(v)}`} unit="₼"
                  onChange={(v) => setBokt(n => ({ ...n, gelir: String(v) }))} />

                <Field label="Kredit tarixçəsi">
                  <select value={bokt.kreditTarixce} onChange={e => setBokt(n => ({ ...n, kreditTarixce: e.target.value as "yox" | "gecikme" }))} className={selectCls}>
                    <option value="yox">Gecikmə yoxdur</option>
                    <option value="gecikme">Gecikmələr var</option>
                  </select>
                </Field>

                {parseFloat(bokt.mebleg) > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm">
                    <p className="font-bold text-amber-800 mb-1 flex items-center gap-1.5">💸 BOKT <BoktTooltip /> Xərc Hesablaması</p>
                    <p className="text-amber-700">Maksimum ödəniləcək məbləğ: <strong>{(parseFloat(bokt.mebleg) * 2).toFixed(0)} AZN</strong></p>
                    <p className="text-xs text-amber-600 mt-1">Mərkəzi Bank qaydası: ümumi borcun artımı əsas borcun 100%-ni keçə bilməz</p>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => {
                setPressed(true);
                setTimeout(() => setPressed(false), 250);

                const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                if (reduced) {
                  setSubmitted(true);
                  debouncedScoring();
                  return;
                }
                // Анимация идёт параллельно реальному запросу: результат показываем,
                // когда закончится и то, и другое (а не по фиктивному таймеру).
                setSubmitted(false);
                setAnalyzeStep(0);
                setAnalyzing(true);
                const per = 320;
                ANALYZE_STEPS.forEach((_, i) => { if (i > 0) setTimeout(() => setAnalyzeStep(i), per * i); });
                setTimeout(() => { setAnalyzing(false); setSubmitted(true); }, per * ANALYZE_STEPS.length);
                debouncedScoring();
              }}
              disabled={analyzing}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white text-sm transition-all duration-200 shadow-md
                ${pressed || analyzing ? "scale-95 shadow-inner brightness-90" : "hover:shadow-lg hover:brightness-110 active:scale-95"}`}
              style={{ background: "linear-gradient(135deg, #2447F0 0%, #1B36BE 100%)" }}
            >
              {analyzing ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Hesablanır...
                </>
              ) : (
                <>Hesabla <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>

        {/* ── RESULT ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4 text-center text-sm uppercase tracking-wider">Nəticə</h2>

            {analyzing ? (
              <div className="py-6 space-y-3.5" role="status" aria-live="polite">
                {ANALYZE_STEPS.map((s, i) => {
                  const done = i < analyzeStep;
                  const active = i === analyzeStep;
                  return (
                    <div key={s} className="flex items-center gap-3 text-sm transition-opacity duration-300"
                      style={{ opacity: i <= analyzeStep ? 1 : 0.38 }}>
                      <span className="w-5 h-5 rounded-full grid place-items-center shrink-0"
                        style={{ background: done ? "#E7F7F1" : active ? "#EBEFFE" : "#F1F5F9" }}>
                        {done ? (
                          <CheckCircle size={14} className="text-emerald-600" />
                        ) : active ? (
                          <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#2447F0" strokeWidth="3" strokeOpacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="#2447F0" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        )}
                      </span>
                      <span className={done || active ? "text-gray-800 font-medium" : "text-gray-400"}>{s}</span>
                    </div>
                  );
                })}
              </div>
            ) : !submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 180 100" className="w-12">
                    <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
                    <line x1="90" y1="90" x2="90" y2="25" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="90" cy="90" r="5" fill="#d1d5db" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">Məlumatları daxil edin<br />və &laquo;Hesabla&raquo; düyməsinə basın</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <p className="text-sm text-gray-600 font-medium mb-4">{error}</p>
                <button onClick={() => { setError(null); void runScoring(); }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                  Yenidən cəhd et
                </button>
              </div>
            ) : !result ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg className="animate-spin mb-3" width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#2447F0" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#2447F0" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-gray-500 font-medium">Nəticə hazırlanır...</p>
              </div>
            ) : (
              <>
                {hasStops && (
                  <div className="mb-4 space-y-2">
                    {result.stops.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm">
                        <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-red-700">⛔ {s}</p>
                          <p className="text-red-600 text-xs mt-0.5">Banklar bu parametrlərlə kredit verə bilməz.</p>
                        </div>
                      </div>
                    ))}
                    <button onClick={switchToBokt}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition">
                      BOKT-da yoxlamaq istəyirsiniz? <ArrowRight size={14} />
                    </button>
                  </div>
                )}

                {result.warnings.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {result.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-amber-700">⚠️ {w}</p>
                      </div>
                    ))}
                    {mode === "bank" && result.extraWarningCount > 0 && result.calculationId && (
                      <a href={`/az/kredit-yoxlama/analiz?id=${result.calculationId}`}
                        className="block text-center text-xs font-semibold text-amber-700 underline decoration-amber-300 underline-offset-2 py-1">
                        +{result.extraWarningCount} əlavə qeyd — «Ətraflı analiz»də
                      </a>
                    )}
                  </div>
                )}

                <div className="mb-2">
                  <Gauge score={hasStops ? 0 : result.score} />
                </div>

                {!hasStops && result.label && (
                  <div className={`mt-3 p-3 rounded-xl border text-sm font-medium text-center ${TONE_CLASS[result.label.tone].bg} ${TONE_CLASS[result.label.tone].color}`}>
                    {result.label.icon} {result.label.text}
                  </div>
                )}

                {mode === "bank" && result.bgn != null && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <BgnBar bgn={result.bgn} limit={result.bgnLimit} />
                    {result.yeniOdenis > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Yeni aylıq ödəniş: <strong className="text-gray-700">{result.yeniOdenis.toFixed(0)} AZN</strong>
                        {result.estimatedRate != null ? (
                          <span className="text-gray-500"> ({result.estimatedRate.toFixed(1)}% illik — təxmini)</span>
                        ) : (
                          <span className="text-gray-500"> ({result.manualRate}% illik ilə)</span>
                        )}
                      </p>
                    )}
                    {result.commission && (
                      <p className="text-xs text-gray-500 mt-1">
                        Birdəfəlik komissiya: <strong className="text-gray-700">{formatNumber(result.commission.amount)} AZN</strong>
                        <span className="text-gray-500"> ({result.commission.pct}% — aylıq ödənişə daxil deyil, ümumi dəyərə əlavə olunur)</span>
                      </p>
                    )}
                    {result.estimatedRate != null && (
                      <div className="mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 space-y-1">
                        <p className="font-semibold">Navio tərəfindən hesablanan təxmini faiz: {result.estimatedRate.toFixed(1)}%</p>
                        <p className="text-indigo-500">İlkin hesablama. İctimai təklif deyil. Faiz fərdi hesablanır.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bal bölgüsü — внутренняя механика скоринга, клиенту не показываем */}

                {/* Главный совет (тезисно) — полный разбор на странице «Ətraflı analiz» */}
                {mode === "bank" && !hasStops && result.topRecommendation && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Əsas tövsiyə</p>
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <ArrowRight size={13} className="text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-800">{result.topRecommendation.title}</p>
                        <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">{result.topRecommendation.text}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Детальный анализ — отдельная страница, полный отчёт после регистрации */}
                {mode === "bank" && result.calculationId && (
                  <a href={`/az/kredit-yoxlama/analiz?id=${result.calculationId}`}
                    className="group mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-px"
                    style={{ background: "linear-gradient(135deg, #2447F0 0%, #1B36BE 100%)", boxShadow: "0 6px 18px rgba(36,71,240,.28)" }}>
                    Ətraflı analiz və tövsiyələr
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}
              </>
            )}
          </div>

          <div className="flex items-start gap-2 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700">
            <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
            <p>Bu nəticə ilkin qiymətləndirmədir. Yekun qərarı bank/BOKT verir. Navio heç bir kredit vermir.</p>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function KreditYoxlamaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <KreditYoxlamaContent />
    </Suspense>
  );
}
