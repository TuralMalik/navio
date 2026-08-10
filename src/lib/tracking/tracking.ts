"use client";

/* Первопартийный трекер просмотров и вовлечённости.

   Контракт:
   • trackPageview(path, referrerPath) — новый просмотр, сбрасывает таймер
   • trackHeartbeat()                  — сбрасывает накопленное время на сервер
   • trackPageEnd()                    — финальный sendBeacon на pagehide
   • trackEvent(name, props)           — дискретное событие

   Время считается как «вкладка видима», а не астрономическое: свёрнутая на час
   вкладка не должна раздувать среднее время на странице. Клиент копит мс в
   памяти и на каждом хартбите пишет НАКОПЛЕННЫЙ ИТОГ в ту же строку — поэтому
   один визит не превращается в сотни строк-пингов.

   Сессия: localStorage, при простое 30 минут выдаётся новая (так же считают
   сессии почти все аналитические системы, чтобы цифры были сравнимы). */

import { getClientId } from "./client-id";

const SESSION_KEY = "navio_track_session";
const SESSION_IDLE_MS = 30 * 60 * 1000;
const MAX_DURATION_MS = 60 * 60 * 1000; // зеркало серверного потолка

interface StoredSession {
  id: string;
  lastActivity: number;
}

interface ActiveVisit {
  sessionId: string;
  path: string;
  /** Накопленное вовлечённое время с момента показа страницы. */
  durationMs: number;
  /** Момент последнего перехода в состояние «видима». */
  visibleSince: number;
  isActive: boolean;
}

let active: ActiveVisit | null = null;

/* Защита от двойной отправки одного просмотра.
   React в dev монтирует эффекты дважды, а любой лишний ререндер провайдера
   выстрелил бы вторым просмотром того же пути. Дубли раздувают ВСЁ: просмотры,
   сессии, среднее время. Один и тот же путь повторно шлём только после паузы —
   реальный повторный вход (обновление страницы) в это окно не попадает. */
const DUPLICATE_WINDOW_MS = 1500;
let lastSent: { path: string; at: number } | null = null;

function uuid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* ниже */
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && typeof p.id === "string" && typeof p.lastActivity === "number") return p as StoredSession;
  } catch {
    /* ignore */
  }
  return null;
}

function writeSession(s: StoredSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* квота/приватный режим — просмотр всё равно отправится */
  }
}

function detectClientSource(): string {
  try {
    if (window.matchMedia?.("(display-mode: standalone)").matches) return "pwa";
    if ((window.navigator as Navigator & { standalone?: boolean }).standalone) return "pwa";
  } catch {
    /* ignore */
  }
  return "web";
}

/** Путь без префикса локали: /az/kredit-yoxlama → /kredit-yoxlama. */
export function canonicalisePath(pathname: string): string {
  const stripped = pathname.replace(/^\/az(?=\/|$)/, "") || "/";
  return stripped.slice(0, 200);
}

/* Отправка «выстрелил и забыл»: аналитика никогда не должна ломать UX и
   никогда не должна задерживать навигацию. */
function post(endpoint: string, body: Record<string, unknown>, useBeacon = false): void {
  const url = `/api/track/${endpoint}`;
  const json = JSON.stringify({ ...body, clientSource: detectClientSource(), clientId: getClientId() });

  if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
    try {
      // На pagehide keepalive-fetch некоторые браузеры отбрасывают, sendBeacon — нет
      if (navigator.sendBeacon(url, new Blob([json], { type: "application/json" }))) return;
    } catch {
      /* падаем в fetch */
    }
  }

  try {
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* тишина */
  }
}

