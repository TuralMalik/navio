import type { Tone } from "@/lib/score-contract";

/* Единственное место, где тон превращается в цвет.

   Тон приходит с сервера уже посчитанным (см. score-contract): компонент не
   решает, что такое «хорошо», он только красит. Раньше каждая страница
   держала свою копию этой карты, и они разошлись: один и тот же уровень
   риска был где-то янтарным, где-то красным.

   Семантика зафиксирована и выучена пользователем, её нельзя перетасовывать:
   зелёный — проходит, янтарный — на грани, розовый — не проходит,
   серый — неизвестно или неприменимо. */

export interface ToneStyle {
  /** Текст на светлом фоне: заголовок фактора, значение метрики. */
  text: string;
  /** Чип/бейдж: фон, текст и рамка одним классом. */
  chip: string;
  /** Заливка полосы прогресса или индикатора. */
  fill: string;
  /** Мягкая подложка блока (используется редко и только для данных). */
  surface: string;
}

const STYLES: Record<Tone, ToneStyle> = {
  good: {
    text: "text-emerald-700",
    chip: "bg-emerald-50 text-emerald-800 border-emerald-200",
    fill: "bg-emerald-500",
    surface: "bg-emerald-50 border-emerald-200",
  },
  normal: {
    text: "text-emerald-700",
    chip: "bg-emerald-50 text-emerald-800 border-emerald-200",
    fill: "bg-emerald-500",
    surface: "bg-emerald-50 border-emerald-200",
  },
  attention: {
    text: "text-amber-700",
    chip: "bg-amber-50 text-amber-900 border-amber-200",
    fill: "bg-amber-500",
    surface: "bg-amber-50 border-amber-200",
  },
  risk: {
    text: "text-rose-700",
    chip: "bg-rose-50 text-rose-800 border-rose-200",
    fill: "bg-rose-500",
    surface: "bg-rose-50 border-rose-200",
  },
  high: {
    text: "text-rose-700",
    chip: "bg-rose-50 text-rose-800 border-rose-200",
    fill: "bg-rose-500",
    surface: "bg-rose-50 border-rose-200",
  },
  na: {
    text: "text-gray-500",
    chip: "bg-gray-100 text-gray-700 border-gray-200",
    fill: "bg-gray-300",
    surface: "bg-gray-50 border-gray-200",
  },
};

export function toneStyle(tone: Tone | null | undefined): ToneStyle {
  return STYLES[tone ?? "na"] ?? STYLES.na;
}
