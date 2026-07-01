"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, XCircle, CheckCircle, Info, ArrowRight, Building2, Landmark } from "lucide-react";
import { SliderRow } from "@/components/ui/SliderRow";

/* ─── Types ─── */
type Mode = "bank" | "bokt";
type GelirNovu = "resmi" | "qeyri_resmi" | "teqaud" | "fs";
type TeqaudNovu = "yasa_gore" | "sosial" | "qazi" | "sehid_ailesi";
type KreditNovu = "naqd" | "kart" | "ipoteka" | "avto";
type IsStaji = "0_3" | "4_5" | "6_12" | "12_plus";
type BaglanmisTecrube = "var" | "yoxdur" | "tecrube_yox";

interface BankForm {
  kreditNovu: KreditNovu;
  meblег: string;
  muddət: string;
  faiz: string;
  gelirNovu: GelirNovu;
  teqaudNovu: TeqaudNovu;
  gelir: string;
  isStaji: IsStaji;
  yas: string;
  movcudNaqdOdenis: string;
  movcudKartLimit: string;
  cariGecikmeGun: string;
  son6ayGecikmeGun: string;
  baglanmisTecrube: BaglanmisTecrube;
  zamin: boolean;
  emanet: boolean;
  emanetMeblег: string;
}

interface BoktForm {
  meblег: string;
  gelir: string;
  kreditTarixce: "yox" | "gecikme";
  emanet: boolean;
  emanetMeblег: string;
}

