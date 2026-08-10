import "server-only";
import { hashIp, clientIp } from "./rate-limit";

/* Общие помощники приёма аналитики: боты, нормализация, лимиты.
   Правило: приём аналитики никогда не отвечает ошибкой на мусор — молча
   отбрасывает. Клиент всё равно ничего не делает с ответом, а 4xx в консоли
   пугает и засоряет отчёты об ошибках. */

/* Достаточно грубого совпадения: цель не поймать всех, а не пускать
   очевидных краулеров в агрегаты. Строки помечаются, а не выбрасываются. */
const BOT_RE =
  /bot|crawl|spider|slurp|bing|yandex|baidu|duckduck|facebookexternalhit|whatsapp|telegram|preview|monitor|curl|wget|python-requests|headless|lighthouse|pagespeed|gtmetrix|semrush|ahrefs|screaming/i;

export function isBot(userAgent: string): boolean {
  if (!userAgent) return true; // безголовые запросы без UA — не люди
  return BOT_RE.test(userAgent);
}

/** Путь: только внутренний, без query, ограниченной длины. */
export function normalisePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s.startsWith("/") || s.startsWith("//")) return null;
  return s.split("?")[0].split("#")[0].slice(0, 200);
}

export function str(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  return s ? s.slice(0, max) : null;
}

export function sessionIdOf(raw: unknown): string | null {
  const s = str(raw, 36);
  if (!s || s.length < 8) return null;
  return s;
}

const CLIENT_ID_RE = /^[0-9a-f-]{8,40}$/i;
export function clientIdOf(raw: unknown): string | null {
  const s = str(raw, 40);
  return s && CLIENT_ID_RE.test(s) ? s.toLowerCase() : null;
}

/** Имя события: стабильное, через точку. Иначе кардинальность индекса взорвётся. */
const EVENT_NAME_RE = /^[a-z0-9][a-z0-9._-]{1,58}[a-z0-9]$/;
export function eventNameOf(raw: unknown): string | null {
  const s = str(raw, 60);
  return s && EVENT_NAME_RE.test(s) ? s : null;
}

/** props: сериализуемый объект под ограничением размера. */
const MAX_PROPS_BYTES = 1000;
export function propsOf(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  try {
    const json = JSON.stringify(raw);
    if (json.length > MAX_PROPS_BYTES) return null;
    return raw as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Внешний referrer: только хост. Полный внешний URL не храним. */
export function referrerHostOf(raw: unknown, ownHost: string): string | null {
  const s = str(raw, 500);
  if (!s) return null;
  try {
    const host = new URL(s).host;
    if (!host || host === ownHost) return null;
    return host.slice(0, 200);
  } catch {
    return null;
  }
}

export function countryOf(req: Request): string | null {
  // Vercel отдаёт гео в заголовках; Cloudflare — как fallback
  const c = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry");
  return c && /^[A-Z]{2}$/i.test(c) ? c.toUpperCase() : null;
}

export function userAgentOf(req: Request): string {
  return (req.headers.get("user-agent") || "").slice(0, 500);
}

export function ipHashOf(req: Request): string | null {
  try {
    return hashIp(clientIp(req));
  } catch {
    // SCORING_IP_SALT не задан в проде — аналитика не повод падать
    return null;
  }
}

/* ─── Защита от флуда ───
   Эндпоинты публичные и пишущие. Считаем в памяти инстанса: этого хватает,
   чтобы погасить взбесившийся цикл в браузере. От распределённого флуда
   защитит только общий счётчик (Upstash), его стоит добавить вместе с тем,
   который уже нужен скорингу. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 240; // ~4/с: хартбит раз в 15 с + клики с запасом
const hits = new Map<string, number[]>();

export function allowIngest(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return true;
}
