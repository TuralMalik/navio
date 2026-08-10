"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Activity, Calculator, FileText, MousePointerClick, Users, Route, Radio,
} from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/scorings", label: "Scorings", icon: Calculator },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/events", label: "Events", icon: MousePointerClick },
  { href: "/admin/sessions", label: "Sessions", icon: MousePointerClick },
  { href: "/admin/visitors", label: "Visitors", icon: Route },
  { href: "/admin/raw", label: "Raw views", icon: Radio },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="px-2 pb-2 flex lg:flex-col gap-0.5 overflow-x-auto">
      {ITEMS.map((item) => {
        // Точное совпадение для /admin, иначе префикс — чтобы вложенные
        // страницы (например /admin/sessions/<id>) подсвечивали свой раздел
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
              active ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}>
            <Icon size={15} className="shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
