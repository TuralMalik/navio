"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, XCircle, CheckCircle, Info, ArrowRight, Building2, Landmark } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { SliderRow } from "@/components/ui/SliderRow";
import { track } from "@vercel/analytics";
import {
  type Mode, type GelirNovu, type KreditNovu, type IsStaji,
  type BankForm, type BoktForm,
  calcBankScore, calcBoktScore, explainResult,
} from "@/lib/scoring";


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
function BgnBar({ bgn }: { bgn: number }) {
  const pct = Math.min(bgn / 100, 1);
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>BGN: <strong className="text-gray-800">{bgn.toFixed(1)}%</strong></span>
        <span>Limit: 70%</span>
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

/* ─── Score label ─── */
function scoreLabel(score: number, mode: Mode) {
  if (mode === "bank") {
    if (score >= 80) return { text: "Yüksək şans — Bankların əksəriyyəti təsdiqləyə bilər", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: "🟢" };
    if (score >= 65) return { text: "Yaxşı şans — Bir çox bank təsdiqləyə bilər", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: "🟢" };
    if (score >= 45) return { text: "Orta şans — Şansınız var, bankdan asılıdır", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", icon: "🟡" };
    return { text: "Aşağı şans — Profili yaxşılaşdırmaq tövsiyə olunur", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", icon: "🟠" };
  } else {
    if (score >= 80) return { text: "BOKT-dan kredit ala bilərsiniz", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: "🟢" };
    if (score >= 40) return { text: "Bəzi BOKT-lar təklif edə bilər", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", icon: "🟡" };
    return { text: "BOKT-dan da çətin olacaq", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: "🔴" };
  }
}

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

  const bResult = useMemo(() => calcBankScore(bank), [bank]);
  const nResult = useMemo(() => calcBoktScore(bokt), [bokt]);

  const result = mode === "bank" ? bResult : nResult;

  function switchToBokt() {
    setBokt(n => ({ ...n, mebleg: bank.mebleg, gelir: bank.gelir }));
    setMode("bokt");
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const bStops = (bResult as any).stops as string[];
  const hasStops = mode === "bank" && bStops.length > 0;

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
                        const meblegMin = nov === "naqd" ? 200 : 500;
                        const meblegMax = nov === "ipoteka" || nov === "avto" ? 500000 : 100000;
                        const muddetMin = nov === "naqd" ? 3 : 1;
                        const muddetMax = nov === "ipoteka" ? 360 : 59;
                        const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
                        const meblegVal = clamp(parseFloat(b.mebleg) || meblegMin, meblegMin, meblegMax);
                        const muddetVal = clamp(parseInt(b.muddət) || muddetMin, muddetMin, muddetMax);
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
                      value={parseFloat(bank.mebleg) || (bank.kreditNovu === "naqd" ? 200 : 500)}
                      min={bank.kreditNovu === "naqd" ? 200 : 500}
                      max={bank.kreditNovu === "ipoteka" || bank.kreditNovu === "avto" ? 500000 : 100000} step={1}
                      format={(v) => `₼ ${formatNumber(v)}`} unit="₼"
                      onChange={(v) => setBank(b => ({ ...b, mebleg: String(v) }))} />

                    <SliderRow label="Kredit müddəti" value={parseInt(bank.muddət) || 24}
                      min={bank.kreditNovu === "naqd" ? 3 : 1} max={bank.kreditNovu === "ipoteka" ? 360 : 59} step={1}
                      format={(v) => `${v} ay`} unit="ay"
                      onChange={(v) => setBank(b => ({ ...b, muddət: String(v) }))} />

                    {bank.kreditNovu !== "naqd" && (
                      <SliderRow label="İllik faiz dərəcəsi" value={parseFloat(bank.faiz) || 24} min={0} max={100} step={0.5}
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
                  <SliderRow label="Yaş" value={parseInt(bank.yas) || 30} min={18} max={75} step={1}
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
                // Анонимная аналитика расчёта: без сумм и личных данных
                const r = mode === "bank" ? bResult : nResult;
                // Анонимный лог расчёта для калибровки модели (fire-and-forget)
                if (mode === "bank") {
                  fetch("/api/scoring-log", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ input: bank, score: r.score, bgn: Math.round((r as { bgn: number }).bgn) }),
                    keepalive: true,
                  }).catch(() => {});
                }
                track("scoring_calculated", {
                  mode,
                  kreditNovu: mode === "bank" ? bank.kreditNovu : "bokt",
                  gelirNovu: mode === "bank" ? bank.gelirNovu : "-",
                  scoreBucket: r.score >= 80 ? "80+" : r.score >= 65 ? "65-79" : r.score >= 45 ? "45-64" : "<45",
                  hasStops: (r as { stops?: string[] }).stops?.length ? "yes" : "no",
                });
                // Вход расчёта для страницы детального анализа
                try { sessionStorage.setItem("navio_scoring_input", JSON.stringify(bank)); } catch {}
                setTimeout(() => { setPressed(false); setSubmitted(true); }, 350);
              }}
              disabled={pressed}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white text-sm transition-all duration-200 shadow-md
                ${pressed ? "scale-95 shadow-inner brightness-90" : "hover:shadow-lg hover:brightness-110 active:scale-95"}`}
              style={{ background: "linear-gradient(135deg, #2447F0 0%, #1B36BE 100%)" }}
            >
              {pressed ? (
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

            {!submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 180 100" className="w-12">
                    <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
                    <line x1="90" y1="90" x2="90" y2="25" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="90" cy="90" r="5" fill="#d1d5db" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">Məlumatları daxil edin<br />və "Hesabla" düyməsinə basın</p>
              </div>
            ) : (
              <>
                {hasStops && (
                  <div className="mb-4 space-y-2">
                    {bStops.map((s, i) => (
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
                    {result.warnings.slice(0, 2).map((w, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-amber-700">⚠️ {w}</p>
                      </div>
                    ))}
                    {mode === "bank" && result.warnings.length > 2 && (
                      <a href="/az/kredit-yoxlama/analiz"
                        className="block text-center text-xs font-semibold text-amber-700 underline decoration-amber-300 underline-offset-2 py-1">
                        +{result.warnings.length - 2} əlavə qeyd — «Ətraflı analiz»də
                      </a>
                    )}
                  </div>
                )}

                <div className="mb-2">
                  <Gauge score={hasStops ? 0 : result.score} />
                </div>

                {!hasStops && (
                  <div className={`mt-3 p-3 rounded-xl border text-sm font-medium text-center ${scoreLabel(result.score, mode).bg} ${scoreLabel(result.score, mode).color}`}>
                    {scoreLabel(result.score, mode).icon} {scoreLabel(result.score, mode).text}
                  </div>
                )}

                {mode === "bank" && bResult.bgn < 999 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <BgnBar bgn={bResult.bgn} />
                    {bResult.yeniOdenis > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Yeni aylıq ödəniş: <strong className="text-gray-700">{bResult.yeniOdenis.toFixed(0)} AZN</strong>
                        {bResult.estimatedRate != null ? (
                          <span className="text-gray-500"> ({bResult.estimatedRate.toFixed(1)}% illik — təxmini)</span>
                        ) : (
                          <span className="text-gray-500"> ({bank.faiz}% illik ilə)</span>
                        )}
                      </p>
                    )}
                    {bResult.commission && bResult.commission.amount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Birdəfəlik komissiya: <strong className="text-gray-700">{formatNumber(bResult.commission.amount)} AZN</strong>
                        <span className="text-gray-500"> ({bResult.commission.pct}% — aylıq ödənişə daxil deyil, ümumi dəyərə əlavə olunur)</span>
                      </p>
                    )}
                    {bResult.estimatedRate != null && (
                      <div className="mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 space-y-1">
                        <p className="font-semibold">Navio tərəfindən hesablanan təxmini faiz: {bResult.estimatedRate.toFixed(1)}%</p>
                        <p className="text-indigo-500">İlkin hesablama. İctimai təklif deyil. Faiz fərdi hesablanır.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bal bölgüsü — внутренняя механика скоринга, клиенту не показываем */}

                {/* Главный совет (тезисно) — полный разбор на странице «Ətraflı analiz» */}
                {mode === "bank" && !hasStops && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Əsas tövsiyə</p>
                    <div className="space-y-2">
                      {explainResult(bank, bResult).slice(0, 1).map((it) => (
                        <div key={it.title} className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                          <ArrowRight size={13} className="text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-blue-800">{it.title}</p>
                            <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">{it.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Детальный анализ — отдельная страница (в будущем только для зарегистрированных) */}
                {mode === "bank" && (
                  <a href="/az/kredit-yoxlama/analiz"
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
