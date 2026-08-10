import { formatPercent } from "@/lib/utils";
import type { Tone } from "@/lib/score-contract";
import { toneStyle } from "@/lib/tone";

/* Долговая нагрузка «сейчас» и «после этого кредита».

   Раньше обе величины были двумя точками на одной полосе с легендой снизу.
   Точки налезали друг на друга, когда значения близки, а именно это и есть
   частый случай. Две полосы на общей шкале отвечают на вопрос сразу:
   насколько вырастет нагрузка и перейдёт ли она лимит.

   Полоса «сейчас» намеренно серая: это исходная точка, а не оценка.
   Цветом окрашивается только результат. */

function Row({ label, value, tone, muted = false }: { label: string; value: number; tone: Tone; muted?: boolean }) {
  const width = Math.max(0, Math.min(value, 100));
  const s = toneStyle(tone);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${muted ? "text-gray-700" : s.text}`}>
          {formatPercent(value)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full rounded-full ${muted ? "bg-gray-400" : s.fill}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function BgnCompare({
  current,
  after,
  limit,
  tone,
}: {
  current: number;
  after: number;
  limit: number;
  tone: Tone;
}) {
  const limitPct = Math.max(0, Math.min(limit, 100));

  return (
    <div className="relative">
      <div className="space-y-3">
        <Row label="İndi" value={current} tone="na" muted />
        <Row label="Bu kreditdən sonra" value={after} tone={tone} />
      </div>

      <div className="relative mt-1.5 h-4">
        <div className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${limitPct}%` }}>
          <div className="mx-auto h-2 w-px bg-gray-400" />
          <span className="whitespace-nowrap text-[11px] font-medium tabular-nums text-gray-500">
            Bank limiti {formatPercent(limit, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
