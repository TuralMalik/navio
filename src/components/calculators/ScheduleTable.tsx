"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AmortisationRow } from "@/lib/calculators/amortisation";
import { scheduleDateLabel } from "@/lib/calculators/dates";
import { formatCurrency } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const PREVIEW_ROWS = 10;

/* График платежей. Все три калькулятора выводили его одинаковым куском
   разметки, включая одинаковые ошибки.

   Числа идут табличными цифрами и выравниваются вправо: в столбце сумм
   разряды должны стоять друг под другом, иначе колонку невозможно
   просматривать взглядом сверху вниз. */
export function ScheduleTable({
  rows,
  showExtra,
  startDate = "",
}: {
  rows: AmortisationRow[];
  showExtra: boolean;
  /** Дата начала кредита ("YYYY-MM"): если задана, к номеру месяца добавляем дату. */
  startDate?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!rows.length) return null;

  const visible = expanded ? rows : rows.slice(0, PREVIEW_ROWS);

  return (
    <Card className="mt-6">
      <CardTitle className="mb-4">Ödəniş cədvəli</CardTitle>

      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-sm">
          <caption className="sr-only">Kredit üzrə aylıq ödənişlərin cədvəli</caption>
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500">
              <th scope="col" className="pb-3 pr-4 text-left font-medium">Ay</th>
              <th scope="col" className="pb-3 pr-4 text-right font-medium">Aylıq ödəniş</th>
              {showExtra && <th scope="col" className="pb-3 pr-4 text-right font-medium">Əlavə ödəniş</th>}
              <th scope="col" className="pb-3 pr-4 text-right font-medium">Faiz hissəsi</th>
              <th scope="col" className="pb-3 pr-4 text-right font-medium">Əsas borc</th>
              <th scope="col" className="pb-3 text-right font-medium">Qalıq borc</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.month} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <th scope="row" className="py-2.5 pr-4 text-left font-medium tabular-nums text-gray-700">
                  {row.month}
                  {startDate && (
                    <span className="block text-[11px] font-normal text-gray-400">
                      {scheduleDateLabel(startDate, row.month)}
                    </span>
                  )}
                </th>
                <td className="py-2.5 pr-4 text-right tabular-nums text-gray-700">{formatCurrency(row.payment)}</td>
                {showExtra && (
                  /* Ноль — это настоящее значение, а не пропуск, поэтому он и
                     печатается нулём. Раньше здесь стояло тире, и колонка
                     читалась как «данных нет». */
                  <td
                    className={`py-2.5 pr-4 text-right tabular-nums ${
                      row.extra > 0 ? "font-medium text-brand-700" : "text-gray-400"
                    }`}
                  >
                    {formatCurrency(row.extra)}
                  </td>
                )}
                <td className="py-2.5 pr-4 text-right tabular-nums text-gray-600">{formatCurrency(row.interest)}</td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-gray-600">{formatCurrency(row.principal)}</td>
                <td className="py-2.5 text-right font-medium tabular-nums text-ink">{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > PREVIEW_ROWS && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 px-0"
          icon={<ChevronDown size={15} className={expanded ? "rotate-180 transition-transform" : "transition-transform"} />}
        >
          {expanded ? "Yığ" : `Bütün cədvəli göstər (${rows.length} ay)`}
        </Button>
      )}
    </Card>
  );
}
