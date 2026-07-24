"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Trash2, ChevronDown } from "lucide-react";
import { calcAnnuityPayment, solveMonthlyIRR } from "@/lib/calculators/annuity";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { SliderRow } from "@/components/ui/SliderRow";

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
  const [insurancePct, setInsurancePct] = useState(0);
  const [other, setOther] = useState(0);

  const [showExtra, setShowExtra] = useState(false);
  const [erkenRejim, setErkenRejim] = useState<ErkenRejim>("muddət");
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringAmount, setRecurringAmount] = useState(100);
  const [recurringFrom, setRecurringFrom] = useState(1);
  const [recurringTo, setRecurringTo] = useState<number | "">("");
  const [oneTimePayments, setOneTimePayments] = useState<OneTimePayment[]>([{ id: 1, month: 1, amount: 0 }]);
  const [penalty, setPenalty] = useState(0);
  const [showAllRows, setShowAllRows] = useState(false);

  const commission = Math.round((commissionPct / 100) * principal);
  const insurance = Math.round((insurancePct / 100) * principal);

  const addOneTime = () => setOneTimePayments((p) => [...p, { id: Date.now(), month: 1, amount: 0 }]);
  const removeOneTime = (id: number) => setOneTimePayments((p) => p.filter((x) => x.id !== id));
  const updateOneTime = (id: number, field: "month" | "amount", value: number) =>
    setOneTimePayments((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const baseMonthly = calcAnnuityPayment(principal, rate, months);

  const result = useMemo(() => {
    if (!principal || !months || !rate) return null;
    const r = rate / 100 / 12;

    if (!showExtra) {
      const schedule: ScheduleRow[] = [];
      let balance = principal;
      for (let i = 1; i <= months; i++) {
        const interest = balance * r;
        const principalPart = baseMonthly - interest;
        balance = Math.max(0, balance - principalPart);
        schedule.push({ month: i, payment: baseMonthly, extra: 0, interest, principal: principalPart, balance });
        if (balance <= 0) break;
      }
      return {
        firstPayment: baseMonthly,
        totalPayment: baseMonthly * months + commission + insurance + other,
        interestCost: baseMonthly * months - principal,
        additionalCosts: commission + insurance + other,
        penaltyCost: 0,
        finalMonths: months,
        savings: 0,
        withExtra: false,
        schedule,
      };
    }

    const toMonth = recurringTo === "" ? months : Number(recurringTo);
    let balance = principal;
    let totalPaid = 0;
    let totalInterest = 0;
    let totalPenalty = 0;
    let actualMonths = 0;
    let currentPayment = baseMonthly;
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
          currentPayment = (balance * r * Math.pow(1 + r, remainingMonths)) / (Math.pow(1 + r, remainingMonths) - 1);
        }
      }

      schedule.push({ month: i, payment: schedPayment, extra: actualExtra, interest, principal: principalPart, balance: Math.max(0, balance) });
      if (balance <= 0) break;
    }

    const savings = Math.max(0, baseMonthly * months - totalPaid);
    return {
      firstPayment: baseMonthly,
      totalPayment: totalPaid + commission + insurance + other,
      interestCost: totalInterest,
      additionalCosts: commission + insurance + other,
      penaltyCost: totalPenalty,
      finalMonths: actualMonths,
      savings,
      withExtra: true,
      schedule,
    };
  }, [principal, months, rate, commission, insurance, other, baseMonthly,
      showExtra, recurringEnabled, recurringAmount, recurringFrom, recurringTo,
      oneTimePayments, penalty, erkenRejim]);

  const fifd = useMemo(() => {
    if (!result || !principal || !months) return null;
    const pmt = result.firstPayment;
    const netPrincipal = principal - commission - insurance - other;
    if (netPrincipal <= 0) return null;
    const irr = solveMonthlyIRR(pmt, months, netPrincipal);
    return irr * 12 * 100;
  }, [result, principal, months, commission, insurance, other]);

  const ear = useMemo(() => {
    if (!principal || !months) return null;
    const netPrincipal = principal - commission - insurance - other;
    if (netPrincipal <= 0) return (Math.pow(1 + rate / 100 / 12, 12) - 1) * 100;
    const irr = solveMonthlyIRR(baseMonthly, months, netPrincipal);
    return (Math.pow(1 + irr, 12) - 1) * 100;
  }, [principal, months, baseMonthly, commission, insurance, other, rate]);


  const displayedRows = result?.schedule
    ? (showAllRows ? result.schedule : result.schedule.slice(0, 10))
    : [];
  const hasExtra = showExtra && (recurringEnabled || oneTimePayments.some((op) => op.amount > 0));

  const checkUrl = `/az/kredit-yoxlama?mebleq=${principal}&muddet=${months}&faiz=${rate}&nov=naqd`;

  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
            <ChevronRight size={14} />
            <Link href="/az/calculators" className="hover:text-blue-600">Kalkulyatorlar</Link>
            <ChevronRight size={14} />
            <span className="text-gray-600">İstehlak krediti</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">İstehlak krediti kalkulyatoru</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — sliders */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <SliderRow label="Kredit məbləği" value={principal} min={500} max={100000} step={1}
                format={(v) => `₼ ${formatNumber(v)}`} onChange={setPrincipal} unit="₼" />
              <SliderRow label="Kredit müddəti" value={months} min={3} max={360} step={1}
                format={(v) => `${v} ay`} onChange={setMonths} unit="ay" />
              <SliderRow label="İllik faiz dərəcəsi" value={rate} min={5} max={50} step={0.1}
                format={(v) => `${v}%`} onChange={setRate} unit="%" />
              <SliderRow label="Komissiya" value={commissionPct} min={0} max={10} step={0.25}
                format={(v) => v === 0 ? "0%  (yoxdur)" : `${v}%  (₼ ${formatNumber(Math.round((v / 100) * principal))})`}
                onChange={setCommissionPct} />
              <SliderRow label="Sığorta" value={insurancePct} min={0} max={5} step={0.25}
                format={(v) => v === 0 ? "0%  (yoxdur)" : `${v}%  (₼ ${formatNumber(Math.round((v / 100) * principal))})`}
                onChange={setInsurancePct} />
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Digər xərclər (₼)</label>
                <input type="number" min={0} className={inputClass} value={other || ""}
                  onChange={(e) => setOther(parseInt(e.target.value, 10) || 0)} />
              </div>
            </div>

            {/* Əlavə ödənişlər */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className={`flex items-center justify-between ${showExtra ? "mb-5" : ""}`}>
                <div>
                  <h3 className="font-bold text-gray-900">Əlavə ödənişlər planlaşdırırsınız?</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Krediti daha tez bağlamaq və ya aylıq ödənişi azaltmaq üçün.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowExtra(false)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${!showExtra ? "bg-gray-200 text-gray-800" : "text-gray-500 hover:text-gray-600"}`}>
                    Xeyr
                  </button>
                  <button onClick={() => setShowExtra(true)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${showExtra ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-600"}`}>
                    Bəli
                  </button>
                </div>
              </div>

              {showExtra && (
                <div className="space-y-5">
                  <div className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <input type="checkbox" id="rec-c" checked={recurringEnabled}
                        onChange={(e) => setRecurringEnabled(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                      <label htmlFor="rec-c" className="font-semibold text-gray-800 text-sm cursor-pointer">
                        Daimi əlavə ödəniş istifadə edilsin?
                      </label>
                    </div>
                    {recurringEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Aylıq əlavə məbləğ</label>
                          <input type="number" min={0} className={inputClass} value={recurringAmount || ""}
                            onChange={(e) => setRecurringAmount(parseInt(e.target.value, 10) || 0)} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Hansı aydan başlasın</label>
                          <input type="number" min={1} max={months} className={inputClass} value={recurringFrom || ""}
                            onChange={(e) => setRecurringFrom(parseInt(e.target.value, 10) || 0)} />
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

                  <div className="border border-gray-100 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 text-sm mb-4">Birdəfəlik əlavə ödənişlər</h4>
                    <div className="space-y-3">
                      {oneTimePayments.map((op) => (
                        <div key={op.id} className="grid grid-cols-5 gap-3 items-end">
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Ödəniş ayı</label>
                            <input type="number" min={1} max={months} className={inputClass} value={op.month || ""}
                              onChange={(e) => updateOneTime(op.id, "month", parseInt(e.target.value, 10) || 0)} />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Məbləğ (₼)</label>
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

                  <div className="border border-gray-100 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 text-sm mb-3">Erkən ödəniş kompensasiyası</h4>
                    <div className="max-w-xs">
                      <select className={selectClass} value={penalty} onChange={(e) => setPenalty(Number(e.target.value))}>
                        <option value={0}>0%</option>
                        <option value={1}>1%</option>
                        <option value={2}>2%</option>
                        <option value={3}>3%</option>
                        <option value={5}>5%</option>
                      </select>
                    </div>
                  </div>

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
                          <span className="text-xs font-normal text-gray-500">{note}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right — result card */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              {result && (
                <>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #2447F0, #4a66f3)" }} />
                    <div className="p-6">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-1">Aylıq ödəniş</p>
                      <p className="text-5xl font-extrabold text-gray-900 mb-1">{formatCurrency(result.firstPayment)}</p>
                      {(commissionPct > 0 || insurancePct > 0) && (
                        <p className="text-xs text-gray-500 mb-4">
                          + ₼ {formatNumber(commission + insurance)} birdəfəlik xərclər
                        </p>
                      )}
                      {commissionPct === 0 && insurancePct === 0 && <div className="mb-4" />}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">Toplam faiz</p>
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(result.interestCost)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">Ümumi ödəniş</p>
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(result.totalPayment)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">Müddət</p>
                          <p className="text-sm font-bold text-gray-900">{result.finalMonths} ay</p>
                        </div>
                      </div>

                      {result.withExtra && (
                        <>
                          <div className="mt-4 border-t border-gray-100 pt-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Əlavə ödənişlə</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                <p className="text-xs text-gray-500 mb-1">Toplam faiz</p>
                                <p className="text-sm font-bold text-emerald-700">{formatCurrency(result.interestCost)}</p>
                              </div>
                              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                <p className="text-xs text-gray-500 mb-1">Ümumi ödəniş</p>
                                <p className="text-sm font-bold text-emerald-700">{formatCurrency(result.totalPayment)}</p>
                              </div>
                              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                <p className="text-xs text-gray-500 mb-1">Müddət</p>
                                <p className="text-sm font-bold text-emerald-700">{result.finalMonths} ay</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Fərq</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                <p className="text-xs text-gray-500 mb-1">Faiz qənaəti</p>
                                <p className="text-sm font-bold text-blue-700">−{formatCurrency(result.savings)}</p>
                              </div>
                              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                <p className="text-xs text-gray-500 mb-1">Ümumi qənaət</p>
                                <p className="text-sm font-bold text-blue-700">−{formatCurrency(result.savings)}</p>
                              </div>
                              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                <p className="text-xs text-gray-500 mb-1">Müddət azalması</p>
                                <p className="text-sm font-bold text-blue-700">−{months - result.finalMonths} ay</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {(commission > 0 || insurance > 0 || other > 0 || result.penaltyCost > 0) && (
                        <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Əlavə xərclər</p>
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

                      <div className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Ümumi ödəniş</span>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(result.totalPayment)}</span>
                      </div>

                      <Link href={checkUrl}
                        className="mt-4 flex items-center justify-center w-full py-3 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #2447F0 0%, #1B36BE 100%)" }}>
                        Kredit yoxlamasına keç →
                      </Link>
                    </div>
                  </div>

                  {ear !== null && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-blue-700">EAR — Effektiv İllik Faiz</p>
                          <p className="text-xs text-blue-500 mt-0.5">Bütün xərcləri nəzərə alan real illik dəyər</p>
                        </div>
                        <p className="text-xl font-extrabold text-blue-700">{ear.toFixed(2)}%</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-amber-700 font-semibold">FİFD — Faktiki İllik Faiz Dərəcəsi</p>
                      {fifd !== null && <p className="text-lg font-bold text-amber-800">{fifd.toFixed(2)}%</p>}
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

        {/* Ödəniş cədvəli */}
        {result && result.schedule.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Ödəniş cədvəli</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="pb-3 pr-4 font-medium">Ay</th>
                    <th className="pb-3 pr-4 font-medium">Aylıq ödəniş</th>
                    {hasExtra && <th className="pb-3 pr-4 font-medium">Əlavə ödəniş</th>}
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
                      <td className="py-2.5 pr-4 text-orange-600">{formatCurrency(row.interest)}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{formatCurrency(row.principal)}</td>
                      <td className="py-2.5 text-gray-900 font-medium">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.schedule.length > 10 && (
              <button onClick={() => setShowAllRows(!showAllRows)}
                className="mt-4 flex items-center gap-2 py-2 text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors">
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
