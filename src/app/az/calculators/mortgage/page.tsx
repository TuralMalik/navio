"use client";

import { useState, useMemo } from "react";
import { calcAnnuityPayment, solveMonthlyIRR } from "@/lib/calculators/annuity";
import { simulateLoan, compareScenarios } from "@/lib/calculators/amortisation";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { SliderRow } from "@/components/ui/SliderRow";
import { Card } from "@/components/ui/Card";
import { Field, inputClasses } from "@/components/ui/Field";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ExtraPayments, initialExtraConfig, hasExtra, toPlan } from "@/components/calculators/ExtraPayments";
import { LoanResult } from "@/components/calculators/LoanResult";
import { ScheduleTable } from "@/components/calculators/ScheduleTable";

const azn = (v: number) => `${formatNumber(v)} ₼`;
const MAX_LOAN = 500000; // банки не выдают ипотеку больше 500 000 ₼

export default function MortgagePage() {
  const [propertyValueStr, setPropertyValueStr] = useState("");
  const [valueTouched, setValueTouched] = useState(false);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(12);
  const [extra, setExtra] = useState(initialExtraConfig);

  const propertyValue = parseFloat(propertyValueStr) || 0;
  const downPayment = Math.round((downPaymentPct / 100) * propertyValue);
  const rawLoan = Math.max(0, propertyValue - downPayment);
  const loanAmount = Math.min(MAX_LOAN, rawLoan);
  const loanCapped = rawLoan > MAX_LOAN;
  const baseMonthly = calcAnnuityPayment(loanAmount, rate, months);

  const result = useMemo(() => {
    if (!loanAmount || !months || !rate) return null;

    // Базовый сценарий считаем всегда, чтобы сравнение «до/после» было настоящим
    const base = simulateLoan(loanAmount, rate, months);
    const plan = toPlan(extra, months);

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

    const withExtra = simulateLoan(loanAmount, rate, months, plan);
    return {
      firstPayment: withExtra.monthlyPayment,
      current: { totalPayment: withExtra.totalPaid, interestCost: withExtra.totalInterest, months: withExtra.months },
      base: { totalPayment: base.totalPaid, interestCost: base.totalInterest, months: base.months },
      comparison: compareScenarios(base, withExtra),
      extraPaid: withExtra.totalExtra,
      penaltyCost: withExtra.totalPenalty,
      schedule: withExtra.rows,
    };
  }, [loanAmount, rate, months, extra]);

  const ear = useMemo(() => {
    if (!loanAmount || !months) return null;
    const irr = solveMonthlyIRR(baseMonthly, months, loanAmount);
    return (Math.pow(1 + irr, 12) - 1) * 100;
  }, [loanAmount, months, baseMonthly]);

  // Ошибка появляется только после того, как поле трогали
  const valueError = valueTouched && propertyValue <= 0 ? "Əmlakın dəyərini daxil edin." : null;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Breadcrumbs
          trail={[
            { href: "/az", label: "Ana səhifə" },
            { href: "/az/calculators", label: "Kalkulyatorlar" },
          ]}
          current="İpoteka"
        />
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">İpoteka kalkulyatoru</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <Card className="space-y-5">
              <Field label="Əmlakın dəyəri" htmlFor="property-value" error={valueError} hint="Manatla">
                <input
                  id="property-value"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={propertyValueStr}
                  onChange={(e) => setPropertyValueStr(e.target.value)}
                  onBlur={() => setValueTouched(true)}
                  placeholder="150 000"
                  className={inputClasses(valueError)}
                />
              </Field>

              <SliderRow
                label="İlkin ödəniş"
                value={downPaymentPct}
                min={5}
                max={90}
                step={1}
                format={(v) => formatPercent(v, 0)}
                unit="%"
                onChange={setDownPaymentPct}
              />
              <SliderRow
                label="Kredit müddəti"
                value={months}
                min={12}
                max={360}
                step={12}
                format={(v) => `${Math.round(v / 12)} il`}
                unit="ay"
                onChange={setMonths}
              />
              <SliderRow
                label="İllik faiz dərəcəsi"
                value={rate}
                min={1}
                max={30}
                step={0.1}
                format={(v) => formatPercent(v)}
                unit="%"
                onChange={setRate}
              />

              <div className="border-t border-gray-200 pt-4">
                <dl className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm font-semibold text-gray-700">İlkin ödəniş</dt>
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
            </Card>

            <ExtraPayments months={months} value={extra} onChange={setExtra} />
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              {result ? (
                <LoanResult
                  monthly={result.firstPayment}
                  base={result.base}
                  current={result.current}
                  comparison={result.comparison}
                  extraPaid={result.extraPaid}
                  costs={[{ label: "Erkən ödəniş kompensasiyası", amount: result.penaltyCost }]}
                  checkUrl={`/az/kredit-yoxlama?mebleq=${loanAmount}&muddet=${months}&faiz=${rate}&nov=ipoteka`}
                  ear={ear}
                  fifd={null}
                />
              ) : (
                <Card>
                  <p className="text-sm font-medium text-gray-600">Əmlakın dəyərini daxil edin.</p>
                  <p className="mt-1 text-xs text-gray-500">Aylıq ödəniş dərhal burada hesablanacaq.</p>
                </Card>
              )}
            </div>
          </div>
        </div>

        {result && <ScheduleTable rows={result.schedule} showExtra={hasExtra(extra)} />}
      </div>
    </main>
  );
}
