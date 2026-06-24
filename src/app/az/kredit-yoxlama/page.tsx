"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, XCircle, CheckCircle, Info, ArrowRight, Building2, Landmark } from "lucide-react";

/* ─── Types ─── */
type Mode = "bank" | "nbko";
type GelirNovu = "resmi" | "fs" | "qeyri_resmi_emp" | "qeyri_resmi" | "teqaud";
type KreditNovu = "naqd" | "kart" | "ipoteka" | "avto";
type KreditTarixce = "yox" | "vaxtinda" | "gecikme";
type BaglanmisTecrube = "var" | "yoxdur" | "tecrube_yox";

interface BankForm {
  meblег: string;
  muddət: string;
  gelirNovu: GelirNovu;
  gelir: string;
  isStaji: string;
  yas: string;
  movcudOdenis: string;
  kreditNovu: KreditNovu;
  kartLimit: string;
  zamin: boolean;
  kreditTarixce: KreditTarixce;
  son6ayGecikme: boolean;
  baglanmisTecrube: BaglanmisTecrube;
  emanet: boolean;
  emanetMeblег: string;
}

interface NbkoForm {
  meblег: string;
  gelir: string;
  kreditTarixce: "yox" | "gecikme";
  emanet: boolean;
  emanetMeblег: string;
}

