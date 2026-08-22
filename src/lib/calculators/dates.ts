/* Даты для калькуляторов: старт кредита и перевод «дата ↔ порядковый месяц».
   Дата хранится как "YYYY-MM-DD" (день/месяц/год). Движок амортизации остаётся
   помесячным: для номера месяца берём только год и месяц, день — для подписи. */

import { useEffect, useState } from "react";

const MONTHS_AZ_SHORT = [
  "Yan", "Fev", "Mar", "Apr", "May", "İyn",
  "İyl", "Avq", "Sen", "Okt", "Noy", "Dek",
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Сегодняшняя дата как "YYYY-MM-DD" (формат value у input[type=date]). */
export function currentDateValue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "YYYY-MM-DD" + сдвиг в месяцах → "YYYY-MM-DD" (день сохраняем, при нехватке
    дней в месяце — прижимаем к последнему дню). */
export function addMonths(value: string, offset: number): string {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m) return value;
  const target = new Date(y, m - 1 + offset, 1);
  const ty = target.getFullYear();
  const tm = target.getMonth();
  const daysInMonth = new Date(ty, tm + 1, 0).getDate();
  return `${ty}-${pad(tm + 1)}-${pad(Math.min(d || 1, daysInMonth))}`;
}

/** Порядковый номер платежа (1..) для выбранной даты относительно старта.
    Считается по году и месяцу; день на номер месяца не влияет. */
export function monthIndex(start: string, value: string): number | null {
  const [sy, sm] = start.split("-").map(Number);
  const [vy, vm] = value.split("-").map(Number);
  if (!sy || !sm || !vy || !vm) return null;
  return (vy - sy) * 12 + (vm - sm) + 1;
}

/** "YYYY-MM-DD" → "15 Avq 2026". */
export function formatDateLabel(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m) return "";
  return `${d || 1} ${MONTHS_AZ_SHORT[m - 1]} ${y}`;
}

/** Дата для порядкового месяца графика (month = 1 → сам старт). */
export function scheduleDateLabel(start: string, month: number): string {
  if (!start) return "";
  return formatDateLabel(addMonths(start, month - 1));
}

/* Дефолт стартовой даты проставляем ПОСЛЕ маунта, а не в initial state:
   значение зависит от new Date(), и на сервере (часто UTC) оно может отличаться
   от клиента на границе суток, что даёт hydration mismatch (#418). Поэтому
   первый рендер — пустой, а сегодняшнюю дату дописываем в эффекте на клиенте. */
export function useDefaultStartDate(): [string, (v: string) => void] {
  const [value, setValue] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue((cur) => cur || currentDateValue());
  }, []);
  return [value, setValue];
}
