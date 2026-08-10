import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/* Без "server-only" сознательно: здесь чистая арифметика без секретов, и это
   позволяет прогонять модуль тестами из обычного node-скрипта. Сами секреты
   лежат в базе и читаются только на сервере. */

/* TOTP по RFC 6238 (и HOTP по RFC 4226) на node:crypto.

   Почему своя реализация, а не библиотека: алгоритм короткий и полностью
   специфицирован, а корректность проверяется официальными тестовыми векторами
   RFC — это более прямое доказательство, чем «подключили пакет». Тесты лежат
   в scripts/test-totp.mjs и гоняются по векторам из приложения B RFC 6238.

   Параметры по умолчанию — те, что понимают Google Authenticator, 1Password,
   Authy: SHA-1, 6 цифр, шаг 30 секунд. */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error("Invalid base32 character");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** Новый секрет. 20 байт = 160 бит, как рекомендует RFC 4226 для SHA-1. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export interface TotpOptions {
  digits?: number;
  period?: number;
  algorithm?: "sha1" | "sha256" | "sha512";
}

/** HOTP: код для конкретного счётчика. */
function hotp(secret: Buffer, counter: number, digits: number, algorithm: string): string {
  // Счётчик — 8 байт big-endian. Пишем через BigInt, чтобы не потерять
  // старшие биты на больших значениях времени.
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac(algorithm, secret).update(buf).digest();
  // Динамическая усечка (RFC 4226 §5.3)
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(binary % 10 ** digits).padStart(digits, "0");
}

/** Код на заданный момент (по умолчанию — сейчас). */
export function totp(secretBase32: string, at: number = Date.now(), opts: TotpOptions = {}): string {
  const { digits = 6, period = 30, algorithm = "sha1" } = opts;
  const counter = Math.floor(at / 1000 / period);
  return hotp(base32Decode(secretBase32), counter, digits, algorithm);
}

/** Проверка кода с допуском по времени.
   window=1 означает «предыдущий, текущий и следующий шаг» — компенсирует
   расхождение часов телефона и то, что человек набирает код не мгновенно. */
export function verifyTotp(
  secretBase32: string,
  token: string,
  opts: TotpOptions & { window?: number; at?: number } = {},
): boolean {
  const { digits = 6, period = 30, algorithm = "sha1", window = 1, at = Date.now() } = opts;
  const cleaned = token.replace(/\s+/g, "");
  if (!new RegExp(`^\\d{${digits}}$`).test(cleaned)) return false;

  const secret = base32Decode(secretBase32);
  const counter = Math.floor(at / 1000 / period);
  const expected = Buffer.from(cleaned);

  for (let drift = -window; drift <= window; drift++) {
    const candidate = Buffer.from(hotp(secret, counter + drift, digits, algorithm));
    // timingSafeEqual, чтобы по времени ответа нельзя было подбирать код по цифрам
    if (candidate.length === expected.length && timingSafeEqual(candidate, expected)) return true;
  }
  return false;
}

/** otpauth:// URI для QR-кода в приложении-аутентификаторе. */
export function totpUri(opts: {
  secret: string;
  accountName: string;
  issuer: string;
  digits?: number;
  period?: number;
  algorithm?: "sha1" | "sha256" | "sha512";
}): string {
  const { secret, accountName, issuer, digits = 6, period = 30, algorithm = "sha1" } = opts;
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: algorithm.toUpperCase(),
    digits: String(digits),
    period: String(period),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
