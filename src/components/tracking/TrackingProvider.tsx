"use client";

/* Монтирует трекер: просмотр на каждую навигацию, хартбит вовлечённости,
   авто-захват кликов и отправок форм.

   Ставится один раз в layout. Сам ничего не рисует. */

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  canonicalisePath, trackPageview, trackHeartbeat, trackPageEnd, setVisibilityActive,
} from "@/lib/tracking/tracking";
import { installAutoCapture, resetAutoCaptureBudget } from "@/lib/tracking/auto-capture";

/** Как часто сливать вовлечённое время. 15 с — компромисс между точностью
   и числом запросов: при уходе со страницы остаток добирает pagehide. */
const HEARTBEAT_MS = 15_000;

/* Разделы, которые не трекаем.
   Админка — в первую очередь: она читает эту же статистику, и собственные
   переходы по дашборду попадали в цифры, которые по нему же и смотрят.
   Просмотр отчёта не должен менять отчёт. */
const IGNORED_PREFIXES = ["/admin"];

function isIgnored(pathname: string): boolean {
  return IGNORED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function TrackingInner() {
  const pathname = usePathname();
  // Подписка на search params нужна, чтобы UTM-метки попали в первый просмотр
  useSearchParams();
  const previousPath = useRef<string | null>(null);
  const ignored = !pathname || isIgnored(pathname);

  // Просмотр на каждую смену пути
  useEffect(() => {
    if (!pathname || isIgnored(pathname)) return;
    const path = canonicalisePath(pathname);
    resetAutoCaptureBudget();
    trackPageview(path, previousPath.current);
    previousPath.current = path;
  }, [pathname]);

  // Хартбит + видимость + финальный слив
  useEffect(() => {
    if (ignored) return;
    const timer = setInterval(() => trackHeartbeat(), HEARTBEAT_MS);

    const onVisibility = () => setVisibilityActive(document.visibilityState === "visible");
    const onPageHide = () => trackPageEnd();

    document.addEventListener("visibilitychange", onVisibility);
    // pagehide, а не beforeunload: он срабатывает и при переходе в кэш назад/вперёд
    window.addEventListener("pagehide", onPageHide);

    const uninstall = installAutoCapture();

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      uninstall();
      // Размонтирование провайдера — тоже конец визита
      trackPageEnd();
    };
  }, [ignored]);

  return null;
}

export function TrackingProvider() {
  // useSearchParams требует Suspense-границы, иначе вся страница уходит в
  // client-side rendering. Провайдер ничего не рисует — пустой fallback безопасен.
  return (
    <Suspense fallback={null}>
      <TrackingInner />
    </Suspense>
  );
}
