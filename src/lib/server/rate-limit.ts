import "server-only";
import { createHash } from "crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { scoringCalculation } from "@/db/schema";

/* IP никогда не хранится в открытом виде: только SHA-256 с солью.
   Соль обязательна в проде — без неё хеш IPv4 перебирается за секунды. */
export function hashIp(ip: string): string {
  const salt = process.env.SCORING_IP_SALT;
  if (!salt && process.env.NODE_ENV === "production") {
    throw new Error("SCORING_IP_SALT is required in production");
  }
  return createHash("sha256").update(`${salt ?? "dev-salt"}:${ip}`).digest("hex");
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
