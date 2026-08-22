"use client";

import { useState } from "react";
import { calcAnnuityPayment, solveMonthlyIRR } from "@/lib/calculators/annuity";
import { simulateLoan, compareScenarios } from "@/lib/calculators/amortisation";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { NumberField, MonthField } from "@/components/ui/Field";
import { useDefaultStartMonth } from "@/lib/calculators/dates";
import { ExtraPayments, initialExtraConfig, hasExtra, toPlan } from "@/components/calculators/ExtraPayments";
import { LoanResult } from "@/components/calculators/LoanResult";
import { ScheduleTable } from "@/components/calculators/ScheduleTable";

const azn = (v: number) => `${formatNumber(v)} ₼`;
const MAX_LOAN = 500000; // банки не выдают ипотеку больше 500 000 ₼

export default function MortgagePage() {
  const [propertyValue, setPropertyValue] = useState("");
  const [downPct, setDownPct] = useState("20");
  const [years, setYears] = useState("20");
  const [rate, setRate] = useState("12");
  const [startDate, setStartDate] = useDefaultStartMonth();
  const [extra, setExtra] = useState(initialExtraConfig);

  const n = (s: string) => Math.max(0, parseFloat(s) || 0);
  const price = n(propertyValue);
  // Срок в ипотеке всегда обсуждают в годах, а не в 240 месяцах
  const months = Math.round(n(years) * 12);
  const r = n(rate);

  const downPayment = Math.round((n(downPct) / 100) * price);
  const rawLoan = Math.max(0, price - downPayment);
  const loanAmount = Math.min(MAX_LOAN, rawLoan);
  const loanCapped = rawLoan > MAX_LOAN;
  const baseMonthly = calcAnnuityPayment(loanAmount, r, months);

  const result = (() => {
    if (!loanAmount || !months || !r) return null;

    const base = simulateLoan(loanAmount, r, months);
    const plan = toPlan(extra, months, startDate);

    if (!plan) {
      return {
        firstPayment: base.monthlyPayment,
        current: { totalPayment: base.totalPaid, interestCost: base.totalInterest, months: base.months },
        base: null,
        comparison: null,
        extraPaid: 0,
        penaltyCost: 0,
        schedule: base.rows,
      };
    }

    const withExtra = simulateLoan(loanAmount, r, months, plan);
    return {
      firstPayment: withExtra.monthlyPayment,
      current: { totalPayment: withExtra.totalPaid, interestCost: withExtra.totalInterest, months: withExtra.months },
      base: { totalPayment: base.totalPaid, interestCost: base.totalInterest, months: base.months },
      comparison: compareScenarios(base, withExtra),
      extraPaid: withExtra.totalExtra,
      penaltyCost: withExtra.totalPenalty,
      schedule: withExtra.rows,
    };
  })();

  const ear = (() => {
    if (!loanAmount || !months) return null;
    return (Math.pow(1 + solveMonthlyIRR(baseMonthly, months, loanAmount), 12) - 1) * 100;
  })();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Əmlakın dəyəri"
                unit="₼"
                value={propertyValue}
                onChange={setPropertyValue}
                min={0}
                placeholder="150000"
                autoFocus
              />
              <NumberField label="İlkin ödəniş" unit="%" value={downPct} onChange={setDownPct} min={5} max={90} />
              <NumberField label="Müddət" unit="il" value={years} onChange={setYears} min={1} max={30} />
              <MonthField label="Kredit başlama tarixi" value={startDate} onChange={setStartDate} />
              <NumberField label="İllik faiz" unit="%" value={rate} onChange={setRate} min={1} max={30} step={0.1} />
            </div>

            {price > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <dl className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-gray-600">İlkin ödəniş</dt>
                  <dd className="text-sm font-bold tabular-nums text-ink">{azn(downPayment)}</dd>
                </dl>
                <dl className="mt-2 flex items-baseline justify-between gap-3">
                  <dt className="text-sm font-semibold text-gray-700">Kredit məbləği</dt>
                  <dd className="text-base font-extrabold tabular-nums text-ink">{formatCurrency(loanAmount)}</dd>
                </dl>
                {loanCapped && (
                  <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                    Maksimum ipoteka məbləği {azn(MAX_LOAN)} təşkil edir, banklar bundan çoxunu vermir. Qalan hissəni
                    ilkin ödəniş kimi ödəmək lazımdır.
                  </p>
                )}
              </div>
            )}
          </Card>

          <ExtraPayments months={months} startDate={startDate} value={extra} onChange={setExtra} />
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-2">
            {result ? (
              <LoanResult
                monthly={result.firstPayment}
                base={result.base}
                current={result.current}
                comparison={result.comparison}
                extraPaid={result.extraPaid}
                costs={[{ label: "Erkən ödəniş kompensasiyası", amount: result.penaltyCost }]}
                checkUrl={`/az/kredit-yoxlama?mebleq=${loanAmount}&muddet=${months}&faiz=${r}&nov=ipoteka`}
                ear={ear}
                fifd={null}
              />
            ) : (
              <Card>
                <p className="text-sm font-medium text-gray-600">Əmlakın dəyərini yazın.</p>
                <p className="mt-1 text-xs text-gray-500">Aylıq ödəniş dərhal burada hesablanacaq.</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {result && <ScheduleTable rows={result.schedule} showExtra={hasExtra(extra)} startDate={startDate} />}
    </div>
  );
}
