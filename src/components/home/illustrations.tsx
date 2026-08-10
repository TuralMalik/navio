import { Check, RefreshCw } from "lucide-react";

/* Мини-сцены для плиток на главной.

   Это не украшение ради украшения: каждая показывает НАСТОЯЩИЙ вывод
   соответствующего инструмента (балл и проверки, сравнение сценариев
   платежа, ответ базы знаний). Ровно тот приём, на котором построены плитки
   у Mənzil: посетитель видит продукт до того, как что-то нажал.

   Только SVG и CSS: ни одной картинки и ни грамма JS. Анимации живут в
   globals.css с префиксом nv-, все под общим prefers-reduced-motion.

   Цвета взяты из палитры: акцент фирменный, «хорошо» изумрудное. В прошлой
   версии пузырь вопроса был сиреневым (#F1EBFE), то есть цветом, которого в
   продукте нет вообще. */

function Well({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col justify-center rounded-2xl border border-gray-200 bg-gray-50 p-4"
    >
      {children}
    </div>
  );
}

/** Проверка кредитного профиля: кольцо балла, вердикт, список проверок. */
export function CreditCheckScene() {
  const rows = ["Borc yükü hesablanır", "Risk faktorları yoxlanılır", "Banklara sorğu göndərilmir"];
  return (
    <Well>
      <div className="mb-3 flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 64 64" width="64" height="64">
            <circle cx="32" cy="32" r="26" fill="none" className="stroke-gray-200" strokeWidth="6" />
            <circle
              className="nv-cc-arc stroke-emerald-500"
              cx="32"
              cy="32"
              r="26"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="163.4"
              transform="rotate(-90 32 32)"
            />
          </svg>
          <span className="nv-cc-num absolute inset-0 grid place-items-center text-[17px] font-extrabold tabular-nums text-ink">
            72
          </span>
        </div>
        <div>
          <p className="text-[13px] font-bold text-ink">Kredit profili</p>
          <span className="nv-cc-chip mt-1 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
            Yaxşı şans
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <div
            key={r}
            className="nv-cc-row flex items-center gap-2 text-[12px] text-gray-600"
            style={{ animationDelay: `${0.25 + i * 0.35}s` }}
          >
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Check size={10} strokeWidth={3} />
            </span>
            {r}
          </div>
        ))}
      </div>
    </Well>
  );
}

/** Калькулятор: два сценария доплаты и меняющийся ежемесячный платёж. */
export function CalculatorScene() {
  const values = ["280 ₼", "245 ₼", "310 ₼"];
  return (
    <Well>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="nv-calc-a rounded-xl border p-2.5 text-center">
          <p className="text-[11.5px] font-bold leading-snug text-ink">Aylıq ödənişi azalt</p>
        </div>
        <div className="nv-calc-b rounded-xl border p-2.5 text-center">
          <p className="text-[11.5px] font-bold leading-snug text-ink">Müddəti azalt</p>
        </div>
      </div>

      <div className="relative mb-3.5 h-1.5 rounded-full bg-gray-200">
        <span className="nv-calc-dot absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600" />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
        <span className="flex items-center gap-1.5 text-[12px] text-gray-600">
          <RefreshCw size={13} className="nv-calc-refresh text-brand-600" /> Aylıq ödəniş
        </span>
        {/* Значения лежат друг на друге и сменяются по очереди: высота строки
            не скачет, поэтому карточка не «дышит» вместе с числом. */}
        <span className="relative inline-block h-[18px] w-[52px] text-right text-[14px] font-extrabold tabular-nums text-ink">
          {values.map((v, i) => (
            <span key={v} className="nv-val absolute right-0" style={{ animationDelay: `${i * 1.333}s` }}>
              {v}
            </span>
          ))}
        </span>
      </div>
    </Well>
  );
}

/** База знаний: вопрос, набор ответа, ответ. */
export function AssistantScene() {
  return (
    <Well>
      <div className="nv-q mb-2 flex justify-start">
        <span className="max-w-[85%] rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-3 py-2 text-[12px] leading-snug text-ink">
          Gecikməm varsa, bank nə edə bilər?
        </span>
      </div>

      <div className="nv-typing mb-2 flex justify-end">
        <span className="flex items-center gap-1 rounded-2xl bg-brand-50 px-3 py-2.5">
          <span className="nv-dot1 h-1.5 w-1.5 rounded-full bg-brand-600" />
          <span className="nv-dot2 h-1.5 w-1.5 rounded-full bg-brand-600" />
          <span className="nv-dot3 h-1.5 w-1.5 rounded-full bg-brand-600" />
        </span>
      </div>

      <div className="nv-a flex justify-end">
        <span className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-50 px-3 py-2 text-[12px] leading-snug text-ink">
          Əvvəlcə xatırlatma gəlir, sonra cərimə tətbiq oluna bilər.
        </span>
      </div>
    </Well>
  );
}
