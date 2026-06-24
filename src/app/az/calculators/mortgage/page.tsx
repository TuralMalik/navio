"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { calcAnnuityPayment } from "@/lib/calculators/annuity";
import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "@/components/shared/MetricCard";

const inputClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition";
const selectClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition appearance-none";

interface OneTimePayment {
  id: number;
  month: number;
  amount: number;
}

export default function MortgagePage() {
  const [propertyValue, setPropertyValue] = useState(100000);
  const [downPaymentPctInput, setDownPaymentPctInput] = useState(20);
  const [downPayment, setDownPayment] = useState(20000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(12);
  const [income, setIncome] = useState(2000);
  const [existingPayments, setExistingPayments] = useState(0);

  const [showExtra, setShowExtra] = useState(false);
  const [erkenRejim, setErkenRejim] = useState<"muddət" | "odəniş">("muddət");
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringAmount, setRecurringAmount] = useState(100);
  const [recurringFrom, setRecurringFrom] = useState(1);
  const [recurringTo, setRecurringTo] = useState<number | "">(months);
  const [oneTimePayments, setOneTimePayments] = useState<OneTimePayment[]>([
    { id: 1, month: 1, amount: 0 },
  ]);
  const [penalty, setPenalty] = useState(0);

  const handlePropertyChange = (val: number) => {
    setPropertyValue(val);
    setDownPayment(Math.round((downPaymentPctInput / 100) * val));
  };

  const handleDownPctChange = (pct: number) => {
    setDownPaymentPctInput(pct);
    setDownPayment(Math.round((pct / 100) * propertyValue));
  };

  const handleDownAmtChange = (amt: number) => {
    setDownPayment(amt);
    setDownPaymentPctInput(propertyValue > 0 ? Math.round((amt / propertyValue) * 1000) / 10 : 0);
  };

  const addOneTime = () => setOneTimePayments((p) => [...p, { id: Date.now(), month: 1, amount: 0 }]);
  const removeOneTime = (id: number) => setOneTimePayments((p) => p.filter((x) => x.id !== id));
  const updateOneTime = (id: number, field: "month" | "amount", value: number) =>
    setOneTimePayments((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const loanAmount = Math.max(0, propertyValue - downPayment);
  const downPaymentPct = propertyValue > 0 ? (downPayment / propertyValue) * 100 : 0;
  const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;
  const baseMonthly = calcAnnuityPayment(loanAmount, rate, months);
  const debtRatio = income > 0 ? ((existingPayments + baseMonthly) / income) * 100 : 0;
  const remaining = income - existingPayments - baseMonthly;

  const extraResult = useMemo(() => {
    if (!showExtra || !loanAmount || !months || !rate) return null;
    const r = rate / 100 / 12;
    let balance = loanAmount;
    let totalPaid = 0;
    let totalInterest = 0;
    let totalPenalty = 0;
    let actualMonths = 0;
    const toMonth = recurringTo === "" ? months : Number(recurringTo);
    let currentPayment = baseMonthly;
    let remainingMonths = months;

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
      if (balance <= 0) break;

      let extra = 0;
      if (recurringEnabled && i >= recurringFrom && i <= toMonth) extra += recurringAmount;
      oneTimePayments.forEach((op) => { if (op.month === i) extra += op.amount; });

      if (extra > 0) {
        const actualExtra = Math.min(extra, balance);
        const pen = (actualExtra * penalty) / 100;
        totalPenalty += pen;
        totalPaid += actualExtra + pen;
        balance -= actualExtra;
        if (balance <= 0) break;
        if (erkenRejim === "odəniş" && remainingMonths > 0 && balance > 0) {
          const newN = remainingMonths;
          currentPayment = (balance * r * Math.pow(1 + r, newN)) / (Math.pow(1 + r, newN) - 1);
        }
      }
      if (balance <= 0) break;
    }

    return {
      finalMonths: actualMonths,
      lastPayment: currentPayment,
      totalInterest,
      penaltyCost: totalPenalty,
      savings: Math.max(0, baseMonthly * months - totalPaid),
    };
  }, [showExtra, loanAmount, months, rate, baseMonthly, recurringEnabled, recurringAmount,
      recurringFrom, recurringTo, oneTimePayments, penalty, erkenRejim]);

  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
            <ChevronRight size={14} />
            <Link href="/az/calculators" className="hover:text-blue-600">Kalkulyatorlar</Link>
            <ChevronRight size={14} />
            <span className="text-gray-600">İpoteka</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">İpoteka kalkulyatoru</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Əmlak məlumatları</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Əmlakın dəyəri (₼)</label>
                  <input type="number" min={0} className={inputClass} value={propertyValue}
                    onChange={(e) => handlePropertyChange(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">İlkin ödəniş faizi (%)</label>
                  <input type="number" min={0} max={100} step={0.5} className={inputClass} value={downPaymentPctInput}
                    onChange={(e) => handleDownPctChange(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">İlkin ödəniş məbləği (₼)</label>
                  <input type="number" min={0} className={inputClass} value={downPayment}
                    onChange={(e) => handleDownAmtChange(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kredit müddəti (ay)</label>
                  <input type="number" min={1} max={360} className={inputClass} value={months}
                    onChange={(e) => setMonths(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">İllik faiz dərəcəsi (%)</label>
                  <input type="number" min={0} step={0.1} className={inputClass} value={rate}
                    onChange={(e) => setRate(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Gəlir məlumatları</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Aylıq xalis gəlir (₼)</label>
                  <input type="number" min={0} className={inputClass} value={income}
                    onChange={(e) => setIncome(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mövcud aylıq öhdəliklər (₼)</label>
                  <input type="number" min={0} className={inputClass} value={existingPayments}
                    onChange={(e) => setExistingPayments(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Early repayment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="font-bold text-gray-900">Əlavə ödənişlər planlaşdırırsınız?</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Krediti daha tez bağlamaq və ya aylıq ödənişi azaltmaq üçün.</p>
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
                  <div className="border border-blue-100 rounded-xl p-4 bg-blue-50">
                    <h4 className="font-semibold text-gray-800 text-sm mb-3">Əlavə ödəniş nəyi azaltsın?</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {(["muddət", "odəniş"] as const).map((mode) => (
                        <button key={mode} onClick={() => setErkenRejim(mode)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                            erkenRejim === mode
                              ? "border-blue-600 bg-white text-blue-700 shadow-sm"
                              : "border-transparent bg-white/60 text-gray-500 hover:bg-white"
                          }`}>
                          <span className="text-lg">{mode === "muddət" ? "⏱️" : "💸"}</span>
                          <span>{mode === "muddət" ? "Müddəti azalt" : "Aylıq ödənişi azalt"}</span>
                          <span className="text-xs font-normal text-gray-400">
                            {mode === "muddət" ? "Aylıq ödəniş eyni qalır" : "Müddət eyni qalır"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <input type="checkbox" id="rec-m" checked={recurringEnabled}
                        onChange={(e) => setRecurringEnabled(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                      <label htmlFor="rec-m" className="font-semibold text-gray-800 text-sm cursor-pointer">
                        Daimi əlavə ödəniş istifadə edilsin?
                      </label>
                    </div>
                    {recurringEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Aylıq əlavə məbləğ</label>
                          <input type="number" min={0} className={inputClass} value={recurringAmount}
                            onChange={(e) => setRecurringAmount(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Hansı aydan başlasın</label>
                          <input type="number" min={1} max={months} className={inputClass} value={recurringFrom}
                            onChange={(e) => setRecurringFrom(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Hansı aya qədər</label>
                          <input type="number" min={recurringFrom} max={months} className={inputClass}
                            placeholder="Sona qədər" value={recurringTo}
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
                            <input type="number" min={1} max={months} className={inputClass} value={op.month}
                              onChange={(e) => updateOneTime(op.id, "month", Number(e.target.value))} />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Məbləğ (₼)</label>
                            <input type="number" min={0} className={inputClass} value={op.amount}
                              onChange={(e) => updateOneTime(op.id, "amount", Number(e.target.value))} />
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">Kompensasiya faizi, %</label>
                      <select className={selectClass} value={penalty} onChange={(e) => setPenalty(Number(e.target.value))}>
                        <option value={0}>0%</option>
                        <option value={1}>1%</option>
                        <option value={2}>2%</option>
                        <option value={3}>3%</option>
                        <option value={5}>5%</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Hesablama nəticəsi</h3>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="Kredit məbləği" value={formatCurrency(loanAmount)} />
                  <MetricCard label="İlkin ödəniş faizi" value={`${downPaymentPct.toFixed(1)}%`} />
                  <MetricCard label="LTV" value={`${ltv.toFixed(1)}%`} variant={ltv > 80 ? "warning" : "default"} />
                  <MetricCard label="Aylıq ödəniş" value={formatCurrency(baseMonthly)} variant="success" />
                  <MetricCard label="Ümumi ödəniş" value={formatCurrency(baseMonthly * months)} />
                  <MetricCard label="Faiz xərci" value={formatCurrency(baseMonthly * months - loanAmount)} />
                  <MetricCard label="Borc yükü" value={`${debtRatio.toFixed(1)}%`} variant={debtRatio > 50 ? "warning" : "default"} />
                  <MetricCard label="Gəlirdən sonra qalan" value={formatCurrency(remaining)} variant={remaining < 0 ? "warning" : "default"} />
                </div>
              </div>

              {extraResult && (
                <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 space-y-2">
                  <p className="text-sm font-bold text-emerald-800">Əlavə ödəniş nəticəsi</p>
                  {erkenRejim === "muddət" ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Yeni müddət</span>
                        <span className="font-bold text-emerald-700">{extraResult.finalMonths} ay</span>
                      </div>
                      {extraResult.finalMonths < months && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Qısaldı</span>
                          <span className="font-bold text-emerald-700">−{months - extraResult.finalMonths} ay</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Son aylıq ödəniş</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(extraResult.lastPayment)}</span>
                    </div>
                  )}
                  {extraResult.savings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Qənaət</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(extraResult.savings)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-700 leading-relaxed">
                  LTV 80%-dən yüksəkdirsə, banklar əlavə sığorta və ya girov tələb edə bilər.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
