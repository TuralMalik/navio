/* Единственная реализация аннуитетной формулы в проекте.
   Скоринг и все калькуляторы используют её. */
export function calcAnnuityPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (months <= 0 || principal <= 0) return 0;
  if (annualRate <= 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/* Подбор месячной ставки (IRR) бинарным поиском:
   при каком r приведённая стоимость аннуитета payment×months равна netPrincipal.
   Используется калькуляторами для EAR / FİFD. */
export function solveMonthlyIRR(payment: number, months: number, netPrincipal: number): number {
  let lo = 0, hi = 10;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const pv = mid === 0 ? payment * months : (payment * (1 - Math.pow(1 + mid, -months))) / mid;
    if (pv > netPrincipal) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
