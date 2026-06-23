"use client";

import { useState } from "react";
import { runCreditCheck } from "@/lib/credit-check/calculations";
import type { CreditCheckInput } from "@/lib/credit-check/types";
import { ResultGauge } from "@/components/shared/ResultGauge";
import { FactorRow } from "@/components/shared/FactorRow";
import { WarningCard } from "@/components/shared/WarningCard";
import { MetricCard } from "@/components/shared/MetricCard";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, ChevronRight, Info } from "lucide-react";
import Link from "next/link";

const initialInput: CreditCheckInput = {
  monthlyIncome: 0,
  employmentStatus: "daimi",
  workExperience: "gt3y",
  existingMonthlyPayments: 0,
  activeCreditLineLimit: 0,
  currentDelinquencyDays: 0,
  maxDelinquencyLast6Months: 0,
  loanType: "istehlak",
  requestedAmount: 0,
  loanTermMonths: 24,
  estimatedInterestRate: 18,
  age: 30,
  maritalStatus: "subay",
};

const categoryLabels: Record<string, string> = {
  "cox-yaxshi": "Çox yaxşı",
  yaxshi: "Yaxşı",
  orta: "Orta",
  zeif: "Zəif",
};

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-900 mb-5 text-base">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white transition";

const selectClass =
  "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white transition appearance-none";

