import { buildAmortizationSchedule, calcAnnuityPayment } from "./annuity";

export type EarlyRepaymentStrategy = "reduce-term" | "reduce-payment";

export interface EarlyRepaymentResult {
  originalTotalPayment: number;
  newTotalPayment: number;
  savings: number;
  newTermMonths?: number;
  newMonthlyPayment?: number;
}

export function calcEarlyRepayment(
  principal: number,
  annualRate: number,
  totalMonths: number,
  repaymentAmount: number,
  repaymentMonth: number,
  strategy: EarlyRepaymentStrategy
): EarlyRepaymentResult {
  const schedule = buildAmortizationSchedule(principal, annualRate, totalMonths);
  const originalTotalPayment = schedule.reduce((s, r) => s + r.payment, 0);

  const balanceAtRepayment = schedule[repaymentMonth - 1]?.balance ?? 0;
  const newPrincipal = Math.max(0, balanceAtRepayment - repaymentAmount);
  const remainingMonths = totalMonths - repaymentMonth;

  let newTotalPayment = schedule
    .slice(0, repaymentMonth)
    .reduce((s, r) => s + r.payment, 0) + repaymentAmount;

  if (strategy === "reduce-term") {
    const newSchedule = buildAmortizationSchedule(newPrincipal, annualRate, remainingMonths);
    newTotalPayment += newSchedule.reduce((s, r) => s + r.payment, 0);
    return {
      originalTotalPayment: Math.round(originalTotalPayment),
      newTotalPayment: Math.round(newTotalPayment),
      savings: Math.round(originalTotalPayment - newTotalPayment),
      newTermMonths: repaymentMonth + newSchedule.length,
    };
  } else {
    const newPayment = calcAnnuityPayment(newPrincipal, annualRate, remainingMonths);
    newTotalPayment += newPayment * remainingMonths;
    return {
      originalTotalPayment: Math.round(originalTotalPayment),
      newTotalPayment: Math.round(newTotalPayment),
      savings: Math.round(originalTotalPayment - newTotalPayment),
      newMonthlyPayment: Math.round(newPayment * 100) / 100,
    };
  }
}
