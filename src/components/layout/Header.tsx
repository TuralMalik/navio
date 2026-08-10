"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { LinkButton, Button } from "@/components/ui/Button";

const navLinks = [
  { label: "Kredit yoxlaması", href: "/az/kredit-yoxlama" },
  { label: "Kredit kalkulyatoru", href: "/az/calculators" },
  { label: "Maliyyə köməkçisi", href: "/az/financial-assistant" },
  { label: "Haqqımızda", href: "/az/about" },
];

/* Три восходящих столбца — знак Navio. Заливка идёт по фирменной шкале
   снизу вверх: рост читается самой формой, а не радужным градиентом.
   Прежний вариант заливался небесно-голубым в фиолетовый, то есть двумя
   цветами, которых в палитре продукта нет вообще. */
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
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  /* Меню закрывается при переходе. Раньше это делал эффект на pathname, но
     он же вызывал лишний рендер на КАЖДОЙ навигации, включая десктоп, где
     меню и так закрыто. Сравнение с предыдущим путём во время рендера
     обходится в одно присваивание и срабатывает только когда есть что
     закрывать. */
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  // Escape закрывает меню. Открытая панель без выхода с клавиатуры — ловушка.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

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
          <Link href="/az" className="flex shrink-0 items-center gap-2.5">
            <Logo />
            <span className="text-lg font-extrabold tracking-tight text-ink">Navio</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(l.href)
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isPending ? (
              // Заглушка ровно той же ширины, что и кнопка входа: иначе шапка
              // дёргается, когда сессия догрузилась.
              <span className="h-9 w-[104px] animate-pulse rounded-lg bg-gray-100" aria-hidden />
            ) : user ? (
              <div className="flex items-center gap-1">
                <Link
                  href="/az/hesabim"
                  className="flex max-w-[170px] items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-ink"
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
              <LinkButton href="/az/login" variant="ghost" size="sm">
                Giriş
              </LinkButton>
            )}
            <LinkButton href="/az/kredit-yoxlama" size="sm">
              İlkin yoxlama
            </LinkButton>
          </div>

          <button
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Menyunu bağla" : "Menyu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2.5 text-[15px] font-medium ${
                  isActive(l.href) ? "bg-brand-50 text-brand-700" : "text-gray-700"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-3">
            {user ? (
              <>
                <Link
                  href="/az/hesabim"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[15px] font-medium text-gray-700"
                >
                  <UserIcon size={16} className="text-gray-400" /> {user.name || user.email}
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  loading={signingOut}
                  icon={<LogOut size={16} />}
                  className="justify-start px-3 text-rose-600 hover:bg-rose-50"
                >
                  Çıxış
                </Button>
              </>
            ) : (
              <LinkButton href="/az/login" variant="secondary" block>
                Giriş
              </LinkButton>
            )}
            <LinkButton href="/az/kredit-yoxlama" block>
              İlkin yoxlama
            </LinkButton>
          </div>
        </div>
      )}
    </header>
  );
}
