"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { calcAnnuityPayment, buildAmortizationSchedule } from "@/lib/calculators/annuity";
import { formatCurrency } from "@/lib/utils";

const inputClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition";
const selectClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition appearance-none";

interface OneTimePayment {
  id: number;
  month: number;
  amount: number;
}

export default function ConsumerLoanPage() {
  const [principal, setPrincipal] = useState(20000);
  const [months, setMonths] = useState(36);
  const [rate, setRate] = useState(18);
  const [commission, setCommission] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [other, setOther] = useState(0);

  const [showExtra, setShowExtra] = useState(false);

  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringAmount, setRecurringAmount] = useState(100);
  const [recurringFrom, setRecurringFrom] = useState(1);
  const [recurringTo, setRecurringTo] = useState<number | "">(months);

  const [oneTimePayments, setOneTimePayments] = useState<OneTimePayment[]>([
    { id: 1, month: 1, amount: 100 },
  ]);

  const [penalty, setPenalty] = useState(0);

  const addOneTime = () => {
    setOneTimePayments((prev) => [
      ...prev,
      { id: Date.now(), month: 1, amount: 0 },
    ]);
  };

  const removeOneTime = (id: number) => {
    setOneTimePayments((prev) => prev.filter((p) => p.id !== id));
  };

  const updateOneTime = (id: number, field: "month" | "amount", value: number) => {
    setOneTimePayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const result = useMemo(() => {
    if (!principal || !months || !rate) return null;

    const basePayment = calcAnnuityPayment(principal, rate, months);
    buildAmortizationSchedule(principal, rate, months);

    if (!showExtra) {
      const totalPayment = basePayment * months + commission + insurance + other;
      const interestCost = basePayment * months - principal;
      return {
        firstPayment: basePayment,
        totalPayment,
        interestCost,
        additionalCosts: commission + insurance + other,
        penaltyCost: 0,
        finalMonths: months,
        savings: 0,
        withExtra: false,
      };
    }

    const r = rate / 100 / 12;
    let balance = principal;
    let totalPaid = 0;
    let totalInterest = 0;
    let totalPenalty = 0;
    let actualMonths = 0;
    const toMonth = recurringTo === "" ? months : Number(recurringTo);

    for (let i = 1; i <= months; i++) {
      if (balance <= 0) break;
      actualMonths = i;

      const interest = balance * r;
      const schedPayment = Math.min(basePayment, balance + interest);
      const principalPart = schedPayment - interest;

      totalInterest += interest;
      totalPaid += schedPayment;
      balance -= principalPart;

      if (balance <= 0) break;

      let extra = 0;
      if (recurringEnabled && i >= recurringFrom && i <= toMonth) {
        extra += recurringAmount;
      }
      oneTimePayments.forEach((op) => {
        if (op.month === i) extra += op.amount;
      });

      if (extra > 0) {
        const actualExtra = Math.min(extra, balance);
        const pen = (actualExtra * penalty) / 100;
        totalPenalty += pen;
        totalPaid += actualExtra + pen;
        balance -= actualExtra;
      }

      if (balance <= 0) break;
    }

    const baseTotalPayment = basePayment * months;
    const newTotalPayment = totalPaid + commission + insurance + other;
    const savings = baseTotalPayment - totalPaid;

    return {
      firstPayment: basePayment,
      totalPayment: newTotalPayment,
      interestCost: totalInterest,
      additionalCosts: commission + insurance + other,
      penaltyCost: totalPenalty,
      finalMonths: actualMonths,
      savings: Math.max(0, savings),
      withExtra: true,
    };
  }, [
    principal, months, rate, commission, insurance, other,
    showExtra, recurringEnabled, recurringAmount, recurringFrom, recurringTo,
    oneTimePayments, penalty,
  ]);

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
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Kredit parametrləri</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kredit məbləği, AZN</label>
                  <input type="number" min={0} className={inputClass} value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kredit müddəti, ay</label>
                  <input type="number" min={1} max={120} className={inputClass} value={months}
                    onChange={(e) => setMonths(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">İllik faiz dərəcəsi, %</label>
                  <input type="number" min={0} step={0.1} className={inputClass} value={rate}
                    onChange={(e) => setRate(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Komissiya, AZN</label>
                  <input type="number" min={0} className={inputClass} value={commission}
                    onChange={(e) => setCommission(Number(e.target.value))} />
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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="font-bold text-gray-900">Əlavə ödənişlər planlaşdırırsınız?</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Krediti daha tez bağlamaq və ya aylıq ödənişi azaltmaq üçün əlavə ödənişləri daxil edin.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowExtra(false)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${!showExtra ? "bg-gray-200 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    Xeyr
                  </button>
                  <button
                    onClick={() => setShowExtra(true)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${showExtra ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    Bəli
                  </button>
                </div>
              </div>

              {showExtra && (
                <div className="mt-5 space-y-5">
                  <div className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="recurring"
                        checked={recurringEnabled}
                        onChange={(e) => setRecurringEnabled(e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <label htmlFor="recurring" className="font-semibold text-gray-800 text-sm cursor-pointer">
                        Daimi əlavə ödəniş istifadə edilsin?
                      </label>
                    </div>
                    {recurringEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Aylıq əlavə ödəniş məbləği</label>
                          <input type="number" min={0} className={inputClass} value={recurringAmount}
                            onChange={(e) => setRecurringAmount(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Hansı aydan başlasın</label>
                          <input type="number" min={1} max={months} className={inputClass} value={recurringFrom}
                            onChange={(e) => setRecurringFrom(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Hansı aya qədər davam etsin</label>
                          <input type="number" min={recurringFrom} max={months} className={inputClass}
                            placeholder="Kredit bitənə qədərsə, boş saxlayın"
                            value={recurringTo}
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
                            <label className="block text-xs font-medium text-gray-600 mb-1">Ödəniş məbləği</label>
                            <input type="number" min={0} className={inputClass} value={op.amount}
                              onChange={(e) => updateOneTime(op.id, "amount", Number(e.target.value))} />
                          </div>
                          <button
                            onClick={() => removeOneTime(op.id)}
                            className="h-10 flex items-center justify-center px-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addOneTime}
                      className="mt-3 flex items-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                    >
                      <Plus size={16} />
                      Ödəniş əlavə et
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
                    <p className="text-xs text-gray-400 mt-2">Bəzi banklar erkən ödəniş məbləğinin kiçik faizini kompensasiya kimi tətbiq edə bilər.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              {result && (
                <>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-xs text-gray-500 font-medium mb-1">İlk aylıq ödəniş</p>
                    <p className="text-4xl font-bold text-gray-900 mb-5">
                      {formatCurrency(result.firstPayment)}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Yekun müddət</p>
                        <p className="text-xl font-bold text-gray-900">{result.finalMonths} ay</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Artıq ödəniş</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(result.interestCost)}</p>
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Ümumi ödəniş</p>
                      <p className="text-2xl font-bold text-white mb-4">{formatCurrency(result.totalPayment)}</p>
                      <div className="space-y-2">
                        {[
                          { label: "Faizlər", value: result.interestCost },
                          { label: "Komissiya məbləği", value: commission },
                          { label: "Sığorta məbləği", value: insurance },
                          { label: "Digər xərclər", value: other },
                          { label: "Erkən ödəniş kompensasiyası", value: result.penaltyCost },
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between text-sm">
                            <span className="text-gray-400">{row.label}</span>
                            <span className="text-white font-medium">{formatCurrency(row.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Bu kredit üzrə aylıq ödənişiniz <strong>{formatCurrency(result.firstPayment)}</strong> olacaq.
                      Kreditin sonunda faiz xərcləri <strong>{formatCurrency(result.interestCost)}</strong> təşkil edəcək.
                    </p>
                    {result.savings > 0 && (
                      <p className="text-xs text-emerald-700 leading-relaxed mt-2 font-semibold">
                        Əlavə ödənişlər sayəsində təxminən {formatCurrency(result.savings)} qənaət edəcəksiniz.
                      </p>
                    )}
                  </div>

                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-xs text-amber-700 leading-relaxed font-semibold">FİFD BARƏDƏ</p>
                    <p className="text-xs text-amber-600 leading-relaxed mt-1">
                      FİFD kreditin ümumi dəyərini göstərən informasiya göstəricisidir. Real bank təklifi komissiya, sığorta və digər şərtlərə görə fərqlənə bilər.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
