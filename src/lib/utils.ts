// Детерминированные форматтеры (без Intl): сервер и клиент дают одинаковую строку,
// иначе Next выбрасывает hydration error #418 на калькуляторах.
// Неразрывный пробел (U+00A0) как разделитель тысяч и перед ₼ — чтобы число
// никогда не переносилось на новую строку (иначе "19 576,95 ₼" рвётся в узких колонках).
const NBSP = " ";

export function formatNumber(num: number): string {
  const grouped = Math.round(Math.abs(num)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return (num < 0 ? "-" : "") + grouped;
}

export function formatCurrency(amount: number): string {
  const neg = amount < 0;
  const [int, frac] = Math.abs(amount).toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return (neg ? "-" : "") + grouped + "," + frac + NBSP + "₼";
}
