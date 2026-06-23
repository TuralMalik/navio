"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { calcAnnuityPayment } from "@/lib/calculators/annuity";
import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "@/components/shared/MetricCard";

const inputClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition";
const selectClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition appearance-none";

export default function AutoLoanPage() {
  const [carPrice, setCarPrice] = useState(30000);
  const [carType, setCarType] = useState("passenger");
  const [isNew, setIsNew] = useState("new");
  const [carAge, setCarAge] = useState(0);
  const [downPayment, setDownPayment] = useState(6000);
  const [months, setMonths] = useState(60);
  const [rate, setRate] = useState(15);
  const [income, setIncome] = useState(1500);
  const [existingPayments, setExistingPayments] = useState(0);

  const loanAmount = Math.max(0, carPrice - downPayment);
  const downPaymentPct = carPrice > 0 ? (downPayment / carPrice) * 100 : 0;
  const ltv = carPrice > 0 ? (loanAmount / carPrice) * 100 : 0;
  const monthly = calcAnnuityPayment(loanAmount, rate, months);
  const totalPayment = monthly * months;
  const interestCost = totalPayment - loanAmount;
  const debtRatio = income > 0 ? ((existingPayments + monthly) / income) * 100 : 0;
  const remaining = income - existingPayments - monthly;

  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
            <ChevronRight size={14} />
            <Link href="/az/calculators" className="hover:text-blue-600">Kalkulyatorlar</Link>
            <ChevronRight size={14} />
            <span className="text-gray-600">Avtokredit</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Avtokredit kalkulyatoru</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Avtomobil məlumatları</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Avtomobilin qiyməti (₼)</label>
                  <input type="number" min={0} className={inputClass} value={carPrice}
                    onChange={(e) => setCarPrice(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Avtomobil tipi</label>
                  <select className={selectClass} value={carType} onChange={(e) => setCarType(e.target.value)}>
                    <option value="passenger">Minik avtomobili</option>
                    <option value="suv">SUV / Krossover</option>
                    <option value="commercial">Kommersiya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni və ya işlənmiş</label>
                  <select className={selectClass} value={isNew} onChange={(e) => setIsNew(e.target.value)}>
                    <option value="new">Yeni</option>
                    <option value="used">İşlənmiş</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Avtomobilin yaşı (il)</label>
                  <input type="number" min={0} max={30} className={inputClass} value={carAge}
                    onChange={(e) => setCarAge(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">İlkin ödəniş (₼)</label>
                  <input type="number" min={0} className={inputClass} value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kredit müddəti (ay)</label>
                  <input type="number" min={1} max={84} className={inputClass} value={months}
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
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Hesablama nəticəsi</h3>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="Kredit məbləği" value={formatCurrency(loanAmount)} />
                  <MetricCard label="İlkin ödəniş faizi" value={`${downPaymentPct.toFixed(1)}%`} />
                  <MetricCard label="LTV" value={`${ltv.toFixed(1)}%`} variant={ltv > 80 ? "warning" : "default"} />
                  <MetricCard label="Aylıq ödəniş" value={formatCurrency(monthly)} variant="success" />
                  <MetricCard label="Ümumi ödəniş" value={formatCurrency(totalPayment)} />
                  <MetricCard label="Faiz xərci" value={formatCurrency(interestCost)} />
                  <MetricCard label="Borc yükü" value={`${debtRatio.toFixed(1)}%`} variant={debtRatio > 50 ? "warning" : "default"} />
                  <MetricCard label="Gəlirdən sonra qalan" value={formatCurrency(remaining)} variant={remaining < 0 ? "warning" : "default"} />
                </div>
              </div>
              {isNew === "used" && carAge > 10 && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    İşlənmiş avtomobillər üçün yaş məhdudiyyəti bankdan banka dəyişir. 10 ildən köhnə
                    nəqliyyat vasitələri üçün banklar fərqli şərtlər qoya bilər.
                  </p>
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
