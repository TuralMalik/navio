export function calcAnnuityPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function buildAmortizationSchedule(
  principal: number,
  annualRate: number,
  months: number
): Array<{ month: number; payment: number; principal: number; interest: number; balance: number }> {
  const r = annualRate / 100 / 12;
  const payment = calcAnnuityPayment(principal, annualRate, months);
  const schedule = [];
  let balance = principal;

  for (let i = 1; i <= months; i++) {
    const interest = balance * r;
    const principalPart = payment - interest;
    balance = Math.max(0, balance - principalPart);
    schedule.push({
      month: i,
      payment: Math.round(payment * 100) / 100,
      principal: Math.round(principalPart * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }
  return schedule;
}