/** Один просмотр страницы; сбрасывает таймер вовлечённости. */
export function trackPageview(path: string, referrerPath: string | null): void {
  if (typeof window === "undefined") return;

  const nowTs = Date.now();
  // Тот же путь только что отправлен — это дубль от повторного монтирования,
  // а не второй заход. Таймер вовлечённости при этом не сбрасываем.
  if (lastSent && lastSent.path === path && nowTs - lastSent.at < DUPLICATE_WINDOW_MS) return;
  lastSent = { path, at: nowTs };

  // SPA-переход: сначала слить время, накопленное на ПРЕДЫДУЩЕМ пути, иначе всё
  // с момента последнего хартбита теряется на каждой клиентской навигации
  if (active && active.path !== path) trackHeartbeat();

  const now = Date.now();
  const stored = readSession();
  let sessionId: string;
  let isFirstInSession = false;
  if (stored && now - stored.lastActivity < SESSION_IDLE_MS) {
    sessionId = stored.id;
  } else {
    sessionId = uuid();
    isFirstInSession = true;
  }
  writeSession({ id: sessionId, lastActivity: now });

  const body: Record<string, unknown> = { path, sessionId, isFirstInSession };

  if (isFirstInSession) {
    // Полный referrer и кампанию берём только на старте сессии: для SPA-переходов
    // предыдущий путь известен, сервер всё равно вывел бы то же значение
    if (document.referrer) body.referrerRaw = document.referrer;
    const sp = new URLSearchParams(window.location.search);
    const pick = (k: string, max: number) => {
      const v = sp.get(k);
      if (v) body[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v.slice(0, max);
    };
    pick("utm_source", 80);
    pick("utm_medium", 80);
    pick("utm_campaign", 120);
    pick("utm_content", 120);
    pick("utm_term", 120);
    pick("gclid", 200);
    pick("fbclid", 200);
  } else if (referrerPath) {
    body.referrerPath = referrerPath;
  }

  post("pageview", body);

  active = {
    sessionId,
    path,
    durationMs: 0,
    visibleSince: now,
    isActive: typeof document !== "undefined" && document.visibilityState === "visible",
  };
}

/** Слить вовлечённое время текущей страницы. Безопасно вызывать в любой момент. */
export function trackHeartbeat(useBeacon = false): void {
  if (!active) return;
  const now = Date.now();
  if (active.isActive) {
    const delta = now - active.visibleSince;
    if (delta > 0) active.durationMs += delta;
    active.visibleSince = now;
  }
  post(
    "heartbeat",
    {
      sessionId: active.sessionId,
      path: active.path,
      durationMs: Math.max(0, Math.min(active.durationMs, MAX_DURATION_MS)),
    },
    useBeacon,
  );

  // Продлеваем сессию, но НЕ воскрешаем истёкшую: вкладка, оставленная на ночь,
  // при возврате шлёт хартбит — если штамповать безусловно, суточная сессия
  // читалась бы как свежая и 30-минутный откат никогда бы не срабатывал.
  const stored = readSession();
  const expired = stored != null && stored.id === active.sessionId && now - stored.lastActivity >= SESSION_IDLE_MS;
  if (active.isActive && !expired) writeSession({ id: active.sessionId, lastActivity: now });
}

/** Переключение накопителя по видимости вкладки. */
export function setVisibilityActive(isActive: boolean): void {
  if (!active) return;
  const now = Date.now();

  if (active.isActive && !isActive) {
    // Видима → скрыта: банкуем дельту и сливаем. Если пользователь не вернётся,
    // это последнее честное значение
    active.durationMs += now - active.visibleSince;
    active.isActive = false;
    trackHeartbeat();
    return;
  }

  if (!active.isActive && isActive) {
    // Скрыта → видима: заново пускаем часы, скрытый период задним числом не пишем
    active.visibleSince = now;
    active.isActive = true;

    // Если пока вкладка была скрыта, сессия истекла — это ВОЗВРАТ. Открываем
    // новую сессию просмотром текущего пути, иначе мобильные пользователи,
    // сворачивающие вкладку на сутки, вечно продолжали бы одну сессию
    const stored = readSession();
    if (stored != null && stored.id === active.sessionId && now - stored.lastActivity >= SESSION_IDLE_MS) {
      trackPageview(active.path, null);
    }
  }
}

/** Финальный слив на pagehide. */
export function trackPageEnd(): void {
  if (!active) return;
  const now = Date.now();
  if (active.isActive) {
    active.durationMs += now - active.visibleSince;
    active.visibleSince = now;
  }
  trackHeartbeat(true);
}

/** Текущая сессия и путь — нужны авто-захвату кликов. */
export function currentVisit(): { sessionId: string; path: string } | null {
  return active ? { sessionId: active.sessionId, path: active.path } : null;
}

/** Одно дискретное событие.
   Имена: через точку, нижним регистром, стабильные (ui.click, form.submit).
   Сервер отбрасывает всё, что не проходит регулярку, чтобы кардинальность
   индекса не взорвалась от опечаток на местах вызова. */
export function trackEvent(name: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!active) return; // просмотр ещё не смонтирован — лучше потерять, чем писать с пустой сессией

  const body: Record<string, unknown> = {
    eventName: name.slice(0, 60),
    sessionId: active.sessionId,
    path: active.path,
  };
  if (props && Object.keys(props).length) body.props = props;
  post("event", body);
}