/* ─── Annuity formula ─── */
function annuityPayment(principal: number, months: number, annualRate: number): number {
  if (months <= 0 || principal <= 0 || annualRate <= 0) return principal / Math.max(months, 1);
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/* ─── Nağd kredit rate estimator (two-pass) ─── */
function estimateNaqdRate(meblег: number, muddət: number, gelir: number, movcudNaqdOdenis: number, kartAyliOdenis: number) {
  const baseRate =
    muddət <= 12 ? 12.5 :
    muddət <= 24 ? 15.5 :
    muddət <= 36 ? 18.5 :
    muddət <= 48 ? 21.5 : 24.5;

  function calcAddon(rate: number) {
    const pmt = annuityPayment(meblег, muddət, rate);
    const totalPayments = movcudNaqdOdenis + kartAyliOdenis + pmt;
    const bgn = gelir > 0 ? (totalPayments / gelir) * 100 : 999;
    const remaining = gelir - totalPayments;
    const bgnAddon = bgn <= 35 ? 0 : bgn <= 45 ? 1.5 : bgn <= 60 ? 4 : bgn <= 70 ? 7 : 7;
    const residualAddon = remaining < 317 ? 4 : 0;
    return { addon: Math.max(bgnAddon, residualAddon), bgn, remaining, pmt };
  }

  const pass1 = calcAddon(baseRate);
  const finalRate = Math.min(32, Math.max(10.9, baseRate + pass1.addon));
  const pass2 = calcAddon(finalRate);

  return {
    estimatedRate: finalRate,
    bgn: pass2.bgn,
    yeniOdenis: pass2.pmt,
    remaining: pass2.remaining,
    highRisk: pass2.bgn > 45 || pass2.remaining < 317,
    bgnOverLimit: pass2.bgn > 70,
  };
}

/* ─── Bank scoring ─── */
function calcBankScore(f: BankForm) {
  const meblег = parseFloat(f.meblег) || 0;
  const muddət = parseInt(f.muddət) || 0;
  const gelir = parseFloat(f.gelir) || 0;
  const yas = parseInt(f.yas) || 0;
  const movcudNaqdOdenis = parseFloat(f.movcudNaqdOdenis) || 0;
  const movcudKartLimit = parseFloat(f.movcudKartLimit) || 0;
  const cariGecikmeGun = parseInt(f.cariGecikmeGun) || 0;
  const son6ayGecikmeGun = parseInt(f.son6ayGecikmeGun) || 0;

  const kartAyliOdenis = annuityPayment(movcudKartLimit, 24, 26);

  let estimatedRate: number | null = null;
  let remaining: number | null = null;
  let highRisk = false;

  let yeniOdenis: number;
  let bgn: number;

  if (f.kreditNovu === "naqd" && !f.emanet) {
    const est = estimateNaqdRate(meblег, muddət, gelir, movcudNaqdOdenis, kartAyliOdenis);
    estimatedRate = est.estimatedRate;
    yeniOdenis = est.yeniOdenis;
    bgn = est.bgn;
    remaining = est.remaining;
    highRisk = est.highRisk;
  } else {
    const faiz = parseFloat(f.faiz) || 24;
    yeniOdenis = annuityPayment(meblег, muddət, faiz);
    bgn = gelir > 0 ? ((movcudNaqdOdenis + kartAyliOdenis + yeniOdenis) / gelir) * 100 : 999;
  }

  const ageAtEnd = yas + Math.ceil(muddət / 12);

  const stops: string[] = [];
  const warnings: string[] = [];

  if (!f.emanet) {
    if (yas > 0 && yas < 18) stops.push("Yaşınız 18-dən azdır — qanunvericiliyə görə kredit verilə bilməz");
    if (bgn > 70) stops.push(`BGN ${bgn.toFixed(1)}% — borc yükü 70%-dən yüksəkdir`);
    if (f.kreditNovu !== "ipoteka" && muddət > 59) stops.push(`${f.kreditNovu === "naqd" ? "Nağd kredit" : f.kreditNovu === "kart" ? "Kredit kartı" : "Avtokredit"} müddəti 59 aydan çox ola bilməz`);
    if (ageAtEnd > 73) stops.push(`Müddətin sonunda yaşınız ${ageAtEnd} olacaq — limit 73-dür`);
    if (f.kreditNovu === "kart" && gelir > 0 && (meblег + movcudKartLimit) > gelir * 5) stops.push(`Ümumi kredit xətti limiti (₼ ${(meblег + movcudKartLimit).toLocaleString()}) gəlirin 5 mislini (₼ ${(gelir * 5).toLocaleString()}) keçir — yeni limit mövcud limitlərlə birlikdə aylıq gəlirin 5 mislindən çox ola bilməz`);
  } else {
    const em = parseFloat(f.emanetMeblег) || 0;
    if (em < meblег) warnings.push("Əmanət məbləği kredit məbləğini tam örtməlidir");
  }

  if (!f.emanet) {
    if (f.gelirNovu === "qeyri_resmi" && meblег > 5000) {
      warnings.push("Qeyri-rəsmi gəlir üçün yalnız Kapital Bank kredit verə bilər, maksimum hədd təxminən 5 000 AZN-dir.");
    }
    if (bgn >= 45 && bgn <= 70) {
      warnings.push(`BGN ${bgn.toFixed(1)}% — borc yükü yüksəkdir, bəzi banklar rədd edə bilər.`);
    }
    if (highRisk) {
      warnings.push("Borc yükü və ya gəlirdən sonra qalan məbləğ bank üçün əlavə risk yarada bilər. Buna görə hesablamada daha yüksək faiz ssenarisi istifadə olunub.");
    }
    if (cariGecikmeGun > 0) {
      warnings.push(`Cari gecikmə ${cariGecikmeGun} gün — aktiv gecikmə kredit şansını azaldır.`);
    }
    if (son6ayGecikmeGun >= 30) {
      warnings.push(`Son 6 ayda maksimum gecikmə ${son6ayGecikmeGun} gün — banklar bu dövrə xüsusi diqqət yetirir.`);
    }
  }

  if (f.emanet) {
    const em = parseFloat(f.emanetMeblег) || 0;
    return { score: em >= meblег ? 92 : 0, stops: [], warnings, bgn, yeniOdenis, remaining, estimatedRate, blocks: null, isEmanet: true, emanetOk: em >= meblег };
  }

  if (stops.length > 0) {
    return { score: 0, stops, warnings, bgn, yeniOdenis, remaining, estimatedRate, blocks: null, isEmanet: false, emanetOk: false };
  }

  // Block 1: BGN (30)
  let b1 = bgn < 30 ? 30 : bgn < 45 ? 20 : bgn < 60 ? 10 : bgn <= 70 ? 3 : 0;

  // Block 2: Gəlir və sabitlik (25)
  const gelirNovuPts = f.gelirNovu === "resmi" ? 10 : f.gelirNovu === "fs" ? 7 : f.gelirNovu === "teqaud" ? 5 : 1;
  const gelirMeblегPts = gelir > 1500 ? 8 : gelir >= 800 ? 5 : 2;
  let stajPts = 0;
  if (f.gelirNovu !== "teqaud") {
    if (f.gelirNovu === "fs") {
      stajPts = f.isStaji === "12_plus" ? 7 : f.isStaji === "6_12" ? 4 : 0;
    } else {
      stajPts = f.isStaji === "12_plus" ? 7 : f.isStaji === "6_12" ? 5 : f.isStaji === "4_5" ? 2 : 0;
    }
  }
  const b2 = gelirNovuPts + gelirMeblегPts + stajPts;

  // Block 3: Yaş (15)
  let b3 = 0;
  if (yas >= 25 && yas <= 45) b3 = 15;
  else if ((yas >= 21 && yas <= 24) || (yas >= 46 && yas <= 55)) b3 = 10;
  else if ((yas >= 18 && yas <= 20) || (yas >= 56 && yas <= 60)) b3 = 5;
  else if (yas >= 61 && ageAtEnd <= 73) b3 = 2;

  // Block 4: Kredit tarixçəsi (20)
  // Cari gecikmə (0–5 pts)
  let cariPts: number;
  if (cariGecikmeGun === 0) cariPts = 5;
  else if (cariGecikmeGun <= 5) cariPts = 4;
  else if (cariGecikmeGun <= 15) cariPts = 2;
  else if (cariGecikmeGun <= 25) cariPts = 1;
  else if (cariGecikmeGun <= 30) cariPts = 0;
  else cariPts = 0;

  // Son 6 ay max gecikmə (0–10 pts)
  let son6Pts: number;
  if (son6ayGecikmeGun === 0) son6Pts = 10;
  else if (son6ayGecikmeGun <= 29) son6Pts = 7;
  else if (son6ayGecikmeGun <= 59) son6Pts = 3;
  else if (son6ayGecikmeGun <= 89) son6Pts = 1;
  else son6Pts = 0;

  const baglanmisPts = f.baglanmisTecrube === "var" ? 5 : 3;
  const b4 = cariPts + son6Pts + baglanmisPts;

  // Block 5: Kredit parametrləri (10)
  const muddətPts = muddət <= 36 ? 4 : muddət <= 59 ? 2 : 0;
  const meblегPts = meblег <= 10000 ? 3 : meblег <= 25000 ? 2 : 1;
  const zaminPts = f.zamin ? 3 : 0;
  const b5 = muddətPts + meblегPts + zaminPts;

  const score = Math.min(100, b1 + b2 + b3 + b4 + b5);

  return {
    score, stops, warnings, bgn, yeniOdenis, remaining, estimatedRate, isEmanet: false, emanetOk: false,
    blocks: [
      { label: "Borc yükü (BGN)", score: b1, max: 30 },
      { label: "Gəlir və sabitlik", score: b2, max: 25 },
      { label: "Yaş", score: b3, max: 15 },
      { label: "Kredit tarixçəsi", score: b4, max: 20 },
      { label: "Kredit parametrləri", score: b5, max: 10 },
    ],
  };
}

/* ─── BOKT scoring ─── */
function calcBoktScore(f: BoktForm) {
  const meblег = parseFloat(f.meblег) || 0;
  const gelir = parseFloat(f.gelir) || 0;
  const warnings: string[] = [];

  if (f.emanet) {
    const em = parseFloat(f.emanetMeblег) || 0;
    if (em < meblег) warnings.push("Əmanət məbləği kredit məbləğini tam örtməlidir");
    return { score: em >= meblег ? 92 : 0, warnings, stops: [] as string[], maxOdenis: meblег * 2, isEmanet: true, emanetOk: em >= meblег };
  }

  if (meblег > 500) warnings.push("BOKT-larda maksimum məbləğ adətən 500 AZN-dir");

  const gelirPts = gelir > 500 ? 40 : gelir >= 300 ? 25 : 10;
  const tarixcePts = f.kreditTarixce === "yox" ? 40 : 15;
  const meblегPts = meblег <= 500 ? 20 : 0;
  const score = Math.min(100, gelirPts + tarixcePts + meblегPts);

  return { score, warnings, stops: [] as string[], maxOdenis: meblег * 2, isEmanet: false, emanetOk: false };
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
      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
        <span>Yaxşı</span><span>Orta</span><span>Yüksək</span><span>Stop</span>
      </div>
    </div>
  );
}

