"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Gauge, Calculator, MoreHorizontal, BookOpen, Info, Shield, FileText,
  User as UserIcon, LogIn, LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { BottomSheet } from "@/components/ui/BottomSheet";

/* Нижняя панель навигации для телефона.

   Заменила гамбургер в шапке. Гамбургер прятал всю навигацию за одним
   безымянным значком в дальнем верхнем углу — самой неудобной точке экрана
   для большого пальца. Здесь основные разделы видны всегда и лежат внизу,
   там, где до них дотягиваются.

   Четыре раздела плюс «Daha çox». Больше не влезает: на 360-пиксельном
   экране пятая иконка начинает поджимать подписи. Всё, что не получило
   места, живёт в шторке и находится в один тап.

   pb-[env(safe-area-inset-bottom)] поднимает иконки над домашней полосой
   iPhone, иначе нижний ряд оказывается под ней. */

const TABS = [
  { href: "/az", label: "Ana səhifə", Icon: Home, exact: true },
  { href: "/az/kredit-yoxlama", label: "Yoxlama", Icon: Gauge },
  { href: "/az/calculators", label: "Kalkulyator", Icon: Calculator },
  { href: "/az/financial-assistant", label: "Köməkçi", Icon: BookOpen },
];

/** Разделы без своего места в панели: по ним подсвечивается «Daha çox». */
const MORE_ROUTES = ["/az/about", "/az/privacy", "/az/disclaimer", "/az/hesabim", "/az/login", "/az/register"];

export function MobileTabBar() {
  const pathname = usePathname() ?? "";
  const [moreOpen, setMoreOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;

  /* Переход закрывает шторку: иначе она остаётся поверх новой страницы.
     Сравнение во время рендера, а не эффект: эффект давал бы лишний рендер
     на каждой навигации, включая те, когда шторка и так закрыта. */
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (moreOpen) setMoreOpen(false);
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const moreActive = MORE_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    window.location.assign("/az");
  }

  const sheetLink =
    "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-ink hover:bg-gray-50";

  return (
    <>
      <nav
        aria-label="Əsas naviqasiya"
        className="fixed inset-x-0 bottom-0 z-[1100] border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="grid grid-cols-5">
          {TABS.map((tab) => {
            const active = isActive(tab.href, tab.exact);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                // no-scale: подпись под иконкой при масштабировании дрожит
                className={`no-scale flex min-w-0 flex-col items-center gap-1 px-1 py-2 ${
                  active ? "text-brand-700" : "text-gray-500"
                }`}
              >
                <tab.Icon size={20} aria-hidden strokeWidth={active ? 2.4 : 2} />
                <span className="w-full truncate text-center text-[11px] font-semibold">{tab.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            className={`no-scale flex min-w-0 flex-col items-center gap-1 px-1 py-2 ${
              moreActive ? "text-brand-700" : "text-gray-500"
            }`}
          >
            <MoreHorizontal size={20} aria-hidden />
            <span className="w-full truncate text-center text-[11px] font-semibold">Daha çox</span>
          </button>
        </div>
      </nav>

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Daha çox">
        <div className="pb-2">
          {user ? (
            <>
              <Link href="/az/hesabim" className={sheetLink}>
                <UserIcon size={18} className="text-gray-400" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{user.name || user.email}</span>
              </Link>
              <button type="button" onClick={handleSignOut} disabled={signingOut} className={`${sheetLink} w-full text-left text-rose-600`}>
                <LogOut size={18} aria-hidden />
                Çıxış
              </button>
            </>
          ) : (
            <Link href="/az/login" className={sheetLink}>
              <LogIn size={18} className="text-gray-400" aria-hidden />
              Giriş / Qeydiyyat
            </Link>
          )}

          <div className="my-2 h-px bg-gray-200" />

          <Link href="/az/about" className={sheetLink}>
            <Info size={18} className="text-gray-400" aria-hidden /> Haqqımızda
          </Link>
          <Link href="/az/privacy" className={sheetLink}>
            <Shield size={18} className="text-gray-400" aria-hidden /> Məxfilik siyasəti
          </Link>
          <Link href="/az/disclaimer" className={sheetLink}>
            <FileText size={18} className="text-gray-400" aria-hidden /> İmtina bəyanatı
          </Link>
        </div>
      </BottomSheet>
    </>
  );
}
