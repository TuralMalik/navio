"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Trash2, ChevronDown } from "lucide-react";
import { calcAnnuityPayment } from "@/lib/calculators/annuity";
import { formatCurrency } from "@/lib/utils";

const inputClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition";
const selectClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition appearance-none";

type ErkenRejim = "muddət" | "odəniş";

interface OneTimePayment { id: number; month: number; amount: number; }
interface ScheduleRow { month: number; payment: number; extra: number; interest: number; principal: number; balance: number; }

export default function ConsumerLoanPage() {
  const [principal, setPrincipal] = useState(20000);
  const [months, setMonths] = useState(36);
  const [rate, setRate] = useState(18);
  const [commissionPct, setCommissionPct] = useState(0);
  const [commission, setCommission] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [other, setOther] = useState(0);

  const [showExtra, setShowExtra] = useState(false);
  const [erkenRejim, setErkenRejim] = useState<ErkenRejim>("muddət");

  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringAmount, setRecurringAmount] = useState(100);
  const [recurringFrom, setRecurringFrom] = useState(1);
  const [recurringTo, setRecurringTo] = useState<number | "">("");

  const [oneTimePayments, setOneTimePayments] = useState<OneTimePayment[]>([
    { id: 1, month: 1, amount: 0 },
  ]);
  const [penalty, setPenalty] = useState(0);

  const [showBgn, setShowBgn] = useState(false);
  const [bgnGelir, setBgnGelir] = useState(0);
  const [bgnMovcud, setBgnMovcud] = useState(0);

  const [showAllRows, setShowAllRows] = useState(false);

  const handleCommissionPctChange = (pct: number) => {
    setCommissionPct(pct);
    setCommission(Math.round((principal * pct) / 100));
  };
  const handleCommissionAmtChange = (amt: number) => {
    setCommission(amt);
    setCommissionPct(principal > 0 ? Math.round((amt / principal) * 1000) / 10 : 0);
  };

  const addOneTime = () => setOneTimePayments((p) => [...p, { id: Date.now(), month: 1, amount: 0 }]);
  const removeOneTime = (id: number) => setOneTimePayments((p) => p.filter((x) => x.id !== id));
  const updateOneTime = (id: number, field: "month" | "amount", value: number) =>
    setOneTimePayments((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const result = useMemo(() => {
    if (!principal || !months || !rate) return null;

    const basePayment = calcAnnuityPayment(principal, rate, months);
    const r = rate / 100 / 12;

    if (!showExtra) {
      const schedule: ScheduleRow[] = [];
      let balance = principal;
      for (let i = 1; i <= months; i++) {
        const interest = balance * r;
        const principalPart = basePayment - interest;
        balance = Math.max(0, balance - principalPart);
        schedule.push({ month: i, payment: basePayment, extra: 0, interest, principal: principalPart, balance });
        if (balance <= 0) break;
      }
      const totalPayment = basePayment * months + commission + insurance + other;
      return {
        firstPayment: basePayment,
        lastPayment: basePayment,
        totalPayment,
        interestCost: basePayment * months - principal,
        additionalCosts: commission + insurance + other,
        penaltyCost: 0,
        finalMonths: months,
        savings: 0,
        withExtra: false,
        erkenRejim,
        schedule,
      };
    }

    const toMonth = recurringTo === "" ? months : Number(recurringTo);
    let balance = principal;
    let totalPaid = 0;
    let totalInterest = 0;
    let totalPenalty = 0;
    let actualMonths = 0;
    let currentPayment = basePayment;
    let remainingMonths = months;
    const schedule: ScheduleRow[] = [];

    for (let i = 1; i <= months * 2; i++) {
      if (balance <= 0) break;
      actualMonths = i;

      const interest = balance * r;
      const schedPayment = Math.min(currentPayment, balance + interest);
      const principalPart = schedPayment - interest;
      totalInterest += interest;
      totalPaid += schedPayment;
      balance -= principalPart;
      remainingMonths = Math.max(1, remainingMonths - 1);

      let extra = 0;
      if (recurringEnabled && i >= recurringFrom && i <= toMonth) extra += recurringAmount;
      oneTimePayments.forEach((op) => { if (op.month === i) extra += op.amount; });

      let actualExtra = 0;
      if (extra > 0 && balance > 0) {
        actualExtra = Math.min(extra, balance);
        const pen = (actualExtra * penalty) / 100;
        totalPenalty += pen;
        totalPaid += actualExtra + pen;
        balance -= actualExtra;

        if (balance > 0 && erkenRejim === "odəniş" && remainingMonths > 0) {
          const newN = remainingMonths;
          currentPayment = (balance * r * Math.pow(1 + r, newN)) / (Math.pow(1 + r, newN) - 1);
        }
      }

      schedule.push({
        month: i,
        payment: schedPayment,
        extra: actualExtra,
        interest,
        principal: principalPart,
        balance: Math.max(0, balance),
      });

      if (balance <= 0) break;
    }

    const newTotalPayment = totalPaid + commission + insurance + other;
    const savings = Math.max(0, basePayment * months - totalPaid);

    return {
      firstPayment: basePayment,
      lastPayment: currentPayment,
      totalPayment: newTotalPayment,
      interestCost: totalInterest,
      additionalCosts: commission + insurance + other,
      penaltyCost: totalPenalty,
      finalMonths: actualMonths,
      savings,
      withExtra: true,
      erkenRejim,
      schedule,
    };
  }, [
    principal, months, rate, commission, insurance, other,
    showExtra, recurringEnabled, recurringAmount, recurringFrom, recurringTo,
    oneTimePayments, penalty, erkenRejim,
  ]);

  // FIFD — Faktiki İllik Faiz Dərəcəsi (APR). Binary search on monthly IRR.
  const fifd = useMemo(() => {
    if (!result || !principal || !months) return null;
    const pmt = result.firstPayment;
    const netPrincipal = principal - commission - insurance - other;
    if (netPrincipal <= 0) return null;
    let lo = 0, hi = 10;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      const pv = mid === 0 ? pmt * months : pmt * (1 - Math.pow(1 + mid, -months)) / mid;
      if (pv > netPrincipal) lo = mid; else hi = mid;
    }
    return ((lo + hi) / 2) * 12 * 100;
  }, [result, principal, months, commission, insurance, other]);

  const displayedRows = result?.schedule
    ? (showAllRows ? result.schedule : result.schedule.slice(0, 10))
    : [];

  const hasExtra = showExtra && (recurringEnabled || oneTimePayments.some((op) => op.amount > 0));

  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
            <ChevronRight size={14} />
            <Link href="/az/calculators" className="hover:text-blue-600">Kalkulyatorlar</Link>
            <ChevronRight size={14} />
            <span className="text-gray-600">İstehlak krediti</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">İstehlak krediti kalkulyatoru</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Left panel ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Kredit şərtləri */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Kredit şərtləri</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kredit məbləği, AZN</label>
                  <input type="number" min={0} className={inputClass} value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Müddət, ay</label>
                  <input type="number" min={1} max={120} className={inputClass} value={months}
                    onChange={(e) => setMonths(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">İllik faiz, %</label>
                  <input type="number" min={0} step={0.1} className={inputClass} value={rate}
                    onChange={(e) => setRate(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Komissiya, %</label>
                  <input type="number" min={0} max={100} step={0.1} className={inputClass} value={commissionPct}
                    onChange={(e) => handleCommissionPctChange(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sığorta, AZN</label>
                  <input type="number" min={0} className={inputClass} value={insurance}
                    onChange={(e) => setInsurance(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Digər xərclər, AZN</label>
                  <input type="number" min={0} className={inputClass} value={other}
                    onChange={(e) => setOther(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Əlavə ödənişlər */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className={`flex items-center justify-between ${showExtra ? "mb-1" : ""}`}>
                <div>
                  <h3 className="font-bold text-gray-900">Əlavə ödənişlər planlaşdırırsınız?</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Krediti daha tez bağlamaq və ya aylıq ödənişi azaltmaq üçün əlavə ödənişləri daxil edin.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowExtra(false)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${!showExtra ? "bg-gray-200 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}>
                    Xeyr
                  </button>
                  <button onClick={() => setShowExtra(true)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${showExtra ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-600"}`}>
                    Bəli
                  </button>
                </div>
              </div>

              {showExtra && (
                <div className="mt-5 space-y-5">
                  {/* Daimi əlavə ödəniş */}
                  <div className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <input type="checkbox" id="recurring" checked={recurringEnabled}
                        onChange={(e) => setRecurringEnabled(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                      <label htmlFor="recurring" className="font-semibold text-gray-800 text-sm cursor-pointer">
                        Daimi əlavə ödəniş istifadə edilsin?
                      </label>
                    </div>
                    {recurringEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Aylıq əlavə ödəniş məbləği</label>
                          <input type="number" min={0} className={inputClass} value={recurringAmount || ""}
                            onChange={(e) => setRecurringAmount(parseInt(e.target.value, 10) || 0)} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Hansı aydan başlasın</label>
                          <input type="number" min={1} max={months} className={inputClass} value={recurringFrom || ""}
                            onChange={(e) => setRecurringFrom(parseInt(e.target.value, 10) || 1)} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Nəyə qədər davam etsin</label>
                          <input type="number" min={recurringFrom} max={months} className={inputClass}
                            placeholder="Kredit bitənə qədər" value={recurringTo}
                            onChange={(e) => setRecurringTo(e.target.value === "" ? "" : Number(e.target.value))} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Birdəfəlik */}
                  <div className="border border-gray-100 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 text-sm mb-4">Birdəfəlik əlavə ödənişlər</h4>
                    <div className="space-y-3">
                      {oneTimePayments.map((op) => (
                        <div key={op.id} className="grid grid-cols-5 gap-3 items-end">
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Ödəniş ayı</label>
                            <input type="number" min={1} max={months} className={inputClass} value={op.month || ""}
                              onChange={(e) => updateOneTime(op.id, "month", parseInt(e.target.value, 10) || 1)} />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Məbləğ</label>
                            <input type="number" min={0} className={inputClass} value={op.amount || ""}
                              onChange={(e) => updateOneTime(op.id, "amount", parseInt(e.target.value, 10) || 0)} />
                          </div>
                          <button onClick={() => removeOneTime(op.id)}
                            className="h-10 flex items-center justify-center px-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={addOneTime}
                      className="mt-3 flex items-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                      <Plus size={16} /> Ödəniş əlavə et
                    </button>
                  </div>

                  {/* Kompensasiya */}
                  <div className="border border-gray-100 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 text-sm mb-3">Erkən ödəniş kompensasiyası</h4>
                    <div className="max-w-xs">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Kompensasiya faizi, %</label>
                      <select className={selectClass} value={penalty}
                        onChange={(e) => setPenalty(Number(e.target.value))}>
                        <option value={0}>0%</option>
                        <option value={1}>1%</option>
                        <option value={2}>2%</option>
                        <option value={3}>3%</option>
                        <option value={5}>5%</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Bəzi banklar erkən ödəniş məbləğinin kiçik faizini kompensasiya kimi tətbiq edə bilər.</p>
                  </div>

                  {/* Rejim */}
                  <div className="border border-blue-100 rounded-xl p-4 bg-blue-50">
                    <h4 className="font-semibold text-gray-800 text-sm mb-3">Əlavə ödənişdən sonra nə azalsın?</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { key: "muddət", icon: "⏱️", label: "Müddət azalsın", note: "Aylıq ödəniş eyni" },
                        { key: "odəniş", icon: "💸", label: "Aylıq ödəniş azalsın", note: "Müddət eyni qalır" },
                      ] as { key: ErkenRejim; icon: string; label: string; note: string }[]).map(({ key, icon, label, note }) => (
                        <button key={key} onClick={() => setErkenRejim(key)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                            erkenRejim === key
                              ? "border-blue-600 bg-white text-blue-700 shadow-sm"
                              : "border-transparent bg-white/60 text-gray-500 hover:bg-white"
                          }`}>
                          <span className="text-lg">{icon}</span>
                          <span className="text-center leading-tight">{label}</span>
                          <span className="text-xs font-normal text-gray-400 text-center">{note}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── Right panel ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              {result && (
                <>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-xs text-gray-500 font-medium mb-1">Aylıq ödəniş</p>
                    <p className="text-4xl font-bold text-gray-900 mb-5">{formatCurrency(result.firstPayment)}</p>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Toplam faiz</p>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(result.interestCost)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Ümumi ödəniş</p>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(result.totalPayment)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Müddət</p>
                        <p className="text-sm font-bold text-gray-900">{result.finalMonths} ay</p>
                      </div>
                    </div>

                    {result.withExtra && (
                      <>
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Əlavə ödənişlə</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                              <p className="text-xs text-gray-400 mb-1">Toplam faiz</p>
                              <p className="text-sm font-bold text-emerald-700">{formatCurrency(result.interestCost)}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                              <p className="text-xs text-gray-400 mb-1">Ümumi ödəniş</p>
                              <p className="text-sm font-bold text-emerald-700">{formatCurrency(result.totalPayment)}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                              <p className="text-xs text-gray-400 mb-1">Müddət</p>
                              <p className="text-sm font-bold text-emerald-700">{result.finalMonths} ay</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Fərq</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                              <p className="text-xs text-gray-400 mb-1">Faiz qənaəti</p>
                              <p className="text-sm font-bold text-blue-700">−{formatCurrency(result.savings)}</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                              <p className="text-xs text-gray-400 mb-1">Ümumi qənaət</p>
                              <p className="text-sm font-bold text-blue-700">−{formatCurrency(result.savings)}</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                              <p className="text-xs text-gray-400 mb-1">Müddət azalması</p>
                              <p className="text-sm font-bold text-blue-700">−{months - result.finalMonths} ay</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {(commission > 0 || insurance > 0 || other > 0 || result.penaltyCost > 0) && (
                      <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Əlavə xərclər</p>
                        {commission > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Komissiya</span>
                            <span className="text-gray-700 font-medium">{formatCurrency(commission)}</span>
                          </div>
                        )}
                        {insurance > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Sığorta</span>
                            <span className="text-gray-700 font-medium">{formatCurrency(insurance)}</span>
                          </div>
                        )}
                        {other > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Digər xərclər</span>
                            <span className="text-gray-700 font-medium">{formatCurrency(other)}</span>
                          </div>
                        )}
                        {result.penaltyCost > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Erkən ödəniş kompensasiyası</span>
                            <span className="text-gray-700 font-medium">{formatCurrency(result.penaltyCost)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-amber-700 font-semibold">FİFD — Faktiki İllik Faiz Dərəcəsi</p>
                      {fifd !== null && (
                        <p className="text-lg font-bold text-amber-800">{fifd.toFixed(2)}%</p>
                      )}
                    </div>
                    <p className="text-xs text-amber-600 leading-relaxed">
                      Kreditin bütün xərclərini (faiz, komissiya, sığorta) nəzərə alan real illik dəyər göstəricisidir. Banklar bu rəqəmi müqavilədə göstərməyə borcludur.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Ödəniş cədvəli ── */}
        {result && result.schedule.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Ödəniş cədvəli</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="pb-3 pr-4 font-medium">Ay</th>
                    <th className="pb-3 pr-4 font-medium">Aylıq ödəniş</th>
                    {hasExtra && <th className="pb-3 pr-4 font-medium">Əlavə ödəniş</th>}
                    {hasExtra && <th className="pb-3 pr-4 font-medium">Ümumi ödəniş</th>}
                    <th className="pb-3 pr-4 font-medium">Faiz hissəsi</th>
                    <th className="pb-3 pr-4 font-medium">Əsas borc</th>
                    <th className="pb-3 font-medium">Qalıq borc</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((row) => (
                    <tr key={row.month} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-4 font-medium text-gray-700">{row.month}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{formatCurrency(row.payment)}</td>
                      {hasExtra && <td className="py-2.5 pr-4 text-blue-600 font-medium">{row.extra > 0 ? formatCurrency(row.extra) : "—"}</td>}
                      {hasExtra && <td className="py-2.5 pr-4 text-gray-600">{formatCurrency(row.payment + row.extra)}</td>}
                      <td className="py-2.5 pr-4 text-orange-600">{formatCurrency(row.interest)}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{formatCurrency(row.principal)}</td>
                      <td className="py-2.5 text-gray-900 font-medium">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.schedule.length > 10 && (
              <button
                onClick={() => setShowAllRows(!showAllRows)}
                className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors"
              >
                <ChevronDown size={16} className={`transition-transform ${showAllRows ? "rotate-180" : ""}`} />
                {showAllRows ? "Yığ" : `Bütün cədvəli göstər (${result.schedule.length} ay)`}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
