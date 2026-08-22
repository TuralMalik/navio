"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ExtraPaymentPlan } from "@/lib/calculators/amortisation";
import { addMonths, monthIndex } from "@/lib/calculators/dates";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, DateField, SelectField, inputClasses } from "@/components/ui/Field";

/* Блок «дополнительные платежи» был скопирован в три калькулятора слово в
   слово. Копии успели разойтись, а правку приходилось вносить трижды.
   Здесь одна реализация, а страницы отличаются только тем, чем реально
   отличаются: составом полей кредита. */

export interface OneTimeRow {
  id: number;
  /** Дата платежа как "YYYY-MM"; в план переводится в порядковый месяц по дате старта. */
  date: string;
  amount: number;
}

export interface ExtraConfig {
  enabled: boolean;
  /** term — сокращаем срок, payment — сокращаем платёж. */
  mode: "term" | "payment";
  /** from/to — даты "YYYY-MM"; to "" означает «до конца кредита». */
  recurring: { enabled: boolean; amount: number; from: string; to: string };
  oneTime: OneTimeRow[];
  penaltyPct: number;
}

export const initialExtraConfig: ExtraConfig = {
  enabled: false,
  mode: "term",
  recurring: { enabled: false, amount: 100, from: "", to: "" },
  oneTime: [{ id: 1, date: "", amount: 0 }],
  penaltyPct: 0,
};

/** Запланирована ли хоть одна реальная доплата. */
export function hasExtra(cfg: ExtraConfig): boolean {
  return cfg.enabled && (cfg.recurring.enabled || cfg.oneTime.some((o) => o.amount > 0));
}

/** Конфиг формы → параметры симуляции. startDate ("YYYY-MM") переводит даты
    разовых доплат в порядковый месяц. */
export function toPlan(cfg: ExtraConfig, months: number, startDate: string): ExtraPaymentPlan | undefined {
  if (!hasExtra(cfg)) return undefined;
  // Дата "YYYY-MM" → номер месяца кредита в пределах [1, months].
  const toMonthNo = (date: string, fallback: number) => {
    const i = monthIndex(startDate, date);
    return i != null ? Math.min(Math.max(i, 1), months) : fallback;
  };

  return {
    recurring: cfg.recurring.enabled
      ? {
          amount: cfg.recurring.amount,
          fromMonth: toMonthNo(cfg.recurring.from, 1),
          toMonth: cfg.recurring.to === "" ? months : toMonthNo(cfg.recurring.to, months),
        }
      : undefined,
    oneTime: cfg.oneTime
      .map((o) => ({ month: monthIndex(startDate, o.date), amount: o.amount }))
      .filter((o): o is { month: number; amount: number } =>
        o.amount > 0 && o.month != null && o.month >= 1 && o.month <= months,
      ),
    penaltyPct: cfg.penaltyPct,
    mode: cfg.mode,
  };
}

const PENALTIES = [0, 1, 2, 3, 5];

