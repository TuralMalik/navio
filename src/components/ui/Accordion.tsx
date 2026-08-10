"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

/* Раскрывающийся вопрос.

   Ответ ВСЕГДА присутствует в разметке и только схлопывается по высоте, а не
   удаляется из DOM. Причина не косметическая: это база знаний, и её ответы
   должны попадать в HTML, который видит поисковик. Прежняя версия рендерила
   ответ через {open && ...}, то есть для краулера страница состояла из одних
   заголовков.

   Схлопывание сделано через grid-template-rows: 0fr → 1fr. Это единственный
   способ анимировать переход к высоте содержимого, не зная её заранее и не
   измеряя её скриптом (max-height с запасом даёт рваную анимацию у коротких
   ответов и обрезает длинные). */

export function Accordion({
  id,
  question,
  meta,
  open,
  onToggle,
  children,
}: {
  id: string;
  question: string;
  meta?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50"
      >
        <span className="flex-1">
          <span className="block text-sm font-semibold leading-snug text-ink">{question}</span>
          {meta && <span className="mt-0.5 block text-xs text-gray-500">{meta}</span>}
        </span>
        <ChevronDown
          size={16}
          aria-hidden
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* inert, пока закрыто: содержимое остаётся в разметке (ради поиска),
          но не ловит фокус. Без этого Tab уходил бы в ссылку внутри
          свёрнутого ответа, и фокус пропадал бы с экрана. */}
      <div
        id={id}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