/* ─── Annuity formula ─── */
function annuityPayment(principal: number, months: number, annualRate = 0.24): number {
  if (months <= 0 || principal <= 0) return 0;
  const r = annualRate / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/* ─── Bank scoring ─── */
function calcBankScore(f: BankForm) {
  const meblег = parseFloat(f.meblег) || 0;
  const muddət = parseInt(f.muddət) || 0;
  const gelir = parseFloat(f.gelir) || 0;
  const yas = parseInt(f.yas) || 0;
  const movcudOdenis = parseFloat(f.movcudOdenis) || 0;
  const kartLimit = parseFloat(f.kartLimit) || 0;
  const isStaji = parseInt(f.isStaji) || 0;

  const yeniOdenis = annuityPayment(meblег, muddət);
  const bgn = gelir > 0 ? ((movcudOdenis + yeniOdenis) / gelir) * 100 : 999;
  const ageAtEnd = yas + Math.ceil(muddət / 12);

  const stops: string[] = [];
  const warnings: string[] = [];

  if (!f.emanet) {
    if (bgn > 70) stops.push(`BGN ${bgn.toFixed(1)}% — borc yükü 70%-dən yüksəkdir`);
    if (f.kreditNovu === "naqd" && muddət > 59) stops.push("Nağd kredit müddəti 59 aydan çox ola bilməz");
    if (ageAtEnd > 73) stops.push(`Müddətin sonunda yaşınız ${ageAtEnd} olacaq — limit 73-dür`);
    if (f.kreditNovu === "kart" && kartLimit >= gelir * 5) stops.push("Mövcud kart limiti gəlirin 5 mislindən artıqdır");
  } else {
    const emanetMeblег = parseFloat(f.emanetMeblег) || 0;
    if (emanetMeblег < meblег) {
      warnings.push("Əmanət məbləği kredit məbləğini tam örtməlidir");
    }
  }

  if (!f.emanet) {
    if (f.gelirNovu === "qeyri_resmi_emp" && meblег > 5000) {
      warnings.push("Qeyri-rəsmi gəlir üçün yalnız Kapital Bank kredit verə bilər, maksimum hədd təxminən 5 000 AZN-dir.");
    }
    if (bgn >= 45 && bgn <= 70) {
      warnings.push(`BGN ${bgn.toFixed(1)}% — borc yükü yüksəkdir, bəzi banklar rədd edə bilər.`);
    }
  }

  if (f.emanet) {
    const emanetMeblег = parseFloat(f.emanetMeblег) || 0;
    const score = emanetMeblег >= meblег ? 92 : 0;
    return { score, stops: [], warnings, bgn, yeniOdenis, blocks: null, isEmanet: true, emanetOk: emanetMeblег >= meblег };
  }

  if (stops.length > 0) {
    return { score: 0, stops, warnings, bgn, yeniOdenis, blocks: null, isEmanet: false, emanetOk: false };
  }

  // Block 1: BGN (30)
  let b1 = 0;
  if (bgn < 30) b1 = 30;
  else if (bgn < 45) b1 = 20;
  else if (bgn < 60) b1 = 10;
  else if (bgn <= 70) b1 = 3;

  // Block 2: Gəlir (25)
  let gelirNovuPts = 0;
  if (f.gelirNovu === "resmi") gelirNovuPts = 10;
  else if (f.gelirNovu === "fs") gelirNovuPts = 7;
  else if (f.gelirNovu === "teqaud") gelirNovuPts = 5;
  else if (f.gelirNovu === "qeyri_resmi_emp") gelirNovuPts = 3;
  else gelirNovuPts = 1;

  let gelirMeblегPts = gelir > 1500 ? 8 : gelir >= 800 ? 5 : 2;

  let stajPts = 0;
  if (f.gelirNovu !== "teqaud") {
    if (f.gelirNovu === "fs") {
      stajPts = isStaji >= 12 ? 7 : isStaji >= 6 ? 4 : 0;
    } else {
      stajPts = isStaji >= 12 ? 7 : isStaji >= 6 ? 5 : isStaji >= 3 ? 2 : 0;
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
  let aktivPts = f.kreditTarixce === "yox" ? 5 : f.kreditTarixce === "vaxtinda" ? 4 : 0;
  let gecikPts = f.son6ayGecikme ? 0 : 10;
  let baglanmisPts = f.baglanmisTecrube === "var" ? 5 : 3;
  const b4 = aktivPts + gecikPts + baglanmisPts;

  // Block 5: Kredit parametrləri (10)
  let muddətPts = muddət <= 36 ? 4 : muddət <= 59 ? 2 : 0;
  let meblегPts = meblег <= 10000 ? 3 : meblег <= 25000 ? 2 : 1;
  let zaminPts = f.zamin ? 3 : 0;
  const b5 = muddətPts + meblегPts + zaminPts;

  const score = Math.min(100, b1 + b2 + b3 + b4 + b5);

  return {
    score,
    stops,
    warnings,
    bgn,
    yeniOdenis,
    isEmanet: false,
    emanetOk: false,
    blocks: [
      { label: "Borc yükü (BGN)", score: b1, max: 30 },
      { label: "Gəlir və sabitlik", score: b2, max: 25 },
      { label: "Yaş", score: b3, max: 15 },
      { label: "Kredit tarixçəsi", score: b4, max: 20 },
      { label: "Kredit parametrləri", score: b5, max: 10 },
    ],
  };
}

/* ─── NBKO scoring ─── */
function calcNbkoScore(f: NbkoForm) {
  const meblег = parseFloat(f.meblег) || 0;
  const gelir = parseFloat(f.gelir) || 0;
  const warnings: string[] = [];

  if (f.emanet) {
    const emanetMeblег = parseFloat(f.emanetMeblег) || 0;
    if (emanetMeblег < meblег) warnings.push("Əmanət məbləği kredit məbləğini tam örtməlidir");
    return { score: emanetMeblег >= meblег ? 92 : 0, warnings, stops: [], maxOdenis: meblег * 2, isEmanet: true, emanetOk: emanetMeblег >= meblег };
  }

  if (meblег > 500) {
    warnings.push("NBKO-larda maksimum məbləğ adətən 500 AZN-dir");
  }

  let gelirPts = gelir > 500 ? 40 : gelir >= 300 ? 25 : 10;
  let tarixcePts = f.kreditTarixce === "yox" ? 40 : 15;
  let meblегPts = meblег <= 500 ? 20 : 0;
  const score = Math.min(100, gelirPts + tarixcePts + meblегPts);

  return { score, warnings, stops: [] as string[], maxOdenis: meblег * 2, isEmanet: false, emanetOk: false };
}

/* ─── Gauge SVG ─── */
function Gauge({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.min(score / max, 1);
  const r = 70;
  const cx = 90, cy = 85;
  const startAngle = Math.PI;
  const endAngle = 0;
  const angle = startAngle + pct * (endAngle - startAngle + Math.PI);
  const arcLen = Math.PI * r;
  const dashLen = pct * arcLen;

  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : score >= 40 ? "#f97316" : "#ef4444";

  const needleX = cx + r * Math.cos(Math.PI - pct * Math.PI);
  const needleY = cy - r * Math.sin(pct * Math.PI);

  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-xs mx-auto">
      {/* Track */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
      {/* Color zones */}
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      {/* Filled arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="url(#scoreGrad)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${dashLen} ${arcLen}`}
      />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#1e293b" />
      {/* Labels */}
      <text x={cx - r - 2} y={cy + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">0</text>
      <text x={cx + r + 2} y={cy + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">{max}</text>
      {/* Score */}
      <text x={cx} y={cy - 16} textAnchor="middle" fontSize="26" fontWeight="800" fill="#0f172a">{score}</text>
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="8" fill="#64748b">/ {max}</text>
    </svg>
  );
}

/* ─── BGN Bar ─── */
function BgnBar({ bgn }: { bgn: number }) {
  const pct = Math.min(bgn / 100, 1);
  const color = bgn < 30 ? "bg-green-500" : bgn < 45 ? "bg-yellow-400" : bgn < 70 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>BGN: <strong className="text-gray-800">{bgn.toFixed(1)}%</strong></span>
        <span>Limit: 70%</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500">
        <div className="absolute top-0 bottom-0 right-0 bg-gray-100/60" style={{ left: `${pct * 100}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-gray-700 shadow"
          style={{ left: `calc(${pct * 100}% - 5px)` }}
        />
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
    if (score >= 40) return { text: "Aşağı şans — Çətin, profili yaxşılaşdırmaq tövsiyə olunur", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", icon: "🟠" };
    return { text: "Rədd riski — Bank tərəfindən rədd riski yüksəkdir", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: "🔴" };
  } else {
    if (score >= 80) return { text: "NBKO-dan kredit ala bilərsiniz", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: "🟢" };
    if (score >= 40) return { text: "Bəzi NBKO-lar təklif edə bilər", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", icon: "🟡" };
    return { text: "NBKO-dan da çətin olacaq", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: "🔴" };
  }
}

/* ─── Field components ─── */
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

/* ─── Main ─── */
export default function KreditYoxlama() {
  const [mode, setMode] = useState<Mode>("bank");

  const [bank, setBank] = useState<BankForm>({
    meblег: "",
    muddət: "24",
    gelirNovu: "resmi",
    gelir: "",
    isStaji: "",
    yas: "",
    movcudOdenis: "0",
    kreditNovu: "naqd",
    kartLimit: "0",
    zamin: false,
    kreditTarixce: "yox",
    son6ayGecikme: false,
    baglanmisTecrube: "var",
    emanet: false,
    emanetMeblег: "",
  });

  const [nbko, setNbko] = useState<NbkoForm>({
    meblег: "",
    gelir: "",
    kreditTarixce: "yox",
    emanet: false,
    emanetMeblег: "",
  });

  const bResult = useMemo(() => calcBankScore(bank), [bank]);
  const nResult = useMemo(() => calcNbkoScore(nbko), [nbko]);

  const result = mode === "bank" ? bResult : nResult;
  const label = result.score > 0 || (result as any).stops?.length === 0
    ? scoreLabel(result.score, mode)
    : null;

  function switchToNbko() {
    setNbko((n) => ({
      ...n,
      meblег: bank.meblег,
      gelir: bank.gelir,
    }));
    setMode("nbko");
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

          {/* Mode Toggle */}
          <div className="mt-6 inline-flex rounded-2xl bg-white/15 p-1 border border-white/20">
            <button
              onClick={() => setMode("bank")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${mode === "bank" ? "bg-white text-blue-700 shadow-md" : "text-white/80 hover:text-white"}`}
            >
              <Landmark size={16} /> Banklar
            </button>
            <button
              onClick={() => setMode("nbko")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${mode === "nbko" ? "bg-white text-blue-700 shadow-md" : "text-white/80 hover:text-white"}`}
            >
              <Building2 size={16} /> NBKO
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

                <Field label="Tələb olunan məbləğ (AZN)">
                  <input type="number" placeholder="3000" value={bank.meblег}
                    onChange={e => setBank(b => ({ ...b, meblег: e.target.value }))} className={inputCls} />
                </Field>

                <Field label="Kredit müddəti (ay)">
                  <input type="number" placeholder="24" min={1} max={360} value={bank.muddət}
                    onChange={e => setBank(b => ({ ...b, muddət: e.target.value }))} className={inputCls} />
                </Field>

                <Field label="Kredit növü">
                  <select value={bank.kreditNovu} onChange={e => setBank(b => ({ ...b, kreditNovu: e.target.value as KreditNovu }))} className={selectCls}>
                    <option value="naqd">Nağd kredit</option>
                    <option value="kart">Kredit kartı</option>
                    <option value="ipoteka">İpoteka</option>
                    <option value="avto">Avtomobil krediti</option>
                  </select>
                </Field>

                {bank.kreditNovu === "kart" && (
                  <Field label="Mövcud ümumi kart limiti (AZN)">
                    <input type="number" placeholder="0" value={bank.kartLimit}
                      onChange={e => setBank(b => ({ ...b, kartLimit: e.target.value }))} className={inputCls} />
                  </Field>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Gəlir məlumatları</p>

                  <div className="space-y-4">
                    <Field label="Gəlir növü">
                      <select value={bank.gelirNovu} onChange={e => setBank(b => ({ ...b, gelirNovu: e.target.value as GelirNovu }))} className={selectCls}>
                        <option value="resmi">Rəsmi əməkhaqqı</option>
                        <option value="fs">FŞ (VÖEN)</option>
                        <option value="qeyri_resmi_emp">Qeyri-rəsmi əməkhaqqı</option>
                        <option value="qeyri_resmi">Qeyri-rəsmi gəlir</option>
                        <option value="teqaud">Təqaüd</option>
                      </select>
                    </Field>

                    <Field label="Aylıq gəlir (AZN)" note="Vergi çıxıldıqdan sonra (net)">
                      <input type="number" placeholder="1000" value={bank.gelir}
                        onChange={e => setBank(b => ({ ...b, gelir: e.target.value }))} className={inputCls} />
                    </Field>

                    {bank.gelirNovu !== "teqaud" && (
                      <Field label="İş stajı (ay)">
                        <input type="number" placeholder="24" value={bank.isStaji}
                          onChange={e => setBank(b => ({ ...b, isStaji: e.target.value }))} className={inputCls} />
                      </Field>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Şəxsi məlumatlar</p>
                  <div className="space-y-4">
                    <Field label="Yaş">
                      <input type="number" placeholder="30" min={18} max={80} value={bank.yas}
                        onChange={e => setBank(b => ({ ...b, yas: e.target.value }))} className={inputCls} />
                    </Field>

                    <Field label="Mövcud aylıq kredit ödənişləri (AZN)" note="Əgər yoxdursa, 0 yazın">
                      <input type="number" placeholder="0" value={bank.movcudOdenis}
                        onChange={e => setBank(b => ({ ...b, movcudOdenis: e.target.value }))} className={inputCls} />
                    </Field>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kredit tarixçəsi</p>
                  <div className="space-y-4">
                    <Field label="Aktiv kredit vəziyyəti">
                      <select value={bank.kreditTarixce} onChange={e => setBank(b => ({ ...b, kreditTarixce: e.target.value as KreditTarixce }))} className={selectCls}>
                        <option value="yox">Aktiv kredit yoxdur</option>
                        <option value="vaxtinda">Aktiv kredit var, vaxtında ödəyirəm</option>
                        <option value="gecikme">Aktiv kredit var, gecikmələr var</option>
                      </select>
                    </Field>

                    <Field label="Son 6 ayda gecikmə">
                      <select value={bank.son6ayGecikme ? "var" : "yox"} onChange={e => setBank(b => ({ ...b, son6ayGecikme: e.target.value === "var" }))} className={selectCls}>
                        <option value="yox">Yox</option>
                        <option value="var">Var</option>
                      </select>
                    </Field>

                    <Field label="Bağlanmış kredit təcrübəsi">
                      <select value={bank.baglanmisTecrube} onChange={e => setBank(b => ({ ...b, baglanmisTecrube: e.target.value as BaglanmisTecrube }))} className={selectCls}>
                        <option value="var">Var (vaxtında bağlamışam)</option>
                        <option value="yoxdur">Var, lakin problemli olub</option>
                        <option value="tecrube_yox">Kredit təcrübəm yoxdur</option>
                      </select>
                    </Field>

                    <Field label="Zamin / girov">
                      <select value={bank.zamin ? "var" : "yox"} onChange={e => setBank(b => ({ ...b, zamin: e.target.value === "var" }))} className={selectCls}>
                        <option value="yox">Yoxdur</option>
                        <option value="var">Var</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* NBKO form */}
                <label className="flex items-start gap-3 p-3 rounded-xl border-2 border-blue-100 bg-blue-50 cursor-pointer hover:border-blue-300 transition">
                  <input type="checkbox" checked={nbko.emanet} onChange={e => setNbko(n => ({ ...n, emanet: e.target.checked }))}
                    className="mt-0.5 accent-blue-600 w-4 h-4" />
                  <span className="text-sm text-blue-800 font-medium">Əmanətim var və onu giov kimi istifadə etmək istəyirəm</span>
                </label>

                {nbko.emanet && (
                  <Field label="Əmanət məbləği (AZN)">
                    <input type="number" placeholder="500" value={nbko.emanetMeblег}
                      onChange={e => setNbko(n => ({ ...n, emanetMeblег: e.target.value }))} className={inputCls} />
                  </Field>
                )}

                <Field label="Tələb olunan məbləğ (AZN)">
                  <input type="number" placeholder="300" value={nbko.meblег}
                    onChange={e => setNbko(n => ({ ...n, meblег: e.target.value }))} className={inputCls} />
                </Field>

                <Field label="Aylıq gəlir (AZN)">
                  <input type="number" placeholder="600" value={nbko.gelir}
                    onChange={e => setNbko(n => ({ ...n, gelir: e.target.value }))} className={inputCls} />
                </Field>

                <Field label="Kredit tarixçəsi">
                  <select value={nbko.kreditTarixce} onChange={e => setNbko(n => ({ ...n, kreditTarixce: e.target.value as "yox" | "gecikme" }))} className={selectCls}>
                    <option value="yox">Gecikmə yoxdur</option>
                    <option value="gecikme">Gecikmələr var</option>
                  </select>
                </Field>

                {/* NBKO cost */}
                {parseFloat(nbko.meblег) > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm">
                    <p className="font-bold text-amber-800 mb-1">💸 NBKO Xərc Hesablaması</p>
                    <p className="text-amber-700">Maksimum ödəniləcək məbləğ: <strong>{(parseFloat(nbko.meblег) * 2).toFixed(0)} AZN</strong></p>
                    <p className="text-xs text-amber-600 mt-1">Mərkəzi Bank qaydası: ümumi borcun artımı əsas borcun 100%-ni keçə bilməz</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── RESULT ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4 text-center text-sm uppercase tracking-wider">Nəticə</h2>

            {/* Hard stops */}
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
                <button
                  onClick={switchToNbko}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition"
                >
                  NBKO-da yoxlamaq istəyirsiniz? <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Warnings */}
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

            {/* Emanet success */}
            {result.isEmanet && result.emanetOk && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-sm">
                <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-green-700 font-medium">Əmanət kimi istifadə etdikdə təsdiqlənmə ehtimalı çox yüksəkdir.</p>
              </div>
            )}

            {/* Gauge */}
            <div className="mb-2">
              <Gauge score={hasStops ? 0 : result.score} />
            </div>

            {/* Score label */}
            {!hasStops && (result.score > 0 || bank.meblег || nbko.meblег) && (
              <div className={`mt-3 p-3 rounded-xl border text-sm font-medium text-center ${scoreLabel(result.score, mode).bg} ${scoreLabel(result.score, mode).color}`}>
                {scoreLabel(result.score, mode).icon} {scoreLabel(result.score, mode).text}
              </div>
            )}

            {/* BGN bar for bank mode */}
            {mode === "bank" && (bResult.bgn < 999) && !bank.emanet && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <BgnBar bgn={bResult.bgn} />
                {bResult.yeniOdenis > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Yeni aylıq ödəniş: <strong className="text-gray-700">{bResult.yeniOdenis.toFixed(0)} AZN</strong>
                    <span className="text-gray-400"> (illik 24% ilə)</span>
                  </p>
                )}
              </div>
            )}

            {/* Blocks breakdown */}
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
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${(bl.score / bl.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700">
            <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
            <p>Bu nəticə ilkin qiymətləndirmədir. Yekun qərarı bank/NBKO verir. Navio heç bir kredit vermir.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
