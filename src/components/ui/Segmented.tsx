"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/* Один переключатель на всё приложение.

   Раньше их было два: вкладки калькуляторов (ссылки, едущая заливка) и
   Bank/BOKT в кредит-чеке (кнопки, мгновенное перекрашивание). Выглядели
   по-разному и вели себя по-разному, хотя делают одно и то же — выбирают
   режим. Теперь это один компонент в двух вариантах: со ссылками, когда
   выбор меняет URL, и с кнопками, когда меняет только состояние.

   Заливка ЕДЕТ к выбранному пункту, а не перепрыгивает: глаз успевает
   проследить, куда он попал. Позиция измеряется по самому элементу, поэтому
   перестроение сетки на узком экране её не роняет. */

export interface SegmentedItem<K extends string> {
  key: K;
  label: string;
  Icon?: LucideIcon;
  /** Задан — пункт рендерится ссылкой (выбор меняет URL). */
  href?: string;
}

export function Segmented<K extends string>({
  items,
  activeKey,
  onSelect,
  ariaLabel,
  className = "",
}: {
  items: SegmentedItem<K>[];
  activeKey: K;
  onSelect?: (key: K) => void;
  ariaLabel: string;
  className?: string;
}) {
  const activeIdx = Math.max(0, items.findIndex((i) => i.key === activeKey));

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [thumb, setThumb] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const measure = useCallback(() => {
    const el = itemRefs.current[activeIdx];
    if (!el) return;
    setThumb({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
  }, [activeIdx]);

  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [measure]);

  const isLinks = items.some((i) => i.href);

  return (
    <div
      ref={wrapRef}
      role={isLinks ? undefined : "tablist"}
      aria-label={ariaLabel}
      className={`relative inline-flex rounded-xl border border-gray-200 bg-white p-1 ${className}`}
    >
      {thumb && (
        <span
          aria-hidden
          className="absolute left-0 top-0 rounded-lg bg-brand-600 transition-[translate,width,height] duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{ translate: `${thumb.x}px ${thumb.y}px`, width: thumb.w, height: thumb.h }}
        />
      )}

      {items.map((item, i) => {
        const active = i === activeIdx;
        /* z-10: подпись должна лежать НАД едущей заливкой, иначе на время
           перехода она пропадает под ней.

           Подложка на ховере только у НЕактивного пункта: у активного под ним
           уже лежит фирменная заливка, и второй фон поверх неё её бы закрыл. */
        const cls =
          `no-scale relative z-10 flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg ` +
          `px-4 py-2 text-sm font-semibold transition-colors ${
            active ? "text-white" : "text-gray-600 hover:bg-gray-100 hover:text-ink"
          }`;
        const inner = (
          <>
            {item.Icon && <item.Icon size={15} aria-hidden />}
            {item.label}
          </>
        );

        return item.href ? (
          <Link
            key={item.key}
            href={item.href}
            ref={(el) => { itemRefs.current[i] = el; }}
            aria-current={active ? "page" : undefined}
            className={cls}
          >
            {inner}
          </Link>
        ) : (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            ref={(el) => { itemRefs.current[i] = el; }}
            onClick={() => onSelect?.(item.key)}
            className={cls}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
