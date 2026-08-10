"use client";

import { usePathname } from "next/navigation";
import { Banknote, House, Car } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
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

/** Шапка раздела: хлебные крошки, заголовок активного калькулятора и вкладки.
    Живёт в layout, поэтому при переключении не перерисовывается. */
export function CalcHeader() {
  const pathname = usePathname() ?? "";
  const active = activeTab(pathname);
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
  return (
    <Segmented<TabKey>
      ariaLabel="Kalkulyator növü"
      activeKey={activeTab(pathname).key}
      items={TABS.map((t) => ({ key: t.key, label: t.label, href: t.href, Icon: t.Icon }))}
    />
  );
}