/* ─── Score label ─── */
function scoreLabel(score: number, mode: Mode) {
  if (mode === "bank") {
    if (score >= 80) return { text: "Yüksək şans — Bankların əksəriyyəti təsdiqləyə bilər", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: "🟢" };
    if (score >= 60) return { text: "Orta şans — Şansınız var, bankdan asılıdır", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", icon: "🟡" };
    if (score >= 40) return { text: "Aşağı şans — Profili yaxşılaşdırmaq tövsiyə olunur", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", icon: "🟠" };
    return { text: "Rədd riski — Bank tərəfindən rədd riski yüksəkdir", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: "🔴" };
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
      {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
const selectCls = inputCls;
const sectionTitle = "text-xs font-bold text-gray-400 uppercase tracking-wider mb-3";

/* ─── Main ─── */
function KreditYoxlamaContent() {
  const searchParams = useSearchParams();
  const initNov = (searchParams.get("nov") as KreditNovu) || "naqd";
  const initMebleq = searchParams.get("mebleq") || "";
  const initMuddet = searchParams.get("muddet") || "24";
  const initFaiz = searchParams.get("faiz") || "24";

  const [mode, setMode] = useState<Mode>("bank");
  const [submitted, setSubmitted] = useState(false);
  const [pressed, setPressed] = useState(false);

  const [bank, setBank] = useState<BankForm>({
    kreditNovu: initNov,
    meblег: initMebleq,
    muddət: initMuddet,
    faiz: initFaiz,
    gelirNovu: "resmi",
    teqaudNovu: "yasa_gore",
    gelir: "",
    isStaji: "12_plus",
    yas: "",
    movcudNaqdOdenis: "0",
    movcudKartLimit: "0",
    cariGecikmeGun: "0",
    son6ayGecikmeGun: "0",
    baglanmisTecrube: "var",
    zamin: false,
    emanet: false,
    emanetMeblег: "",
  });

  const [bokt, setBokt] = useState<BoktForm>({
    meblег: "",
    gelir: "",
    kreditTarixce: "yox",
    emanet: false,
    emanetMeblег: "",
  });

  const bResult = useMemo(() => calcBankScore(bank), [bank]);
  const nResult = useMemo(() => calcBoktScore(bokt), [bokt]);

  const result = mode === "bank" ? bResult : nResult;

  function switchToBokt() {
    setBokt(n => ({ ...n, meblег: bank.meblег, gelir: bank.gelir }));
    setMode("bokt");
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const bStops = (bResult as any).stops as string[];
  const hasStops = mode === "bank" && bStops.length > 0 && !bank.emanet;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Kredit Skoring Kalkulyatoru</h1>
          <p className="text-blue-100 text-base">Bank müraciətindən əvvəl kredit şansınızı qiymətləndirin</p>

          <div className="mt-6 inline-flex rounded-2xl bg-white/15 p-1 border border-white/20">
            <button onClick={() => { setMode("bank"); setSubmitted(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${mode === "bank" ? "bg-white text-blue-700 shadow-md" : "text-white/80 hover:text-white"}`}>
              <Landmark size={16} /> Banklar
            </button>
            <button onClick={() => { setMode("bokt"); setSubmitted(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${mode === "bokt" ? "bg-white text-blue-700 shadow-md" : "text-white/80 hover:text-white"}`}>
              <Building2 size={16} /> BOKT
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
                {/* Əmanət */}
                <label className="flex items-start gap-3 p-3 rounded-xl border-2 border-blue-100 bg-blue-50 cursor-pointer hover:border-blue-300 transition">
                  <input type="checkbox" checked={bank.emanet} onChange={e => setBank(b => ({ ...b, emanet: e.target.checked }))}
                    className="mt-0.5 accent-blue-600 w-4 h-4" />
                  <span className="text-sm text-blue-800 font-medium">Əmanətim var və onu giov kimi istifadə etmək istəyirəm</span>
                </label>

                {bank.emanet && (
                  <Field label="Əmanət məbləği (AZN)">
                    <input type="number" placeholder="5000" value={bank.emanetMeblег}
                      onChange={e => setBank(b => ({ ...b, emanetMeblег: e.target.value }))} className={inputCls} />
                  </Field>
                )}

                {/* ── Kredit parametrləri ── */}
                <div>
                  <p className={sectionTitle}>Kredit parametrləri</p>
                  <div className="space-y-4">
                    <Field label="Kredit növü">
                      <select value={bank.kreditNovu} onChange={e => setBank(b => ({ ...b, kreditNovu: e.target.value as KreditNovu }))} className={selectCls}>
                        <option value="naqd">Nağd kredit</option>
                        <option value="kart">Kredit kartı</option>
                        <option value="ipoteka">İpoteka</option>
                        <option value="avto">Avtomobil krediti</option>
                      </select>
                    </Field>

                    <SliderRow label="Tələb olunan məbləğ" value={parseFloat(bank.meblег) || 500} min={500}
                      max={bank.kreditNovu === "ipoteka" || bank.kreditNovu === "avto" ? 500000 : 100000} step={500}
                      format={(v) => `₼ ${v.toLocaleString()}`} unit="₼"
                      onChange={(v) => setBank(b => ({ ...b, meblег: String(v) }))} />

                    <SliderRow label="Kredit müddəti" value={parseInt(bank.muddət) || 24} min={1} max={bank.kreditNovu === "ipoteka" ? 360 : 59} step={1}
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
                      <select value={bank.gelirNovu} onChange={e => setBank(b => ({ ...b, gelirNovu: e.target.value as GelirNovu }))} className={selectCls}>
                        <option value="resmi">Rəsmi gəlir</option>
                        <option value="qeyri_resmi">Qeyri-rəsmi gəlir</option>
                        <option value="teqaud">Təqaüd</option>
                        <option value="fs">Fiziki sahibkar (VÖEN)</option>
                      </select>
                    </Field>

                    {bank.gelirNovu === "teqaud" && (
                      <Field label="Təqaüdün növü">
                        <select value={bank.teqaudNovu} onChange={e => setBank(b => ({ ...b, teqaudNovu: e.target.value as TeqaudNovu }))} className={selectCls}>
                          <option value="yasa_gore">Yaşa görə təqaüd</option>
                          <option value="sosial">Sosial təqaüd</option>
                          <option value="qazi">Qazi təqaüdü</option>
                          <option value="sehid_ailesi">Şəhid ailəsi təqaüdü</option>
                        </select>
                      </Field>
                    )}

                    <Field label="Aylıq gəlir (net, AZN)" note="Vergi çıxıldıqdan sonra">
                      <input type="number" placeholder="1000" min={0} value={bank.gelir}
                        onChange={e => setBank(b => ({ ...b, gelir: e.target.value }))} className={inputCls} />
                    </Field>

                    {bank.gelirNovu !== "teqaud" && (
                      <Field label="Cari iş yerində staj">
                        <select value={bank.isStaji} onChange={e => setBank(b => ({ ...b, isStaji: e.target.value as IsStaji }))} className={selectCls}>
                          <option value="0_3">0 – 3 ay</option>
                          <option value="4_5">4 – 5 ay</option>
                          <option value="6_12">6 – 12 ay</option>
                          <option value="12_plus">12 aydan çox</option>
                        </select>
                      </Field>
                    )}
                  </div>
                </div>

                {/* ── Şəxsi məlumatlar ── */}
                <div className="border-t border-gray-100 pt-4">
                  <p className={sectionTitle}>Şəxsi məlumatlar</p>
                  <SliderRow label="Yaş" value={parseInt(bank.yas) || 30} min={16} max={75} step={1}
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
                    <Field label="Cari gecikmə (gün)" note="Hazırda gecikmiş ödənişiniz yoxdursa 0 yazın.">
                      <input type="number" placeholder="0" min={0} value={bank.cariGecikmeGun}
                        onChange={e => setBank(b => ({ ...b, cariGecikmeGun: e.target.value }))} className={inputCls} />
                    </Field>

                    <Field label="Son 6 ayda maksimum gecikmə (gün)" note="Son 6 ayda ən uzun gecikdiyiniz gün sayı. Yoxdursa 0 yazın.">
                      <input type="number" placeholder="0" min={0} value={bank.son6ayGecikmeGun}
                        onChange={e => setBank(b => ({ ...b, son6ayGecikmeGun: e.target.value }))} className={inputCls} />
                    </Field>

                    <Field label="Bağlanmış kredit təcrübəsi">
                      <select value={bank.baglanmisTecrube} onChange={e => setBank(b => ({ ...b, baglanmisTecrube: e.target.value as BaglanmisTecrube }))} className={selectCls}>
                        <option value="var">Var (vaxtında bağlamışam)</option>
                        <option value="yoxdur">Var, lakin problemli olub</option>
                        <option value="tecrube_yox">Kredit təcrübəm yoxdur</option>
                      </select>
                    </Field>

                  </div>
                </div>
              </>
            ) : (
              <>
                {/* BOKT form */}
                <label className="flex items-start gap-3 p-3 rounded-xl border-2 border-blue-100 bg-blue-50 cursor-pointer hover:border-blue-300 transition">
                  <input type="checkbox" checked={bokt.emanet} onChange={e => setBokt(n => ({ ...n, emanet: e.target.checked }))}
                    className="mt-0.5 accent-blue-600 w-4 h-4" />
                  <span className="text-sm text-blue-800 font-medium">Əmanətim var və onu giov kimi istifadə etmək istəyirəm</span>
                </label>

                {bokt.emanet && (
                  <Field label="Əmanət məbləği (AZN)">
                    <input type="number" placeholder="500" value={bokt.emanetMeblег}
                      onChange={e => setBokt(n => ({ ...n, emanetMeblег: e.target.value }))} className={inputCls} />
                  </Field>
                )}

                <SliderRow label="Tələb olunan məbləğ" value={parseFloat(bokt.meblег) || 100} min={50} max={1000} step={50}
                  format={(v) => `₼ ${v}`} unit="₼"
                  onChange={(v) => setBokt(n => ({ ...n, meblег: String(v) }))} />

                <SliderRow label="Aylıq gəlir" value={parseFloat(bokt.gelir) || 300} min={100} max={5000} step={50}
                  format={(v) => `₼ ${v.toLocaleString()}`} unit="₼"
                  onChange={(v) => setBokt(n => ({ ...n, gelir: String(v) }))} />

                <Field label="Kredit tarixçəsi">
                  <select value={bokt.kreditTarixce} onChange={e => setBokt(n => ({ ...n, kreditTarixce: e.target.value as "yox" | "gecikme" }))} className={selectCls}>
                    <option value="yox">Gecikmə yoxdur</option>
                    <option value="gecikme">Gecikmələr var</option>
                  </select>
                </Field>

                {parseFloat(bokt.meblег) > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm">
                    <p className="font-bold text-amber-800 mb-1">💸 BOKT Xərc Hesablaması</p>
                    <p className="text-amber-700">Maksimum ödəniləcək məbləğ: <strong>{(parseFloat(bokt.meblег) * 2).toFixed(0)} AZN</strong></p>
                    <p className="text-xs text-amber-600 mt-1">Mərkəzi Bank qaydası: ümumi borcun artımı əsas borcun 100%-ni keçə bilməz</p>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => {
                setPressed(true);
                setTimeout(() => { setPressed(false); setSubmitted(true); }, 350);
              }}
              disabled={pressed}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white text-sm transition-all duration-200 shadow-md
                ${pressed ? "scale-95 shadow-inner brightness-90" : "hover:shadow-lg hover:brightness-110 active:scale-95"}`}
              style={{ background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)" }}
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
                <p className="text-sm text-gray-400 font-medium">Məlumatları daxil edin<br />və "Hesabla" düyməsinə basın</p>
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
                    {result.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-amber-700">⚠️ {w}</p>
                      </div>
                    ))}
                  </div>
                )}

                {result.isEmanet && result.emanetOk && (
                  <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-sm">
                    <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" />
                    <p className="text-green-700 font-medium">Əmanət kimi istifadə etdikdə təsdiqlənmə ehtimalı çox yüksəkdir.</p>
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

                {mode === "bank" && bResult.bgn < 999 && !bank.emanet && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <BgnBar bgn={bResult.bgn} />
                    {bResult.yeniOdenis > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Yeni aylıq ödəniş: <strong className="text-gray-700">{bResult.yeniOdenis.toFixed(0)} AZN</strong>
                        {bResult.estimatedRate != null ? (
                          <span className="text-gray-400"> ({bResult.estimatedRate.toFixed(1)}% illik — təxmini)</span>
                        ) : (
                          <span className="text-gray-400"> ({bank.faiz}% illik ilə)</span>
                        )}
                      </p>
                    )}
                    {bResult.estimatedRate != null && (
                      <div className="mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 space-y-1">
                        <p className="font-semibold">Navio tərəfindən hesablanan təxmini faiz: {bResult.estimatedRate.toFixed(1)}%</p>
                        <p className="text-indigo-500">Faiz dərəcəsi kredit müddəti, borc yükü və gəlirdən sonra qalan məbləğ əsasında təxmini hesablanıb. Bankın real təklifi fərqli ola bilər.</p>
                      </div>
                    )}
                  </div>
                )}

                {mode === "bank" && bResult.blocks && !hasStops && !bank.emanet && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bal bölgüsü</p>
                    {bResult.blocks.map((bl) => (
                      <div key={bl.label}>
                        <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                          <span>{bl.label}</span>
                          <span className="font-bold">{bl.score} / {bl.max}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                            style={{ width: `${(bl.score / bl.max) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
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
