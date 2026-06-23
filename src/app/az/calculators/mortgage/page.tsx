"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { calcAnnuityPayment } from "@/lib/calculators/annuity";
import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "@/components/shared/MetricCard";

const inputClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition";

export default function MortgagePage() {
  const [propertyValue, setPropertyValue] = useState(100000);
  const [downPayment, setDownPayment] = useState(20000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(12);
  const [income, setIncome] = useState(2000);
  const [existingPayments, setExistingPayments] = useState(0);

  const loanAmount = Math.max(0, propertyValue - downPayment);
  const downPaymentPct = propertyValue > 0 ? (downPayment / propertyValue) * 100 : 0;
  const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;
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
                    onChange={(e) => setPropertyValue(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">İlkin ödəniş (₼)</label>
                  <input type="number" min={0} className={inputClass} value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))} />
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
