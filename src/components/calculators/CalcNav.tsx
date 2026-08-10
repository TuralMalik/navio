"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Banknote, House, Car } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

/* Переключатель калькуляторов.

   Пришёл на смену странице-списку «выберите калькулятор». Та страница была
   лишним кликом: она ничего не считала и не сообщала ничего, чего нет в
   самом калькуляторе. Здесь ссылки настоящие (три индексируемых URL), но
   переключение читается как вкладки, а не как уход на другую страницу.

   Подложка активной вкладки ЕДЕТ к выбранной, а не перепрыгивает: глаз
   успевает проследить, куда именно он попал. Позиция измеряется по самому
   элементу, поэтому смена сетки на узком экране её не роняет. */

const TABS = [
  { href: "/az/calculators/consumer-loan", label: "İstehlak", h1: "İstehlak krediti kalkulyatoru", Icon: Banknote },
  { href: "/az/calculators/mortgage", label: "İpoteka", h1: "İpoteka kalkulyatoru", Icon: House },
  { href: "/az/calculators/auto-loan", label: "Avtokredit", h1: "Avtokredit kalkulyatoru", Icon: Car },
];

/** Шапка раздела: хлебные крошки, заголовок активного калькулятора и вкладки.
    Живёт в layout, поэтому при переключении не перерисовывается и вкладки не
    моргают. */
export function CalcHeader() {
  const pathname = usePathname() ?? "";
  const active = TABS.find((t) => pathname.startsWith(t.href)) ?? TABS[0];
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-5 sm:px-6">
        <Breadcrumbs trail={[{ href: "/az", label: "Ana səhifə" }]} current={active.label} />
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{active.h1}</h1>
        <div className="mt-4">
          <CalcNav />
        </div>
      </div>
    </div>
  );
}

export function CalcNav() {
  const pathname = usePathname() ?? "";
  const activeIdx = Math.max(0, TABS.findIndex((t) => pathname.startsWith(t.href)));

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [thumb, setThumb] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const measure = useCallback(() => {
    const el = tabRefs.current[activeIdx];
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

  return (
    <div
      ref={wrapRef}
      className="relative inline-grid w-full max-w-md grid-cols-3 gap-1 rounded-xl border border-gray-200 bg-white p-1 sm:w-auto"
    >
      {thumb && (
        <span
          aria-hidden
          className="absolute left-0 top-0 rounded-lg bg-brand-600 transition-[translate,width,height] duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{ translate: `${thumb.x}px ${thumb.y}px`, width: thumb.w, height: thumb.h }}
        />
      )}
      {TABS.map((tab, i) => {
        const active = i === activeIdx;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            ref={(el) => { tabRefs.current[i] = el; }}
            aria-current={active ? "page" : undefined}
            className={`no-scale relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              active ? "text-white" : "text-gray-600 hover:text-ink"
            }`}
          >
            <tab.Icon size={15} aria-hidden />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