export default function CreditCheckPage() {
  const [form, setForm] = useState<CreditCheckInput>(initialInput);
  const [result, setResult] = useState<ReturnType<typeof runCreditCheck> | null>(null);

  const set = (k: keyof CreditCheckInput, v: string | number) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(runCreditCheck(form));
  };

  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
            <ChevronRight size={14} />
            <span className="text-gray-600">Kredit yoxlaması</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">İlkin kredit yoxlaması</h1>
          <p className="text-gray-500 mt-1 text-sm max-w-xl">
            Maliyyə məlumatlarınızı daxil edin. Nəticə yalnız məlumat xarakteri daşıyır.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form — 3 columns */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">

            {/* Section 1 */}
            <FormSection title="Gəlir və məşğulluq">
              <Field label="Aylıq xalis gəlir (₼)">
                <input type="number" min={0} className={inputClass} placeholder="Məs: 1200"
                  value={form.monthlyIncome || ""}
                  onChange={(e) => set("monthlyIncome", Number(e.target.value))} />
              </Field>
              <Field label="İş statusu">
                <select className={selectClass} value={form.employmentStatus}
                  onChange={(e) => set("employmentStatus", e.target.value as CreditCheckInput["employmentStatus"])}>
                  <option value="daimi">Daimi işçi</option>
                  <option value="ferdi">Fərdi sahibkar</option>
                  <option value="muvevqqeti">Müvəqqəti işçi</option>
                  <option value="islemirm">İşləmirəm</option>
                  <option value="diger">Digər</option>
                </select>
              </Field>
              <Field label="Cari iş yerində staj">
                <select className={selectClass} value={form.workExperience}
                  onChange={(e) => set("workExperience", e.target.value as CreditCheckInput["workExperience"])}>
                  <option value="lt3m">3 aydan az</option>
                  <option value="3to6m">3–6 ay</option>
                  <option value="6to12m">6–12 ay</option>
                  <option value="1to3y">1–3 il</option>
                  <option value="gt3y">3 ildən çox</option>
                </select>
              </Field>
            </FormSection>

            {/* Section 2 */}
            <FormSection title="Mövcud öhdəliklər">
              <Field label="Mövcud aylıq kredit ödənişləri (₼)">
                <input type="number" min={0} className={inputClass} placeholder="0"
                  value={form.existingMonthlyPayments || ""}
                  onChange={(e) => set("existingMonthlyPayments", Number(e.target.value))} />
              </Field>
              <Field label="Aktiv kredit xətlərinin ümumi limiti (₼)">
                <input type="number" min={0} className={inputClass} placeholder="0"
                  value={form.activeCreditLineLimit || ""}
                  onChange={(e) => set("activeCreditLineLimit", Number(e.target.value))} />
              </Field>
            </FormSection>

            {/* Section 3 */}
            <FormSection title="Gecikmə məlumatları">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 text-xs text-blue-700 border border-blue-100 mb-2">
                <Info size={14} className="shrink-0 mt-0.5" />
                Gecikmə məlumatları yalnız kredit profilinizə təsir edir. Hard-stop şərt deyil.
              </div>
              <Field label="Cari gecikmə günü">
                <input type="number" min={0} className={inputClass} placeholder="0"
                  value={form.currentDelinquencyDays || ""}
                  onChange={(e) => set("currentDelinquencyDays", Number(e.target.value))} />
              </Field>
              <Field label="Son 6 ayda maksimal gecikmə günü">
                <input type="number" min={0} className={inputClass} placeholder="0"
                  value={form.maxDelinquencyLast6Months || ""}
                  onChange={(e) => set("maxDelinquencyLast6Months", Number(e.target.value))} />
              </Field>
            </FormSection>

            {/* Section 4 */}
            <FormSection title="Yeni kredit">
              <Field label="Kredit növü">
                <select className={selectClass} value={form.loanType}
                  onChange={(e) => set("loanType", e.target.value as CreditCheckInput["loanType"])}>
                  <option value="istehlak">İstehlak krediti</option>
                  <option value="ipoteka">İpoteka</option>
                  <option value="avtokredit">Avtokredit</option>
                  <option value="kredit-xetti">Kredit xətti</option>
                </select>
              </Field>
              <Field label="İstədiyiniz kredit məbləği (₼)">
                <input type="number" min={0} className={inputClass} placeholder="Məs: 10000"
                  value={form.requestedAmount || ""}
                  onChange={(e) => set("requestedAmount", Number(e.target.value))} />
              </Field>
              <Field label="Kredit müddəti (ay)">
                <input type="number" min={1} max={360} className={inputClass} placeholder="24"
                  value={form.loanTermMonths || ""}
                  onChange={(e) => set("loanTermMonths", Number(e.target.value))} />
              </Field>
              <Field label="Təxmini illik faiz dərəcəsi (%)">
                <input type="number" min={0} max={100} step={0.1} className={inputClass} placeholder="18"
                  value={form.estimatedInterestRate || ""}
                  onChange={(e) => set("estimatedInterestRate", Number(e.target.value))} />
              </Field>
            </FormSection>

            {/* Section 5 */}
            <FormSection title="Şəxsi məlumatlar">
              <Field label="Yaş">
                <input type="number" min={16} max={80} className={inputClass} placeholder="30"
                  value={form.age || ""}
                  onChange={(e) => set("age", Number(e.target.value))} />
              </Field>
              <Field label="Ailə vəziyyəti">
                <select className={selectClass} value={form.maritalStatus}
                  onChange={(e) => set("maritalStatus", e.target.value as CreditCheckInput["maritalStatus"])}>
                  <option value="subay">Subay</option>
                  <option value="evli">Evli</option>
                  <option value="diger">Digər</option>
                </select>
              </Field>
            </FormSection>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-white text-sm shadow-md transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b5fc0 100%)" }}
            >
              İlkin yoxlamanı başlat
            </button>
          </form>

          {/* Result panel — 2 columns, sticky */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              {!result ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <Info size={28} className="text-blue-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Nəticəni görün</h3>
                  <p className="text-sm text-gray-400">
                    Məlumatları doldurun və yoxlamanı başladın.
                  </p>
                </div>
              ) : (
                <>
                  {/* Hard stops */}
                  {result.hardStops.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-500" />
                        Əsas məhdudiyyətlər
                      </h3>
                      <div className="space-y-3">
                        {result.hardStops.map((hs, i) => (
                          <WarningCard key={i} title={hs.label} detail={hs.detail} metrics={hs.metrics} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Score */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Kredit profili</h3>
                    <div className="flex justify-center mb-4">
                      <ResultGauge
                        score={result.score}
                        category={result.scoreCategory}
                        categoryLabel={categoryLabels[result.scoreCategory]}
                      />
                    </div>
                    <div className="space-y-1">
                      {result.scoreFactors.map((f) => (
                        <FactorRow key={f.label} label={f.label} description={f.description} status={f.status} />
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Əsas göstəricilər</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <MetricCard
                        label="Cari borc yükü"
                        value={`${result.currentDebtRatio.toFixed(1)}%`}
                        variant={result.currentDebtRatio > 50 ? "warning" : "default"}
                      />
                      <MetricCard
                        label="Yeni kreditdən sonra"
                        value={`${result.newDebtRatio.toFixed(1)}%`}
                        variant={result.newDebtRatio > 60 ? "warning" : "default"}
                      />
                      <MetricCard
                        label="Təxmini aylıq ödəniş"
                        value={formatCurrency(result.estimatedMonthlyPayment)}
                      />
                      <MetricCard
                        label="Gəlirdən sonra qalan"
                        value={formatCurrency(result.remainingAfterLoan)}
                        variant={result.remainingAfterLoan < 0 ? "warning" : "default"}
                      />
                    </div>
                  </div>

                  {/* Positive / Risk / Recommendations */}
                  {result.positiveFactors.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        Müsbət göstəricilər
                      </h3>
                      <ul className="space-y-2">
                        {result.positiveFactors.map((f) => (
                          <li key={f} className="text-sm text-gray-600 flex gap-2">
                            <span className="text-emerald-400 shrink-0">✓</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.riskFactors.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" />
                        Diqqət edilməli göstəricilər
                      </h3>
                      <ul className="space-y-2">
                        {result.riskFactors.map((f) => (
                          <li key={f} className="text-sm text-gray-600 flex gap-2">
                            <span className="text-amber-400 shrink-0">!</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Tövsiyələr</h3>
                    <ul className="space-y-2">
                      {result.recommendations.map((r) => (
                        <li key={r} className="text-sm text-gray-600 flex gap-2">
                          <ChevronRight size={14} className="text-blue-400 shrink-0 mt-0.5" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-xs text-gray-400 text-center leading-relaxed px-2">
                    Bu nəticə məlumat xarakteri daşıyır. Kredit qərarını yalnız bank qəbul edir.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
