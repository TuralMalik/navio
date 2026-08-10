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
    <div className="mt-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Fərq</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">Faiz qənaəti</p>
          <p className="text-sm font-bold text-blue-700">−{formatCurrency(Math.abs(interestSaved))}</p>
        </div>

        <div className={`rounded-xl p-3 border ${totalIsLoss ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-100"}`}>
          <p className="text-xs text-gray-500 mb-1">{totalIsLoss ? "Ümumi əlavə xərc" : "Ümumi qənaət"}</p>
          <p className={`text-sm font-bold ${totalIsLoss ? "text-amber-700" : "text-blue-700"}`}>
            {totalIsLoss ? "+" : "−"}{formatCurrency(Math.abs(totalSaved))}
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">Müddət azalması</p>
          <p className="text-sm font-bold text-blue-700">−{monthsSaved} ay</p>
        </div>
      </div>

      {/* Сколько именно пришлось доложить, чтобы получить эту экономию —
          без этого числа сравнение выглядит как «экономия из воздуха». */}
      {extraPaid != null && extraPaid > 0 && (
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          Bunun üçün əlavə olaraq <strong className="text-gray-700">{formatCurrency(extraPaid)}</strong> ödəyirsiniz.
        </p>
      )}

      {totalIsLoss && (
        <p className="text-xs text-amber-700 mt-2 leading-relaxed">
          Faizdən qənaət edilsə də, erkən ödəniş kompensasiyası bu qənaəti üstələyir — bu halda
          krediti tez bağlamaq ümumi xərci artırır.
        </p>
      )}
    </div>
  );
}
