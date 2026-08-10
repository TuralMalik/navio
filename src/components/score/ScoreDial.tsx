import type { Tone } from "@/lib/score-contract";

/* Балл — главное число страницы, поэтому он и ведёт: крупная цифра в центре,
   дуга только поддерживает.

   Прежняя дуга заливалась радужным градиентом красный-оранжевый-жёлтый-
   зелёный. Это запрещено правилами, но проблема не только в этом: градиент
   красил ВСЮ дугу независимо от результата, так что у балла 90 под зелёным
   концом всё равно был красный участок. Цвет должен обозначать конкретный
   результат, а не всю шкалу сразу. Теперь дуга одного цвета — того, что
   соответствует тону, посчитанному на сервере.

   Стрелка убрана: она добавляла вторую точку отсчёта (угол) поверх числа,
   которое и так написано в центре. */

const ARC_COLOR: Record<Tone, string> = {
  good: "stroke-emerald-500",
  normal: "stroke-emerald-500",
  attention: "stroke-amber-500",
  risk: "stroke-rose-500",
  high: "stroke-rose-500",
  na: "stroke-gray-300",
};

export function ScoreDial({
  score,
  tone = "na",
  size = "md",
}: {
  score: number;
  tone?: Tone;
  size?: "md" | "lg";
}) {
  const R = 82;
  const CX = 100;
  const CY = 100;
  const arcLength = Math.PI * R;
  const filled = Math.max(0, Math.min(score, 100)) / 100;

  const path = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;
  const numberSize = size === "lg" ? "text-6xl" : "text-5xl";

  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <svg viewBox="0 0 200 116" className="w-full" role="img" aria-label={`${score} bal, maksimum 100`}>
        <path d={path} fill="none" strokeWidth="15" strokeLinecap="round" className="stroke-gray-200" />
        <path
          d={path}
          fill="none"
          strokeWidth="15"
          strokeLinecap="round"
          strokeDasharray={`${filled * arcLength} ${arcLength}`}
          className={ARC_COLOR[tone]}
        />
        {/* Подписей «0» и «100» по краям нет намеренно: они налезали на
            закруглённые концы дуги, а шкалу уже называет подпись под числом.
            Два способа сказать одно и то же — на один больше нужного. */}
      </svg>

      {/* Число выводится HTML-ом, а не <text>: только так к нему применяются
          tabular-nums и настоящий вес шрифта. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center">
        <span className={`${numberSize} font-extrabold leading-none tracking-tight tabular-nums text-ink`}>
          {score}
        </span>
        <span className="mt-1 text-xs font-medium text-gray-500">100 baldan</span>
      </div>
    </div>
  );
}
