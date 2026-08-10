"use client";

import { useState, useMemo } from "react";
import { calcAnnuityPayment, solveMonthlyIRR } from "@/lib/calculators/annuity";
import { simulateLoan, compareScenarios } from "@/lib/calculators/amortisation";
import { formatNumber, formatPercent } from "@/lib/utils";
import { SliderRow } from "@/components/ui/SliderRow";
import { Card } from "@/components/ui/Card";
import { Field, inputClasses } from "@/components/ui/Field";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ExtraPayments, initialExtraConfig, hasExtra, toPlan } from "@/components/calculators/ExtraPayments";
import { LoanResult } from "@/components/calculators/LoanResult";
import { ScheduleTable } from "@/components/calculators/ScheduleTable";

const azn = (v: number) => `${formatNumber(v)} ₼`;

export default function ConsumerLoanPage() {
  const [principal, setPrincipal] = useState(20000);
  const [months, setMonths] = useState(36);
  const [rate, setRate] = useState(18);
  const [commissionPct, setCommissionPct] = useState(0);
  const [insurancePct, setInsurancePct] = useState(0);
  const [other, setOther] = useState(0);
  const [extra, setExtra] = useState(initialExtraConfig);

  const commission = Math.round((commissionPct / 100) * principal);
  const insurance = Math.round((insurancePct / 100) * principal);
  const baseMonthly = calcAnnuityPayment(principal, rate, months);

  const result = useMemo(() => {
    if (!principal || !months || !rate) return null;

    const additionalCosts = commission + insurance + other;
    // Базовый сценарий считаем ВСЕГДА — иначе сравнивать «до/после» нечем
    const base = simulateLoan(principal, rate, months);
    const plan = toPlan(extra, months);

    if (!plan) {
      return {
        firstPayment: base.monthlyPayment,
        current: { totalPayment: base.totalPaid + additionalCosts, interestCost: base.totalInterest, months: base.months },
        base: null,
        comparison: null,
        extraPaid: 0,
        penaltyCost: 0,
        schedule: base.rows,
      };
    }

    const withExtra = simulateLoan(principal, rate, months, plan);
    return {
      firstPayment: withExtra.monthlyPayment,
      current: {
        totalPayment: withExtra.totalPaid + additionalCosts,
        interestCost: withExtra.totalInterest,
        months: withExtra.months,
      },
      base: { totalPayment: base.totalPaid + additionalCosts, interestCost: base.totalInterest, months: base.months },
      comparison: compareScenarios(base, withExtra),
      extraPaid: withExtra.totalExtra,
      penaltyCost: withExtra.totalPenalty,
      schedule: withExtra.rows,
    };
  }, [principal, months, rate, commission, insurance, other, extra]);

  const fifd = useMemo(() => {
    if (!result || !principal || !months) return null;
    const netPrincipal = principal - commission - insurance - other;
    if (netPrincipal <= 0) return null;
    return solveMonthlyIRR(result.firstPayment, months, netPrincipal) * 12 * 100;
  }, [result, principal, months, commission, insurance, other]);

  const ear = useMemo(() => {
    if (!principal || !months) return null;
    const netPrincipal = principal - commission - insurance - other;
    if (netPrincipal <= 0) return (Math.pow(1 + rate / 100 / 12, 12) - 1) * 100;
    const irr = solveMonthlyIRR(baseMonthly, months, netPrincipal);
    return (Math.pow(1 + irr, 12) - 1) * 100;
  }, [principal, months, baseMonthly, commission, insurance, other, rate]);

  const oneOff = commission + insurance;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Breadcrumbs
          trail={[
            { href: "/az", label: "Ana səhifə" },
            { href: "/az/calculators", label: "Kalkulyatorlar" },
          ]}
          current="İstehlak krediti"
        />
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          İstehlak krediti kalkulyatoru
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <Card className="space-y-5">
              <SliderRow
                label="Kredit məbləği"
                value={principal}
                min={500}
                max={100000}
                step={1}
                format={azn}
                unit="₼"
                onChange={setPrincipal}
              />
              <SliderRow
                label="Kredit müddəti"
                value={months}
                min={3}
                max={360}
                step={1}
                format={(v) => `${v} ay`}
                unit="ay"
                onChange={setMonths}
              />
              <SliderRow
                label="İllik faiz dərəcəsi"
                value={rate}
                min={5}
                max={50}
                step={0.1}
                format={(v) => formatPercent(v)}
                unit="%"
                onChange={setRate}
              />
              <SliderRow
                label="Komissiya"
                value={commissionPct}
                min={0}
                max={10}
                step={0.25}
                format={(v) => (v === 0 ? "yoxdur" : formatPercent(v, 2))}
                unit="%"
                onChange={setCommissionPct}
              />
              <SliderRow
                label="Sığorta"
                value={insurancePct}
                min={0}
                max={5}
                step={0.25}
                format={(v) => (v === 0 ? "yoxdur" : formatPercent(v, 2))}
                unit="%"
                onChange={setInsurancePct}
              />
              <Field label="Digər xərclər (₼)" htmlFor="other" className="border-t border-gray-200 pt-4">
                <input
                  id="other"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className={inputClasses()}
                  value={other || ""}
                  onChange={(e) => setOther(parseInt(e.target.value, 10) || 0)}
                />
              </Field>
            </Card>

            <ExtraPayments months={months} value={extra} onChange={setExtra} />
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              {result && (
                <LoanResult
                  monthly={result.firstPayment}
                  oneOffNote={oneOff > 0 ? `Əlavə olaraq ${azn(oneOff)} birdəfəlik xərc` : undefined}
                  base={result.base}
                  current={result.current}
                  comparison={result.comparison}
                  extraPaid={result.extraPaid}
                  costs={[
                    { label: "Komissiya", amount: commission },
                    { label: "Sığorta", amount: insurance },
                    { label: "Digər xərclər", amount: other },
                    { label: "Erkən ödəniş kompensasiyası", amount: result.penaltyCost },
                  ]}
                  checkUrl={`/az/kredit-yoxlama?mebleq=${principal}&muddet=${months}&faiz=${rate}&nov=naqd`}
                  ear={ear}
                  fifd={fifd}
                />
              )}
            </div>
          </div>
        </div>

        {result && <ScheduleTable rows={result.schedule} showExtra={hasExtra(extra)} />}
      </div>
    </main>
  );
}
