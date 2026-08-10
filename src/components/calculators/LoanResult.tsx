"use client";

import { ArrowRight } from "lucide-react";
import type { ScenarioComparison } from "@/lib/calculators/amortisation";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { SavingsTiles } from "@/components/ui/SavingsTiles";

/* Панель результата, общая для трёх калькуляторов.

   Ведёт одно число — ежемесячный платёж. Всё остальное (проценты, срок,
   общая сумма) стоит рядом как поддержка, а не соревнуется с ним за
   внимание. Стоимость никогда не показывается в одиночку: рядом всегда
   есть то, к чему её можно отнести. */

export interface Totals {
  interestCost: number;
  totalPayment: number;
  months: number;
}

function Figures({ data, tone = "plain" }: { data: Totals; tone?: "plain" | "good" }) {
  const cell = tone === "good" ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50";
  const val = tone === "good" ? "text-emerald-800" : "text-ink";
  return (
    <dl className="grid grid-cols-3 gap-2.5">
      {[
        { k: "Toplam faiz", v: formatCurrency(data.interestCost) },
        { k: "Ümumi ödəniş", v: formatCurrency(data.totalPayment) },
        { k: "Müddət", v: `${data.months} ay` },
      ].map((x) => (
        <div key={x.k} className={`rounded-xl border p-2.5 ${cell}`}>
          <dt className="text-[11px] text-gray-500">{x.k}</dt>
          <dd className={`mt-0.5 text-[13px] font-bold tabular-nums ${val}`}>{x.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LoanResult({
  monthly,
  oneOffNote,
  base,
  current,
  comparison,
  extraPaid,
  costs,
  checkUrl,
  ear,
  fifd,
}: {
  monthly: number;
  /** Разовые расходы, названные прямо под платежом. */
  oneOffNote?: string;
  /** Сценарий без доплат. null, когда доплат нет и сравнивать не с чем. */
  base: Totals | null;
  current: Totals;
  comparison: ScenarioComparison | null;
  extraPaid: number;
  costs: { label: string; amount: number }[];
  checkUrl: string;
  ear: number | null;
  fifd: number | null;
}) {
  const visibleCosts = costs.filter((c) => c.amount > 0);

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-medium text-gray-600">Aylıq ödəniş</p>
        <p className="mt-1 text-4xl font-extrabold leading-none tracking-tight tabular-nums text-ink">
          {formatCurrency(monthly)}
        </p>
        {oneOffNote && <p className="mt-1.5 text-xs text-gray-500">{oneOffNote}</p>}

        <div className="mt-5">
          {base && <p className="mb-2 text-xs font-semibold text-gray-500">Əlavə ödəniş olmadan</p>}
          <Figures data={base ?? current} />
        </div>

        {base && comparison && (
          <>
            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="mb-2 text-xs font-semibold text-gray-500">Əlavə ödənişlə</p>
              <Figures data={current} tone="good" />
            </div>
            <SavingsTiles comparison={comparison} extraPaid={extraPaid} />
          </>
        )}

        {visibleCosts.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="mb-2 text-xs font-semibold text-gray-500">Əlavə xərclər</p>
            <dl className="space-y-1.5">
              {visibleCosts.map((c) => (
                <div key={c.label} className="flex justify-between gap-3 text-sm">
                  <dt className="text-gray-600">{c.label}</dt>
                  <dd className="font-medium tabular-nums text-gray-800">{formatCurrency(c.amount)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-gray-200 pt-4">
          <span className="text-sm text-gray-600">Ümumi ödəniş</span>
          <span className="text-lg font-bold tabular-nums text-ink">{formatCurrency(current.totalPayment)}</span>
        </div>

        <LinkButton href={checkUrl} block className="mt-4" icon={<ArrowRight size={15} />}>
          Kredit yoxlamasına keç
        </LinkButton>
      </Card>

      {/* Две ставки стоят рядом намеренно: они отвечают на разные вопросы, и
          пользователь должен видеть, что объявленный процент — не вся цена. */}
      {(ear !== null || fifd !== null) && (
        <Card className="space-y-3">
          {ear !== null && (
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink">Effektiv illik faiz (EAR)</p>
                <p className="mt-0.5 text-xs text-gray-600">Aylıq kapitallaşma nəzərə alınmaqla</p>
              </div>
              <p className="text-xl font-extrabold tabular-nums text-ink">{formatPercent(ear, 2)}</p>
            </div>
          )}
          {fifd !== null && (
            <div className={`flex items-baseline justify-between gap-3 ${ear !== null ? "border-t border-gray-200 pt-3" : ""}`}>
              <div>
                <p className="text-sm font-bold text-ink">Faktiki illik faiz dərəcəsi (FİFD)</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
                  Faiz, komissiya və sığorta daxil. Banklar bu rəqəmi müqavilədə göstərməyə borcludur.
                </p>
              </div>
              <p className="text-xl font-extrabold tabular-nums text-ink">{formatPercent(fifd, 2)}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
