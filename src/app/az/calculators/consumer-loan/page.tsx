"use client";

import { useState } from "react";
import { calcAnnuityPayment, solveMonthlyIRR } from "@/lib/calculators/annuity";
import { simulateLoan, compareScenarios } from "@/lib/calculators/amortisation";
import { formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { NumberField, DateField } from "@/components/ui/Field";
import { useDefaultStartDate } from "@/lib/calculators/dates";
import { ExtraPayments, initialExtraConfig, hasExtra, toPlan } from "@/components/calculators/ExtraPayments";
import { LoanResult } from "@/components/calculators/LoanResult";
import { ScheduleTable } from "@/components/calculators/ScheduleTable";

const azn = (v: number) => `${formatNumber(v)} ₼`;

/* Ползунки заменены на компактные числовые поля с единицей измерения.

   У Mənzil в калькуляторах ползунков нет вовсе (они остались только на карте
   и в фильтрах), и по делу: ползунок занимает три строки, а попасть им в
   «12 000» невозможно без возни. Шесть параметров помещаются в три строки
   сетки вместо восемнадцати. */

export default function ConsumerLoanPage() {
  const [principal, setPrincipal] = useState("20000");
  const [months, setMonths] = useState("36");
  const [rate, setRate] = useState("18");
  const [commissionPct, setCommissionPct] = useState("0");
  const [insurancePct, setInsurancePct] = useState("0");
  const [other, setOther] = useState("0");
  const [startDate, setStartDate] = useDefaultStartDate();
  const [extra, setExtra] = useState(initialExtraConfig);

  const n = (s: string) => Math.max(0, parseFloat(s) || 0);
  const p = n(principal);
  const m = Math.round(n(months));
  const r = n(rate);

  const commission = Math.round((n(commissionPct) / 100) * p);
  const insurance = Math.round((n(insurancePct) / 100) * p);
  const otherCost = Math.round(n(other));
  const baseMonthly = calcAnnuityPayment(p, r, m);

  const result = (() => {
    if (!p || !m || !r) return null;

    const additionalCosts = commission + insurance + otherCost;
    // Базовый сценарий считаем ВСЕГДА: иначе сравнивать «до/после» нечем
    const base = simulateLoan(p, r, m);
    const plan = toPlan(extra, m, startDate);

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

    const withExtra = simulateLoan(p, r, m, plan);
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
  })();

  const fifd = (() => {
    if (!result || !p || !m) return null;
    const net = p - commission - insurance - otherCost;
    if (net <= 0) return null;
    return solveMonthlyIRR(result.firstPayment, m, net) * 12 * 100;
  })();

  const ear = (() => {
    if (!p || !m) return null;
    const net = p - commission - insurance - otherCost;
    if (net <= 0) return (Math.pow(1 + r / 100 / 12, 12) - 1) * 100;
    return (Math.pow(1 + solveMonthlyIRR(baseMonthly, m, net), 12) - 1) * 100;
  })();

  const oneOff = commission + insurance;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Kredit məbləği" unit="₼" value={principal} onChange={setPrincipal} min={0} max={100000} />
              <NumberField label="Müddət" unit="ay" value={months} onChange={setMonths} min={3} max={360} />
              <DateField label="Kredit başlama tarixi" value={startDate} onChange={setStartDate} />
              <NumberField label="İllik faiz" unit="%" value={rate} onChange={setRate} min={1} max={50} step={0.1} />
              <NumberField label="Komissiya" unit="%" value={commissionPct} onChange={setCommissionPct} min={0} max={10} step={0.25} />
              <NumberField label="Sığorta" unit="%" value={insurancePct} onChange={setInsurancePct} min={0} max={5} step={0.25} />
              <NumberField label="Digər xərclər" unit="₼" value={other} onChange={setOther} min={0} />
            </div>
            {oneOff > 0 && (
              <p className="mt-3 text-[11px] text-gray-500">
                Komissiya və sığorta birlikdə <strong className="tabular-nums text-ink">{azn(oneOff)}</strong> təşkil edir.
              </p>
            )}
          </Card>

          <ExtraPayments months={m} startDate={startDate} value={extra} onChange={setExtra} />
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-2">
            {result ? (
              <LoanResult
                monthly={result.firstPayment}
                oneOffNote={oneOff > 0 ? `Üstəlik ${azn(oneOff)} birdəfəlik xərc` : undefined}
                base={result.base}
                current={result.current}
                comparison={result.comparison}
                extraPaid={result.extraPaid}
                costs={[
                  { label: "Komissiya", amount: commission },
                  { label: "Sığorta", amount: insurance },
                  { label: "Digər xərclər", amount: otherCost },
                  { label: "Erkən ödəniş kompensasiyası", amount: result.penaltyCost },
                ]}
                checkUrl={`/az/kredit-yoxlama?mebleq=${Math.round(p)}&muddet=${m}&faiz=${r}&nov=naqd`}
                ear={ear}
                fifd={fifd}
              />
            ) : (
              <Card>
                <p className="text-sm font-medium text-gray-600">Kredit məbləğini və müddəti yazın.</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {result && <ScheduleTable rows={result.schedule} showExtra={hasExtra(extra)} startDate={startDate} />}
    </div>
  );
}
