import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { scoringCalculation } from "@/db/schema";
import type { BankForm, BoktForm, Mode } from "@/lib/scoring-types";

/* Расчёты не удаляются и не истекают — так это описано в /az/privacy.
   Колонка expiresAt в схеме остаётся неиспользованной (снятие требует миграции);
   ничего её не пишет и не читает. Удаление — только по запросу пользователя. */

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
  return row ?? null;
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
    .set({ userId })
    .where(and(eq(scoringCalculation.id, id), isNull(scoringCalculation.userId)));
}
