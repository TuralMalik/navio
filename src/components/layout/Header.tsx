"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { LinkButton, Button } from "@/components/ui/Button";

/* Навигация в шапке — только для широких экранов.

   Гамбургер и выпадающее меню отсюда убраны: на телефоне навигация переехала
   вниз, в MobileTabBar. Держать оба входа сразу означало бы два разных
   способа попасть в одно и то же место и две реализации одного меню. */

const navLinks = [
  { label: "Kredit yoxlaması", href: "/az/kredit-yoxlama" },
  { label: "Kredit kalkulyatoru", href: "/az/calculators" },
  { label: "Maliyyə köməkçisi", href: "/az/financial-assistant" },
  { label: "Haqqımızda", href: "/az/about" },
];

/* Три восходящих столбца — знак Navio. Заливка идёт по фирменной шкале
   снизу вверх: рост читается самой формой, а не радужным градиентом. */
function Logo() {
  return (
    <svg width="34" height="33" viewBox="0 0 104 100" fill="none" aria-hidden="true">
      <path d="M 5,70 L 27,55 Q 33,55 33,61 L 33,88 Q 33,94 27,94 L 11,94 Q 5,94 5,88 Z" className="fill-brand-300" />
      <path d="M 38,48 L 60,33 Q 66,33 66,39 L 66,88 Q 66,94 60,94 L 44,94 Q 38,94 38,88 Z" className="fill-brand-500" />
      <path d="M 71,20 L 93,5 Q 99,5 99,11 L 99,88 Q 99,94 93,94 L 77,94 Q 71,94 71,88 Z" className="fill-brand-600" />
    </svg>
  );
}

export function Header() {
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    window.location.assign("/az");
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/az" className="no-scale flex shrink-0 items-center gap-2.5">
            <Logo />
            <span className="text-lg font-extrabold tracking-tight text-ink">Navio</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`no-scale rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(l.href) ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isPending ? (
              // Заглушка ровно той же ширины, что и кнопка входа: иначе шапка
              // дёргается, когда сессия догрузилась.
              <span className="hidden h-9 w-[104px] animate-pulse rounded-lg bg-gray-100 md:block" aria-hidden />
            ) : user ? (
              <div className="hidden items-center gap-1 md:flex">
                <Link
                  href="/az/hesabim"
                  className="no-scale flex max-w-[170px] items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-ink"
                >
                  <UserIcon size={15} className="shrink-0 text-gray-400" />
                  <span className="truncate">{user.name || user.email}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  loading={signingOut}
                  aria-label="Çıxış"
                  className="px-2 text-gray-500 hover:text-rose-600"
                  icon={signingOut ? undefined : <LogOut size={16} />}
                />
              </div>
            ) : (
              <LinkButton href="/az/login" variant="ghost" size="sm" className="hidden md:inline-flex">
                Giriş
              </LinkButton>
            )}

            {/* Главное действие остаётся в шапке и на телефоне: нижняя панель
                отвечает за навигацию, а не за призыв к действию. */}
            <LinkButton href="/az/kredit-yoxlama" size="sm">
              İlkin yoxlama
            </LinkButton>
          </div>
        </div>
      </div>
    </header>
  );
}
