import "server-only";
import { and, desc, eq, isNotNull, isNull, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { scoringCalculation } from "@/db/schema";
import type { BankForm, BoktForm, Mode } from "@/lib/scoring-types";

/** Сколько живёт анонимный расчёт. Достаточно, чтобы дойти до /analiz и зарегистрироваться. */
const ANON_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export async function saveCalculation(params: {
  /** ID генерирует вызывающий: он уже вшит в отдаваемый payload. */
  id: string;
  mode: Mode;
  input: BankForm | BoktForm;
  score: number;
  bgn: number | null;
  blocked: boolean;
  userId: string | null;
  ipHash: string;
}): Promise<string> {
  const id = params.id;
  await getDb().insert(scoringCalculation).values({
    id,
    userId: params.userId,
    mode: params.mode,
    input: params.input,
    score: params.score,
    bgn: params.bgn,
    blocked: params.blocked,
    ipHash: params.ipHash,
    // У залогиненного расчёт остаётся в истории, анонимный — истекает
    expiresAt: params.userId ? null : new Date(Date.now() + ANON_TTL_MS),
  });
  return id;
}

export async function getCalculation(id: string) {
  // Явно проверяем формат: иначе Postgres ругается на невалидный ввод
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await getDb()
    .select()
    .from(scoringCalculation)
    .where(eq(scoringCalculation.id, id))
    .limit(1);
  if (!row) return null;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
  return row;
}

/** История расчётов пользователя. */
export async function listUserCalculations(userId: string, limit = 20) {
  return getDb()
    .select({
      id: scoringCalculation.id,
      mode: scoringCalculation.mode,
      score: scoringCalculation.score,
      bgn: scoringCalculation.bgn,
      blocked: scoringCalculation.blocked,
      createdAt: scoringCalculation.createdAt,
    })
    .from(scoringCalculation)
    .where(eq(scoringCalculation.userId, userId))
    .orderBy(desc(scoringCalculation.createdAt))
    .limit(limit);
}

/** Привязать анонимный расчёт к пользователю (после входа/регистрации). */
export async function claimCalculation(id: string, userId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  await getDb()
    .update(scoringCalculation)
    .set({ userId, expiresAt: null })
    .where(and(eq(scoringCalculation.id, id), isNull(scoringCalculation.userId)));
}

/** Уборка просроченных анонимных расчётов. Вызывать из cron.
   Удаляем строго по истёкшему expiresAt: строки без срока (есть владелец) не трогаем. */
export async function purgeExpiredCalculations() {
  await getDb()
    .delete(scoringCalculation)
    .where(and(isNotNull(scoringCalculation.expiresAt), lt(scoringCalculation.expiresAt, new Date())));
}
