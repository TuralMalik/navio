import type { ReactNode } from "react";
import type { Tone } from "@/lib/score-contract";
import { toneStyle } from "@/lib/tone";

/* Чип статуса.

   Цвет заходит на страницу через ДАННЫЕ, а не через украшения: этот
   компонент красится тоном, посчитанным на сервере, и больше нигде цветных
   подложек быть не должно.

   Sentence case. ЗАГЛАВНЫЕ вразрядку запрещены правилами — они читаются как
   рекламная плашка, а не как статус. */

export function Badge({
  tone = "na",
  icon,
  children,
  className = "",
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const s = toneStyle(tone);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.chip} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

/** Нейтральная метка без семантики: «Nümunə», «Yeni». Не для статусов. */
export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 ${className}`}
    >
      {children}
    </span>
  );
}
