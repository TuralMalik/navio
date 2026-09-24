"use client";

import { useState } from "react";
import { ChevronDown, Plus, Check, Trash2 } from "lucide-react";
import type { AmortisationRow } from "@/lib/calculators/amortisation";
import { addMonths, monthIndex, scheduleDateLabel } from "@/lib/calculators/dates";
import { formatCurrency } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";

const PREVIEW_ROWS = 10;

/* График платежей. Все три калькулятора выводили его одинаковым куском
   разметки, включая одинаковые ошибки.

   Числа идут табличными цифрами и выравниваются вправо: в столбце сумм
   разряды должны стоять друг под другом, иначе колонку невозможно
   просматривать взглядом сверху вниз.

   Строку можно раскрыть и прямо в графике добавить разовую доплату на её
   дату: это удобнее, чем вычислять дату и вписывать её в отдельном блоке
   выше. Источник истины остаётся один — список доплат в форме; строка графика
   лишь быстрый вход в него. */
export function ScheduleTable({
  rows,
  showExtra,
  startDate = "",
  oneTime = [],
  onSetOneTime,
}: {
  rows: AmortisationRow[];
  showExtra: boolean;
  /** Дата начала кредита ("YYYY-MM-DD"): если задана, к номеру месяца добавляем дату. */
  startDate?: string;
  /** Текущие разовые доплаты — чтобы показать сумму на строке и дать её изменить. */
  oneTime?: { date: string; amount: number }[];
  /** Добавить/изменить/убрать (amount=0) разовую доплату на указанную дату. */
  onSetOneTime?: (date: string, amount: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [openMonth, setOpenMonth] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  if (!rows.length) return null;

  const visible = expanded ? rows : rows.slice(0, PREVIEW_ROWS);
  const colSpan = 5 + (showExtra ? 1 : 0);
  const canEdit = Boolean(onSetOneTime && startDate);

  // Сумма уже назначенной разовой доплаты для этого месяца (по номеру месяца,
  // чтобы день внутри месяца не мешал сопоставлению).
  const oneTimeFor = (month: number) =>
    oneTime.find((o) => monthIndex(startDate, o.date) === month)?.amount ?? 0;

  const openRow = (month: number) => {
    if (!canEdit) return;
    if (openMonth === month) {
      setOpenMonth(null);
      return;
    }
    setOpenMonth(month);
    const existing = oneTimeFor(month);
    setDraft(existing > 0 ? String(existing) : "");
  };

  const commit = (month: number) => {
    onSetOneTime?.(addMonths(startDate, month), parseInt(draft, 10) || 0);
    setOpenMonth(null);
  };

  const clear = (month: number) => {
    onSetOneTime?.(addMonths(startDate, month), 0);
    setOpenMonth(null);
  };

  return (
    <Card className="mt-6">
      <CardTitle className="mb-1">Ödəniş cədvəli</CardTitle>
      {canEdit && (
        <p className="mb-4 text-[13px] text-gray-600">
          İstənilən sətrə toxunun və həmin tarixə birdəfəlik əlavə ödəniş əlavə edin.
        </p>
      )}

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
            {visible.map((row) => {
              const isOpen = openMonth === row.month;
              const existing = oneTimeFor(row.month);
              return (
                <ScheduleRowGroup key={row.month}>
                  <tr
                    className={`border-b border-gray-100 last:border-0 ${
                      canEdit ? "cursor-pointer hover:bg-gray-50" : "hover:bg-gray-50"
                    } ${isOpen ? "bg-brand-50/60" : ""}`}
                    {...(canEdit
                      ? {
                          role: "button",
                          tabIndex: 0,
                          "aria-expanded": isOpen,
                          onClick: () => openRow(row.month),
                          onKeyDown: (e: React.KeyboardEvent) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openRow(row.month);
                            }
                          },
                        }
                      : {})}
                  >
                    <th scope="row" className="py-2.5 pr-4 text-left font-medium tabular-nums text-gray-700">
                      <span className="flex items-center gap-1.5">
                        {canEdit && (
                          <Plus
                            size={13}
                            aria-hidden
                            className={`shrink-0 transition-transform ${isOpen ? "rotate-45 text-brand-600" : "text-gray-300"}`}
                          />
                        )}
                        {row.month}
                      </span>
                      {startDate && (
                        <span className="block pl-[19px] text-[11px] font-normal text-gray-400">
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

                  {canEdit && isOpen && (
                    <tr className="border-b border-gray-100 bg-brand-50/60">
                      <td colSpan={colSpan} className="px-1 py-3">
                        <div className="flex flex-wrap items-end gap-3">
                          <label className="text-[13px] font-semibold text-ink">
                            <span className="mb-1 block text-[11px] font-semibold text-gray-500">
                              {scheduleDateLabel(startDate, row.month)} tarixinə birdəfəlik əlavə ödəniş (₼)
                            </span>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={0}
                              autoFocus
                              className={inputClasses(null, "max-w-[180px]")}
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commit(row.month);
                                if (e.key === "Escape") setOpenMonth(null);
                              }}
                            />
                          </label>
                          <Button size="sm" onClick={() => commit(row.month)} icon={<Check size={15} />}>
                            {existing > 0 ? "Yenilə" : "Əlavə et"}
                          </Button>
                          {existing > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => clear(row.month)}
                              icon={<Trash2 size={15} />}
                              className="text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                            >
                              Sil
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </ScheduleRowGroup>
              );
            })}
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

/* Группировка строки платежа и её раскрытой панели без лишней обёртки в DOM:
   <tbody> не должен содержать ничего, кроме <tr>, поэтому фрагмент. */
function ScheduleRowGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
