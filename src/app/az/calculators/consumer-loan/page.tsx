"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { calcAnnuityPayment } from "@/lib/calculators/annuity";
import { calcEarlyRepayment } from "@/lib/calculators/earlyRepayment";
import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "@/components/shared/MetricCard";

const inputClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition";
const selectClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition appearance-none";

export default function ConsumerLoanPage() {
  const [principal, setPrincipal] = useState(10000);
  const [months, setMonths] = useState(24);
  const [rate, setRate] = useState(18);
  const [commission, setCommission] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [other, setOther] = useState(0);
  const [income, setIncome] = useState(1500);
  const [existingPayments, setExistingPayments] = useState(0);

  const [earlyAmount, setEarlyAmount] = useState(0);
  const [earlyMonth, setEarlyMonth] = useState(6);
  const [earlyStrategy, setEarlyStrategy] = useState<"reduce-term" | "reduce-payment">("reduce-term");

  const monthly = calcAnnuityPayment(principal, rate, months);
  const totalPayment = monthly * months + commission + insurance + other;
  const interestCost = monthly * months - principal;
  const additionalCosts = commission + insurance + other;
  const debtRatio = income > 0 ? ((existingPayments + monthly) / income) * 100 : 0;

  const earlyResult =
    earlyAmount > 0 && earlyMonth > 0 && earlyMonth < months
      ? calcEarlyRepayment(principal, rate, months, earlyAmount, earlyMonth, earlyStrategy)
      : null;

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
          {/* Form */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Kredit parametrləri</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kredit məbləği (₼)</label>
                  <input type="number" min={0} className={inputClass} value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kredit müddəti (ay)</label>
                  <input type="number" min={1} max={120} className={inputClass} value={months}
                    onChange={(e) => setMonths(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">İllik faiz dərəcəsi (%)</label>
                  <input type="number" min={0} step={0.1} className={inputClass} value={rate}
                    onChange={(e) => setRate(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Komissiya (₼)</label>
                  <input type="number" min={0} className={inputClass} value={commission}
                    onChange={(e) => setCommission(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sığorta (₼)</label>
                  <input type="number" min={0} className={inputClass} value={insurance}
                    onChange={(e) => setInsurance(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Digər xərclər (₼)</label>
                  <input type="number" min={0} className={inputClass} value={other}
                    onChange={(e) => setOther(Number(e.target.value))} />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mövcud aylıq kredit ödənişləri (₼)</label>
                  <input type="number" min={0} className={inputClass} value={existingPayments}
                    onChange={(e) => setExistingPayments(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Erkən ödəniş (isteğe bağlı)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ödəniş məbləği (₼)</label>
                  <input type="number" min={0} className={inputClass} value={earlyAmount}
                    onChange={(e) => setEarlyAmount(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ödəniş ayı</label>
                  <input type="number" min={1} max={months - 1} className={inputClass} value={earlyMonth}
                    onChange={(e) => setEarlyMonth(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Strategiya</label>
                  <select className={selectClass} value={earlyStrategy}
                    onChange={(e) => setEarlyStrategy(e.target.value as "reduce-term" | "reduce-payment")}>
                    <option value="reduce-term">Müddəti azalt</option>
                    <option value="reduce-payment">Aylıq ödənişi azalt</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Hesablama nəticəsi</h3>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="Aylıq ödəniş" value={formatCurrency(monthly)} variant="success" />
                  <MetricCard label="Ümumi ödəniş" value={formatCurrency(totalPayment)} />
                  <MetricCard label="Faiz xərci" value={formatCurrency(interestCost)} variant={interestCost > principal * 0.3 ? "warning" : "default"} />
                  <MetricCard label="Əlavə xərclər" value={formatCurrency(additionalCosts)} />
                  <MetricCard
                    label="Borc yükü"
                    value={`${debtRatio.toFixed(1)}%`}
                    variant={debtRatio > 50 ? "warning" : "default"}
                    className="col-span-2"
                  />
                </div>
              </div>

              {earlyResult && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Erkən ödənişdən qənaət</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard label="Ümumi qənaət" value={formatCurrency(earlyResult.savings)} variant="success" />
                    <MetricCard label="Yeni ümumi ödəniş" value={formatCurrency(earlyResult.newTotalPayment)} />
                    {earlyResult.newTermMonths && (
                      <MetricCard label="Yeni müddət" value={`${earlyResult.newTermMonths} ay`} className="col-span-2" />
                    )}
                    {earlyResult.newMonthlyPayment && (
                      <MetricCard label="Yeni aylıq ödəniş" value={formatCurrency(earlyResult.newMonthlyPayment)} className="col-span-2" />
                    )}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-700 leading-relaxed">
                  Hesablama annuitet üsulu ilə aparılır. Faktiki bank şərtləri fərqli ola bilər.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
