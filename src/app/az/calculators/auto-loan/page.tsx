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

/* Переключатель типа кузова («Elektrik / Hibrid / Digər») убран.

   Он ни на что не влиял: значение никуда не передавалось и ни в одну формулу
   не входило. Вдобавок начальное состояние было "passenger", которого нет
   среди вариантов, поэтому при открытии страницы не подсвечивался ни один.
   Сделать его рабочим значило бы придумать разные ставки по типу двигателя,
   а выдуманные числа на кредитном калькуляторе недопустимы.

   «Yeni / İşlənmiş» оставлен: он показывает реальное предупреждение про
   ограничения банков по возрасту авто. */

export default function AutoLoanPage() {
  const [carPrice, setCarPrice] = useState("");
  const [isNew, setIsNew] = useState<"new" | "used">("new");
  const [downPct, setDownPct] = useState("20");
  const [months, setMonths] = useState("60");
  const [rate, setRate] = useState("15");
  const [commissionPct, setCommissionPct] = useState("0");
  const [startDate, setStartDate] = useDefaultStartMonth();
  const [extra, setExtra] = useState(initialExtraConfig);

  const n = (s: string) => Math.max(0, parseFloat(s) || 0);
  const price = n(carPrice);
  const m = Math.round(n(months));
  const r = n(rate);

  const downPayment = Math.round((n(downPct) / 100) * price);
  const loanAmount = Math.max(0, price - downPayment);
  const baseMonthly = calcAnnuityPayment(loanAmount, r, m);
  const commission = Math.round((n(commissionPct) / 100) * loanAmount);

  const result = (() => {
    if (!loanAmount || !m || !r) return null;

    const base = simulateLoan(loanAmount, r, m);
    const plan = toPlan(extra, m, startDate);

    if (!plan) {
      return {
        firstPayment: base.monthlyPayment,
        current: { totalPayment: base.totalPaid + commission, interestCost: base.totalInterest, months: base.months },
        base: null,
        comparison: null,
        extraPaid: 0,
        penaltyCost: 0,
        schedule: base.rows,
      };
    }

    const withExtra = simulateLoan(loanAmount, r, m, plan);
    return {
      firstPayment: withExtra.monthlyPayment,
      current: {
        totalPayment: withExtra.totalPaid + commission,
        interestCost: withExtra.totalInterest,
        months: withExtra.months,
      },
      base: { totalPayment: base.totalPaid + commission, interestCost: base.totalInterest, months: base.months },
      comparison: compareScenarios(base, withExtra),
      extraPaid: withExtra.totalExtra,
      penaltyCost: withExtra.totalPenalty,
      schedule: withExtra.rows,
    };
  })();

  const ear = (() => {
    if (!loanAmount || !m) return null;
    const net = loanAmount - commission;
    if (net <= 0) return (Math.pow(1 + r / 100 / 12, 12) - 1) * 100;
    return (Math.pow(1 + solveMonthlyIRR(baseMonthly, m, net), 12) - 1) * 100;
  })();

  const fifd = (() => {
    if (!result || !loanAmount || !m) return null;
    const net = loanAmount - commission;
    if (net <= 0) return null;
    return solveMonthlyIRR(result.firstPayment, m, net) * 12 * 100;
  })();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <div role="group" aria-label="Avtomobilin vəziyyəti" className="mb-4 flex gap-2">
              {([
                { key: "new", label: "Yeni" },
                { key: "used", label: "İşlənmiş" },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={isNew === t.key}
                  onClick={() => setIsNew(t.key)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                    isNew === t.key
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Avtomobilin qiyməti"
                unit="₼"
                value={carPrice}
                onChange={setCarPrice}
                min={0}
                placeholder="30000"
                autoFocus
              />
              <NumberField label="İlkin ödəniş" unit="%" value={downPct} onChange={setDownPct} min={10} max={90} />
              <NumberField label="Müddət" unit="ay" value={months} onChange={setMonths} min={6} max={59} />
              <MonthField label="Kredit başlama tarixi" value={startDate} onChange={setStartDate} />
              <NumberField label="İllik faiz" unit="%" value={rate} onChange={setRate} min={5} max={35} step={0.1} />
              <NumberField label="Komissiya" unit="%" value={commissionPct} onChange={setCommissionPct} min={0} max={5} step={0.25} />
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
              </div>
            )}

            {isNew === "used" && (
              <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
                İşlənmiş avtomobillər üçün yaş məhdudiyyəti bankdan banka dəyişir.
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
                oneOffNote={commission > 0 ? `Üstəlik ${azn(commission)} komissiya` : undefined}
                base={result.base}
                current={result.current}
                comparison={result.comparison}
                extraPaid={result.extraPaid}
                costs={[
                  { label: "Komissiya", amount: commission },
                  { label: "Erkən ödəniş kompensasiyası", amount: result.penaltyCost },
                ]}
                checkUrl={`/az/kredit-yoxlama?mebleq=${loanAmount}&muddet=${m}&faiz=${r}&nov=avto`}
                ear={ear}
                fifd={fifd}
              />
            ) : (
              <Card>
                <p className="text-sm font-medium text-gray-600">Avtomobilin qiymətini yazın.</p>
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
