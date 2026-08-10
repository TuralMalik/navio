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

/* Переключатель типа кузова («Elektrik / Hibrid / Digər») убран.

   Он ни на что не влиял: значение никуда не передавалось и ни в одну формулу
   не входило. Вдобавок начальное состояние было "passenger", которого нет
   среди вариантов, поэтому при открытии страницы не подсвечивался ни один.
   Сделать его рабочим значило бы придумать разные ставки по типу двигателя,
   а выдуманные числа на кредитном калькуляторе недопустимы.

   «Yeni / İşlənmiş» оставлен: он показывает реальное предупреждение про
   ограничения банков по возрасту авто. */

export default function AutoLoanPage() {
  const [carPriceStr, setCarPriceStr] = useState("");
  const [priceTouched, setPriceTouched] = useState(false);
  const [isNew, setIsNew] = useState<"new" | "used">("new");
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [months, setMonths] = useState(60);
  const [rate, setRate] = useState(15);
  const [commissionPct, setCommissionPct] = useState(0);
  const [extra, setExtra] = useState(initialExtraConfig);

  const carPrice = parseFloat(carPriceStr) || 0;
  const downPayment = Math.round((downPaymentPct / 100) * carPrice);
  const loanAmount = Math.max(0, carPrice - downPayment);
  const baseMonthly = calcAnnuityPayment(loanAmount, rate, months);
  const commission = Math.round((commissionPct / 100) * loanAmount);

  const result = useMemo(() => {
    if (!loanAmount || !months || !rate) return null;

    // Базовый сценарий считаем всегда, чтобы сравнение «до/после» было настоящим
    const base = simulateLoan(loanAmount, rate, months);
    const plan = toPlan(extra, months);

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

    const withExtra = simulateLoan(loanAmount, rate, months, plan);
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
  }, [loanAmount, rate, months, commission, extra]);

  const ear = useMemo(() => {
    if (!loanAmount || !months) return null;
    const netPrincipal = loanAmount - commission;
    if (netPrincipal <= 0) return (Math.pow(1 + rate / 100 / 12, 12) - 1) * 100;
    const irr = solveMonthlyIRR(baseMonthly, months, netPrincipal);
    return (Math.pow(1 + irr, 12) - 1) * 100;
  }, [loanAmount, months, baseMonthly, commission, rate]);

  const fifd = useMemo(() => {
    if (!result || !loanAmount || !months) return null;
    const netPrincipal = loanAmount - commission;
    if (netPrincipal <= 0) return null;
    return solveMonthlyIRR(result.firstPayment, months, netPrincipal) * 12 * 100;
  }, [result, loanAmount, months, commission]);

  // Ошибка показывается только после того, как поле трогали: краснеть при
  // первом появлении страницы, когда человек ещё ничего не сделал, незачем.
  const priceError = priceTouched && carPrice <= 0 ? "Avtomobilin dəyərini daxil edin." : null;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Breadcrumbs
          trail={[
            { href: "/az", label: "Ana səhifə" },
            { href: "/az/calculators", label: "Kalkulyatorlar" },
          ]}
          current="Avtokredit"
        />
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Avtokredit kalkulyatoru</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <Card className="space-y-5">
              <div role="group" aria-label="Avtomobilin vəziyyəti" className="flex gap-2">
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

              <Field
                label="Avtomobilin qiyməti"
                htmlFor="car-price"
                error={priceError}
                hint="Manatla"
                className="border-t border-gray-200 pt-5"
              >
                <input
                  id="car-price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={carPriceStr}
                  onChange={(e) => setCarPriceStr(e.target.value)}
                  onBlur={() => setPriceTouched(true)}
                  placeholder="30 000"
                  className={inputClasses(priceError)}
                />
              </Field>

              <SliderRow
                label="İlkin ödəniş"
                value={downPaymentPct}
                min={10}
                max={90}
                step={5}
                format={(v) => formatPercent(v, 0)}
                unit="%"
                onChange={setDownPaymentPct}
              />
              <SliderRow
                label="Kredit müddəti"
                value={months}
                min={6}
                max={59}
                step={1}
                format={(v) => `${v} ay`}
                unit="ay"
                onChange={setMonths}
              />
              <SliderRow
                label="İllik faiz dərəcəsi"
                value={rate}
                min={5}
                max={35}
                step={0.1}
                format={(v) => formatPercent(v)}
                unit="%"
                onChange={setRate}
              />
              <SliderRow
                label="Komissiya"
                value={commissionPct}
                min={0}
                max={5}
                step={0.25}
                format={(v) => (v === 0 ? "yoxdur" : formatPercent(v, 2))}
                unit="%"
                onChange={setCommissionPct}
              />

              {/* Сумма кредита выводится из цены и первого взноса, поэтому
                  показывается рядом с ними, а не только в результате. */}
              <dl className="flex items-baseline justify-between gap-3 border-t border-gray-200 pt-4">
                <dt className="text-sm font-semibold text-gray-700">İlkin ödəniş</dt>
                <dd className="text-sm font-bold tabular-nums text-ink">{azn(downPayment)}</dd>
              </dl>
              <dl className="flex items-baseline justify-between gap-3">
                <dt className="text-sm font-semibold text-gray-700">Kredit məbləği</dt>
                <dd className="text-base font-extrabold tabular-nums text-ink">{formatCurrency(loanAmount)}</dd>
              </dl>
            </Card>

            <ExtraPayments months={months} value={extra} onChange={setExtra} />
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-4 lg:sticky lg:top-20">
              {result ? (
                <LoanResult
                  monthly={result.firstPayment}
                  oneOffNote={commission > 0 ? `Əlavə olaraq ${azn(commission)} komissiya` : undefined}
                  base={result.base}
                  current={result.current}
                  comparison={result.comparison}
                  extraPaid={result.extraPaid}
                  costs={[
                    { label: "Komissiya", amount: commission },
                    { label: "Erkən ödəniş kompensasiyası", amount: result.penaltyCost },
                  ]}
                  checkUrl={`/az/kredit-yoxlama?mebleq=${loanAmount}&muddet=${months}&faiz=${rate}&nov=avto`}
                  ear={ear}
                  fifd={fifd}
                />
              ) : (
                <Card>
                  <p className="text-sm font-medium text-gray-600">Avtomobilin qiymətini daxil edin.</p>
                  <p className="mt-1 text-xs text-gray-500">Aylıq ödəniş dərhal burada hesablanacaq.</p>
                </Card>
              )}

              {isNew === "used" && (
                <Card>
                  <p className="text-xs leading-relaxed text-gray-600">
                    İşlənmiş avtomobillər üçün yaş məhdudiyyəti bankdan banka dəyişir. Banklar fərqli şərtlər qoya bilər.
                  </p>
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
