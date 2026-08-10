"use client";

/* Стабильный идентификатор установки браузера.

   Почему UUID, а не отпечаток устройства: отпечаток — хеш характеристик, и два
   разных человека с одинаковой популярной моделью телефона совпадают ПО
   ОПРЕДЕЛЕНИЮ. Для аналитики это склеивает тысячи посетителей в несколько
   «устройств». Случайный UUID такого не делает; пользователь может его сбросить
   (очистить данные сайта) — это нормально, он не для защиты, а для счёта
   уникальных и возвращающихся.

   Хранится в localStorage И в cookie: любой из двух переживает очистку другого. */

const STORAGE_KEY = "navio_cid";
const COOKIE_KEY = "navio_cid";
const COOKIE_MAX_AGE_S = 60 * 60 * 24 * 730; // ~2 года

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

let cached: string | null = null;

function mintUuid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* старые движки — падаем ниже */
  }
  try {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, (x) => x.toString(16).padStart(2, "0"));
    return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h.slice(10).join("")}`;
  } catch {
    const rand = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
    return `${rand()}${rand()}-${rand()}-4${rand().slice(1)}-a${rand().slice(1)}-${rand()}${rand()}${rand()}`;
  }
}

function readCookie(): string | null {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]+)`));
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

function writeCookie(v: string): void {
  try {
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(v)}; max-age=${COOKIE_MAX_AGE_S}; path=/; SameSite=Lax`;
  } catch {
    /* приватный режим — остаётся localStorage */
  }
}

/** Идентификатор установки. Никогда не бросает; на сервере возвращает "". */
export function getClientId(): string {
  if (typeof window === "undefined") return "";
  if (cached) return cached;

  let fromStorage: string | null = null;
  try {
    fromStorage = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* приватный режим */
  }
  const fromCookie = readCookie();

  // Валидируем найденное: испорченное значение не должно стать вечной личностью
  let id = (fromStorage || fromCookie || "").toLowerCase();
  if (!UUID_RE.test(id)) id = mintUuid().toLowerCase();

  cached = id;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* cookie ниже всё равно сохранит */
  }
  if (fromCookie !== id) writeCookie(id);
  return id;
}
