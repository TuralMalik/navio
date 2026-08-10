/* Единая симуляция графика погашения — используется всеми калькуляторами.
   Раньше каждый калькулятор считал свой цикл, а «базовый» сценарий при
   включённых досрочных платежах не считался вовсе: блоки «до» и «после»
   показывали одни и те же значения, а обе «экономии» — одно и то же число.
   Теперь сценарии считаются одной функцией и сравнимы между собой. */

import { calcAnnuityPayment } from "./annuity";

export interface OneTimeExtra {
  month: number;
  amount: number;
}

export interface ExtraPaymentPlan {
  /** Постоянный доплат каждый месяц в интервале [fromMonth, toMonth]. */
  recurring?: { amount: number; fromMonth: number; toMonth: number };
  oneTime?: OneTimeExtra[];
  /** Компенсация за досрочное погашение, % от суммы доплаты. */
  penaltyPct?: number;
  /** Что уменьшается после доплаты: срок (платёж тот же) или платёж (срок тот же). */
  mode?: "term" | "payment";
}

export interface AmortisationRow {
  month: number;
  payment: number;
  extra: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface AmortisationResult {
  /** Первый плановый платёж (аннуитет по исходным условиям). */
  monthlyPayment: number;
  rows: AmortisationRow[];
  /** Фактическое число месяцев до закрытия. */
  months: number;
  totalScheduled: number;
  totalExtra: number;
  totalInterest: number;
  totalPenalty: number;
  /** Всё, что уходит из кармана по кредиту: плановые + доплаты + компенсации. */
  totalPaid: number;
}

const EMPTY: AmortisationResult = {
  monthlyPayment: 0, rows: [], months: 0,
  totalScheduled: 0, totalExtra: 0, totalInterest: 0, totalPenalty: 0, totalPaid: 0,
};

/** Прогоняет кредит месяц за месяцем. Без plan — обычный аннуитет без доплат. */
export function simulateLoan(
  principal: number,
  annualRate: number,
  months: number,
  plan?: ExtraPaymentPlan,
): AmortisationResult {
  if (principal <= 0 || months <= 0) return EMPTY;

  const r = annualRate / 100 / 12;
  const monthlyPayment = calcAnnuityPayment(principal, annualRate, months);

  const recurring = plan?.recurring;
  const oneTime = plan?.oneTime ?? [];
  const penaltyPct = plan?.penaltyPct ?? 0;
  const mode = plan?.mode ?? "term";

  let balance = principal;
  let currentPayment = monthlyPayment;
  let totalScheduled = 0;
  let totalExtra = 0;
  let totalInterest = 0;
  let totalPenalty = 0;
  let elapsed = 0;
  const rows: AmortisationRow[] = [];

  // Доплаты только сокращают срок, поэтому потолка в months достаточно;
  // при нулевой ставке и mode="payment" срок тоже не растёт.
  for (let i = 1; i <= months; i++) {
    if (balance <= 0) break;
    elapsed = i;

    const interest = balance * r;
    // Последний платёж не может превышать остаток с процентами
    const scheduled = Math.min(currentPayment, balance + interest);
    const principalPart = scheduled - interest;

    totalInterest += interest;
    totalScheduled += scheduled;
    balance -= principalPart;

    let appliedExtra = 0;
    if (balance > 0) {
      let wanted = 0;
      if (recurring && i >= recurring.fromMonth && i <= recurring.toMonth) wanted += recurring.amount;
      for (const op of oneTime) if (op.month === i) wanted += op.amount;

      if (wanted > 0) {
        appliedExtra = Math.min(wanted, balance);
        const penalty = (appliedExtra * penaltyPct) / 100;
        totalExtra += appliedExtra;
        totalPenalty += penalty;
        balance -= appliedExtra;

        // «Платёж уменьшается»: пересчитываем аннуитет на оставшийся срок
        const remaining = months - i;
        if (balance > 0 && mode === "payment" && remaining > 0) {
          currentPayment = calcAnnuityPayment(balance, annualRate, remaining);
        }
      }
    }

    rows.push({
      month: i,
      payment: scheduled,
      extra: appliedExtra,
      interest,
      principal: principalPart,
      balance: Math.max(0, balance),
    });
  }

  return {
    monthlyPayment,
    rows,
    months: elapsed,
    totalScheduled,
    totalExtra,
    totalInterest,
    totalPenalty,
    totalPaid: totalScheduled + totalExtra + totalPenalty,
  };
}

export interface ScenarioComparison {
  /** Сколько сэкономлено на процентах. Отрицательное — переплата. */
  interestSaved: number;
  /** Разница по всем выплатам, включая компенсацию за досрочное погашение.
     Может быть отрицательной: при высокой компенсации досрочное закрытие невыгодно. */
  totalSaved: number;
  /** На сколько месяцев короче. */
  monthsSaved: number;
}

export function compareScenarios(base: AmortisationResult, withExtra: AmortisationResult): ScenarioComparison {
  return {
    interestSaved: base.totalInterest - withExtra.totalInterest,
    totalSaved: base.totalPaid - withExtra.totalPaid,
    monthsSaved: base.months - withExtra.months,
  };
}
