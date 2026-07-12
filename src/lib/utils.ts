import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Детерминированные форматтеры (без Intl): сервер и клиент дают одинаковую строку,
// иначе Next выбрасывает hydration error #418 на калькуляторах.
export function formatNumber(num: number): string {
  const grouped = Math.round(Math.abs(num)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (num < 0 ? "-" : "") + grouped;
}

export function formatCurrency(amount: number): string {
  const neg = amount < 0;
  const [int, frac] = Math.abs(amount).toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (neg ? "-" : "") + grouped + "," + frac + " ₼";
}
