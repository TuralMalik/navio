"use client";

import { usePathname } from "next/navigation";
import { Banknote, House, Car } from "lucide-react";
import { Segmented } from "@/components/ui/Segmented";

/* Переключатель калькуляторов.

   Пришёл на смену странице-списку «выберите калькулятор». Та страница была
   лишним кликом: она ничего не считала и не сообщала ничего, чего нет в
   самом калькуляторе. Ссылки здесь настоящие (три индексируемых URL), но
   переключение читается как вкладки. Сам контрол общий с кредит-чеком. */

const TABS = [
  { key: "consumer", label: "İstehlak", h1: "İstehlak krediti kalkulyatoru", href: "/az/calculators/consumer-loan", Icon: Banknote },
  { key: "mortgage", label: "İpoteka", h1: "İpoteka kalkulyatoru", href: "/az/calculators/mortgage", Icon: House },
  { key: "auto", label: "Avtokredit", h1: "Avtokredit kalkulyatoru", href: "/az/calculators/auto-loan", Icon: Car },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function activeTab(pathname: string) {
  return TABS.find((t) => pathname.startsWith(t.href)) ?? TABS[0];
}

/* Шапка раздела: заголовок и вкладки в ОДНУ строку.

   Было три этажа, и все три говорили одно и то же: крошки «Ana səhifə ›
   İstehlak», заголовок «İstehlak krediti kalkulyatoru» и активная вкладка
   «İstehlak». Слово «İstehlak» повторялось трижды подряд, и на это уходила
   белая полоса высотой почти в треть экрана — на каждом калькуляторе.

   Крошки убраны: все калькуляторы лежат на один шаг от главной, а «сейчас
   выбран İstehlak» и так написано на вкладке. Отдельной белой подложки тоже
   нет, шапка живёт на общем фоне и не режет страницу пополам. */
export function CalcHeader() {
  const pathname = usePathname() ?? "";
  const active = activeTab(pathname);
  return (
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pt-6 sm:px-6">
      <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{active.h1}</h1>
      <CalcNav />
    </div>
  );
}

export function CalcNav() {
  const pathname = usePathname() ?? "";
  return (
    <Segmented<TabKey>
      ariaLabel="Kalkulyator növü"
      activeKey={activeTab(pathname).key}
      items={TABS.map((t) => ({ key: t.key, label: t.label, href: t.href, Icon: t.Icon }))}
    />
  );
}