export function ExtraPayments({
  months,
  startDate,
  value,
  onChange,
}: {
  months: number;
  /** Дата начала кредита ("YYYY-MM") — привязка дат разовых доплат. */
  startDate: string;
  value: ExtraConfig;
  onChange: (next: ExtraConfig) => void;
}) {
  const set = (patch: Partial<ExtraConfig>) => onChange({ ...value, ...patch });
  const setRecurring = (patch: Partial<ExtraConfig["recurring"]>) =>
    onChange({ ...value, recurring: { ...value.recurring, ...patch } });

  const updateOneTime = (id: number, patch: Partial<OneTimeRow>) =>
    onChange({ ...value, oneTime: value.oneTime.map((o) => (o.id === id ? { ...o, ...patch } : o)) });

  const addOneTime = () =>
    onChange({ ...value, oneTime: [...value.oneTime, { id: Date.now(), date: "", amount: 0 }] });

  // Границы календаря доплат: от старта до последнего месяца кредита.
  const lastMonth = startDate && months > 0 ? addMonths(startDate, months - 1) : undefined;

  const removeOneTime = (id: number) =>
    onChange({ ...value, oneTime: value.oneTime.filter((o) => o.id !== id) });

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">Əlavə ödənişlər planlaşdırırsınız?</h2>
          <p className="mt-0.5 text-xs text-gray-600">
            Krediti daha tez bağlamaq və ya aylıq ödənişi azaltmaq üçün.
          </p>
        </div>
        {/* Сегментированный переключатель, а не две кнопки: заливка фирменным
            цветом означает «главное действие экрана», и на «Xeyr» она читалась
            как совет отказаться от доплат. Выбранное состояние обозначается
            подложкой, а не акцентом. */}
        <div role="group" aria-label="Əlavə ödənişlər" className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          {([
            { on: false, label: "Xeyr" },
            { on: true, label: "Bəli" },
          ] as const).map((opt) => (
            <button
              key={opt.label}
              type="button"
              aria-pressed={value.enabled === opt.on}
              onClick={() => set({ enabled: opt.on })}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                value.enabled === opt.on ? "bg-white text-brand-700 shadow-card" : "text-gray-600 hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Панель раскрывается плавно, тем же приёмом, что и вопросы:
          grid-template-rows 0fr → 1fr. Раньше она появлялась мгновенно, и
          карточка под ней прыгала на несколько сотен пикселей. */}
      <div
        inert={!value.enabled}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          value.enabled ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={value.recurring.enabled}
                onChange={(e) => setRecurring({ enabled: e.target.checked })}
                className="h-[18px] w-[18px] accent-brand-600"
              />
              Daimi əlavə ödəniş istifadə edilsin?
            </label>

            {value.recurring.enabled && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Aylıq əlavə məbləğ" htmlFor="rec-amount">
                  <input
                    id="rec-amount"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className={inputClasses()}
                    value={value.recurring.amount || ""}
                    onChange={(e) => setRecurring({ amount: parseInt(e.target.value, 10) || 0 })}
                  />
                </Field>
                <DateField
                  label="Hansı tarixdən başlasın"
                  id="rec-from"
                  value={value.recurring.from}
                  onChange={(v) => setRecurring({ from: v })}
                  min={startDate || undefined}
                  max={lastMonth}
                />
                <DateField
                  label="Hansı tarixə qədər"
                  id="rec-to"
                  hint="Boş: kredit bitənə qədər"
                  value={value.recurring.to}
                  onChange={(v) => setRecurring({ to: v })}
                  min={value.recurring.from || startDate || undefined}
                  max={lastMonth}
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-ink">Birdəfəlik əlavə ödənişlər</h3>
            <div className="space-y-3">
              {value.oneTime.map((op) => (
                <div key={op.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                  <DateField
                    label="Ödəniş tarixi"
                    id={`ot-d-${op.id}`}
                    value={op.date}
                    onChange={(v) => updateOneTime(op.id, { date: v })}
                    min={startDate || undefined}
                    max={lastMonth}
                  />
                  <Field label="Məbləğ (₼)" htmlFor={`ot-a-${op.id}`}>
                    <input
                      id={`ot-a-${op.id}`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className={inputClasses()}
                      value={op.amount || ""}
                      onChange={(e) => updateOneTime(op.id, { amount: parseInt(e.target.value, 10) || 0 })}
                    />
                  </Field>
                  <Button
                    variant="ghost"
                    onClick={() => removeOneTime(op.id)}
                    aria-label="Ödənişi sil"
                    // Единственная кнопка удаления не должна исчезать: строка
                    // всё равно нужна форме, а пустой список рвал бы вёрстку
                    disabled={value.oneTime.length === 1}
                    className="px-3 text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                    icon={<Trash2 size={16} />}
                  />
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={addOneTime} icon={<Plus size={15} />} className="mt-3 px-0">
              Ödəniş əlavə et
            </Button>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <SelectField
              label="Erkən ödəniş kompensasiyası"
              id="penalty"
              hint="Bankın erkən bağlamaya görə tutduğu faiz. Müqavilədə göstərilir."
              className="max-w-xs"
              value={value.penaltyPct}
              onChange={(e) => set({ penaltyPct: Number(e.target.value) })}
            >
              {PENALTIES.map((p) => (
                <option key={p} value={p}>{p}%</option>
              ))}
            </SelectField>
          </div>

          <fieldset className="rounded-xl border border-gray-200 p-4">
            <legend className="px-1 text-sm font-bold text-ink">Əlavə ödənişdən sonra nə azalsın?</legend>
            {/* Эмодзи убраны: ⏱️ и 💸 не несли смысла сверх подписи и в роли
                иконок запрещены. Выбор читается текстом. */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  { key: "term", label: "Müddət azalsın", note: "Aylıq ödəniş eyni qalır" },
                  { key: "payment", label: "Aylıq ödəniş azalsın", note: "Müddət eyni qalır" },
                ] as const
              ).map((opt) => {
                const on = value.mode === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set({ mode: opt.key })}
                    /* no-scale: это карточки-варианты, а не кнопки. Отклик
                       даёт рамка и фон, размер не трогаем. */
                    className={`no-scale rounded-lg border p-3 text-left transition-colors ${
                      on ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`block text-sm font-semibold ${on ? "text-brand-700" : "text-ink"}`}>
                      {opt.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-600">{opt.note}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          </div>
        </div>
      </div>
    </Card>
  );
}
