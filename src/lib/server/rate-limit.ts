import "server-only";
import { createHash, randomBytes } from "crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { scoringCalculation } from "@/db/schema";

/* IP никогда не хранится в открытом виде: только SHA-256 с солью.

   Соль обязательна по сути: у IPv4 всего ~4.3 млрд значений, поэтому «голый»
   SHA-256 от адреса перебирается на ноутбуке за минуты, а на GPU — мгновенно.
   Хеш без соли не анонимизирует ничего. Секрет живёт в окружении, а не в базе,
   поэтому утечки одной только базы недостаточно, чтобы восстановить адреса.

   Соль одна на всё приложение, а не на строку: значения должны сравниваться
   между собой, иначе не посчитать запросы с одного адреса.

   Раньше здесь был throw, если переменная не задана в проде. Это ломало
   /api/score полностью: незаданная переменная превращалась в 500 на каждом
   расчёте. Теперь берём запасной источник, а падать перестаём — недоступность
   основной функции сайта хуже, чем сброшенные счётчики лимита. */
let saltWarned = false;
let ephemeralSalt: string | null = null;

function ipSalt(): string {
  const explicit = process.env.SCORING_IP_SALT?.trim();
  if (explicit) return explicit;

  // Запасной вариант: выводим из секрета аутентификации — он обязателен и так,
  // так что свойство «соль секретна и не лежит в базе» сохраняется
  const authSecret = process.env.BETTER_AUTH_SECRET?.trim();
  if (authSecret) {
    return createHash("sha256").update(`navio-ip-salt:${authSecret}`).digest("hex");
  }

  if (process.env.NODE_ENV !== "production") return "dev-salt";

  /* Совсем ничего нет. Случайная соль на процесс: адреса по-прежнему не
     восстановить, но хеши не совпадают между инстансами и перезапусками,
     поэтому лимит по IP фактически перестаёт работать. Об этом надо кричать. */
  if (!saltWarned) {
    saltWarned = true;
    console.error(
      "[rate-limit] Ни SCORING_IP_SALT, ни BETTER_AUTH_SECRET не заданы. " +
      "Используется случайная соль на процесс: приватность сохранена, но лимит запросов по IP не работает.",
    );
  }
  if (!ephemeralSalt) ephemeralSalt = randomBytes(32).toString("hex");
  return ephemeralSalt;
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(`${ipSalt()}:${ip}`).digest("hex");
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/* ─── Рейт-лимит для ПИШУЩЕГО эндпоинта ───
   Считаем уже сохранённые расчёты за окно: отдельная таблица не нужна,
   а строки и так пишутся. Работает на всех инстансах, в отличие от памяти. */
const WRITE_LIMITS = [
  { windowSec: 60, max: 20 },
  { windowSec: 3600, max: 200 },
];

export async function checkScoreWriteLimit(ipHash: string): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const db = getDb();
  for (const { windowSec, max } of WRITE_LIMITS) {
    const since = new Date(Date.now() - windowSec * 1000);
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(scoringCalculation)
      .where(and(eq(scoringCalculation.ipHash, ipHash), gt(scoringCalculation.createdAt, since)));
    if ((row?.n ?? 0) >= max) return { ok: false, retryAfterSec: windowSec };
  }
  return { ok: true };
}

/* ─── Рейт-лимит для ЧИТАЮЩЕГО эндпоинта (симуляция ставки) ───
   Ничего не пишет, поэтому считаем в памяти. На serverless это best-effort:
   лимит действует в пределах инстанса. Достаточно, чтобы погасить цикл в браузере;
   от распределённого перебора защитит только общий счётчик (Upstash Redis),
   его стоит добавить, когда появится заметный трафик. */
const READ_LIMIT = { windowMs: 60_000, max: 60 };
const readHits = new Map<string, number[]>();

export function checkReadLimit(key: string): boolean {
  const now = Date.now();
  const hits = (readHits.get(key) ?? []).filter((t) => now - t < READ_LIMIT.windowMs);
  if (hits.length >= READ_LIMIT.max) {
    readHits.set(key, hits);
    return false;
  }
  hits.push(now);
  readHits.set(key, hits);
  // Не даём карте расти бесконечно на долгоживущем инстансе
  if (readHits.size > 5000) {
    for (const [k, v] of readHits) {
      if (v.every((t) => now - t >= READ_LIMIT.windowMs)) readHits.delete(k);
    }
  }
  return true;
}
