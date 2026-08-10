import { formatPercent } from "@/lib/utils";
import type { Tone } from "@/lib/score-contract";
import { toneStyle } from "@/lib/tone";

/* Долговая нагрузка (BGN) относительно банковского лимита.

   Прежняя версия заливала всю полосу радужным градиентом и накрывала
   «непройденную» часть полупрозрачной серой плашкой. Читалось ровно
   наоборот: залитая ярким цветом полоса выглядела как достижение, хотя
   высокий BGN — это плохо.

   Здесь наоборот: серый трек, заполнение тоном (зелёный/янтарный/розовый) и
   отдельная засечка лимита. Пользователю нужно ответить на один вопрос —
   он левее или правее лимита. */

export function BgnBar({ bgn, limit, tone }: { bgn: number; limit: number; tone: Tone }) {
  // Шкала до 100%: лимит (обычно 70) должен быть виден внутри полосы,
  // иначе засечка упирается в правый край и перестаёт быть ориентиром.
  const pct = Math.max(0, Math.min(bgn, 100));
  const limitPct = Math.max(0, Math.min(limit, 100));
  const overLimit = bgn > limit;
  const s = toneStyle(tone);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-gray-800">Borc yükü</span>
        <span className={`text-base font-bold tabular-nums ${s.text}`}>{formatPercent(bgn)}</span>
      </div>

      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-[width] duration-200 ease-out ${s.fill}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Засечка лимита стоит НАД полосой, а не внутри: внутри её перекрывала
          бы заливка ровно тогда, когда она важнее всего. */}
      <div className="relative mt-1 h-4">
        <div className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${limitPct}%` }}>
          <div className="mx-auto h-2 w-px bg-gray-400" />
          <span className="whitespace-nowrap text-[11px] font-medium text-gray-500 tabular-nums">
            Limit {formatPercent(limit, 0)}
          </span>
        </div>
      </div>

      {overLimit && (
        <p className="mt-4 text-xs font-medium text-rose-700">
          Borc yükünüz bank limitindən yuxarıdır.
        </p>
      )}
    </div>
  );
}
