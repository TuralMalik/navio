"use client";

import { formatCurrency } from "@/lib/utils";
import type { ScenarioComparison } from "@/lib/calculators/amortisation";

/* Блок «Fərq»: разница между сценариями без доплат и с доплатами.
   Знак показываем честно: при высокой компенсации за досрочное погашение
   общая сумма может ВЫРАСТИ, и называть это «qənaət» было бы неправдой. */
export function SavingsTiles({ comparison, extraPaid }: { comparison: ScenarioComparison; extraPaid?: number }) {
  const { interestSaved, totalSaved, monthsSaved } = comparison;
  const totalIsLoss = totalSaved < 0;

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <p className="mb-2 text-xs font-semibold text-gray-500">Fərq</p>

      <dl className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-2.5">
          <dt className="text-[11px] text-gray-500">Faiz qənaəti</dt>
          <dd className="mt-0.5 text-[13px] font-bold tabular-nums text-emerald-700">
            −{formatCurrency(Math.abs(interestSaved))}
          </dd>
        </div>

        <div
          className={`rounded-xl border p-2.5 ${totalIsLoss ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-gray-50"}`}
        >
          <dt className="text-[11px] text-gray-500">{totalIsLoss ? "Ümumi əlavə xərc" : "Ümumi qənaət"}</dt>
          <dd className={`mt-0.5 text-[13px] font-bold tabular-nums ${totalIsLoss ? "text-amber-800" : "text-emerald-700"}`}>
            {totalIsLoss ? "+" : "−"}
            {formatCurrency(Math.abs(totalSaved))}
          </dd>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-2.5">
          <dt className="text-[11px] text-gray-500">Müddət azalması</dt>
          <dd className="mt-0.5 text-[13px] font-bold tabular-nums text-emerald-700">−{monthsSaved} ay</dd>
        </div>
      </dl>

      {/* Сколько именно пришлось доложить, чтобы получить эту экономию —
          без этого числа сравнение выглядит как «экономия из воздуха». */}
      {extraPaid != null && extraPaid > 0 && (
        <p className="mt-2 text-xs leading-relaxed text-gray-600">
          Bunun üçün əlavə olaraq <strong className="font-semibold text-ink">{formatCurrency(extraPaid)}</strong>{" "}
          ödəyirsiniz.
        </p>
      )}

      {totalIsLoss && (
        <p className="mt-2 text-xs leading-relaxed text-amber-800">
          Faizdən qənaət edilsə də, erkən ödəniş kompensasiyası bu qənaəti üstələyir. Bu halda krediti tez bağlamaq
          ümumi xərci artırır.
        </p>
      )}
    </div>
  );
}
