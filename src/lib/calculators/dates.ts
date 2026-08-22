/* Даты для калькуляторов: старт кредита и перевод «дата ↔ порядковый месяц».
   Движок амортизации остаётся помесячным (month = 1..N); дата нужна только
   на входе (выбор месяца доплаты) и на выходе (подпись в графике). */

import { useEffect, useState } from "react";

const MONTHS_AZ_SHORT = [
  "Yan", "Fev", "Mar", "Apr", "May", "İyn",
  "İyl", "Avq", "Sen", "Okt", "Noy", "Dek",
];

/** Текущий месяц как "YYYY-MM" (формат value у input[type=month]). */
export function currentMonthValue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "YYYY-MM" + сдвиг в месяцах → "YYYY-MM". */
export function addMonths(value: string, offset: number): string {
  const [y, m] = value.split("-").map(Number);
  if (!y || !m) return value;
  const d = new Date(y, m - 1 + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Порядковый номер платежа (1..) для выбранной даты относительно старта. */
export function monthIndex(start: string, value: string): number | null {
  const [sy, sm] = start.split("-").map(Number);
  const [vy, vm] = value.split("-").map(Number);
  if (!sy || !sm || !vy || !vm) return null;
  return (vy - sy) * 12 + (vm - sm) + 1;
}

/** "YYYY-MM" → "Avq 2026". */
export function formatMonthLabel(value: string): string {
  const [y, m] = value.split("-").map(Number);
  if (!y || !m) return "";
  return `${MONTHS_AZ_SHORT[m - 1]} ${y}`;
}

/** Дата для порядкового месяца графика (month = 1 → сам старт). */
export function scheduleDateLabel(start: string, month: number): string {
  if (!start) return "";
  return formatMonthLabel(addMonths(start, month - 1));
}

/* Дефолт стартового месяца проставляем ПОСЛЕ маунта, а не в initial state:
   значение зависит от new Date(), и на сервере (часто UTC) оно может отличаться
   от клиента на границе месяца, что даёт hydration mismatch (#418). Поэтому
   первый рендер — пустой, а текущий месяц дописываем в эффекте на клиенте. */
export function useDefaultStartMonth(): [string, (v: string) => void] {
  const [value, setValue] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue((cur) => cur || currentMonthValue());
  }, []);
  return [value, setValue];
}
