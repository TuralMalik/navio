"use client";

import { useId, useState } from "react";

/* Ползунок с полем ввода.

   Число справа — редактируемое поле, а не подпись: ползунком неудобно
   попадать в «12 000», а руками неудобно перебирать варианты. Работают оба
   способа, и они синхронизированы.

   Пока поле в фокусе, внешнее значение в него не пишется: иначе набранное
   «1» немедленно превратилось бы в «1» из состояния и цифры терялись бы
   на каждом нажатии. Значение применяется по blur и по Enter. */

export function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  unit = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  unit?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  /* Синхронизация с внешним значением идёт ВО ВРЕМЯ рендера, а не в эффекте.
     Через useEffect получался лишний проход рендера на каждое движение
     ползунка: React рисовал кадр со старым текстом в поле, затем эффект
     ставил новый и заставлял рисовать заново. На перетаскивании это заметно.
     Приём описан в документации React как «adjusting state on prop change». */
  const [syncedValue, setSyncedValue] = useState(value);
  if (!focused && value !== syncedValue) {
    setSyncedValue(value);
    setDraft(String(value));
  }

  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  function commit(raw: string) {
    const n = parseFloat(raw);
    if (Number.isFinite(n)) {
      const clamped = Math.min(max, Math.max(min, Math.round(n / step) * step));
      onChange(clamped);
      setDraft(String(clamped));
    } else {
      // Мусор в поле откатывается к текущему значению, а не к нулю
      setDraft(String(value));
    }
    setFocused(false);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={`${id}-num`} className="text-sm font-semibold text-gray-800">
          {label}
        </label>
        <div className="flex items-baseline gap-1">
          <input
            id={`${id}-num`}
            type="number"
            inputMode="numeric"
            value={draft}
            step={step}
            onFocus={() => setFocused(true)}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit((e.target as HTMLInputElement).value);
              }
            }}
            className="w-24 rounded border-b-2 border-transparent bg-transparent text-right text-base font-bold tabular-nums text-ink transition-colors hover:border-gray-300 focus:border-brand-500"
          />
          {unit && <span className="shrink-0 text-sm text-gray-500">{unit}</span>}
        </div>
      </div>

      {/* accent-color красит бегунок средствами браузера, поэтому не нужен ни
          кастомный thumb, ни ::-webkit-slider-thumb в глобальных стилях. */}
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-brand-600"
        style={{
          background: `linear-gradient(to right, var(--color-brand-600) ${pct}%, var(--color-gray-200) ${pct}%)`,
        }}
      />

      <div className="mt-1 flex justify-between text-xs tabular-nums text-gray-500">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
