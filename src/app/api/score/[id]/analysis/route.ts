import { NextResponse } from "next/server";
import { buildAnalysis, buildLockedAnalysis } from "@/lib/server/analysis";
import { claimCalculation, getCalculation } from "@/lib/server/calculations";
import { checkReadLimit, clientIp, hashIp } from "@/lib/server/rate-limit";
import { getUserId } from "@/lib/server/session";
import type { BankForm } from "@/lib/scoring-types";

/* Детальный отчёт. Незалогиненный получает урезанную версию (locked: true):
   балл и итог видны, разбор — нет. Пороги не уходят на клиент ни в одном случае. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  if (!checkReadLimit(hashIp(clientIp(req)))) {
    return NextResponse.json({ error: "Çox sayda sorğu göndərildi." }, { status: 429 });
  }

  const row = await getCalculation(id);
  if (!row) {
    return NextResponse.json({ error: "Nəticə tapılmadı" }, { status: 404 });
  }

  // Детальный отчёт есть только для банковского режима
  if (row.mode !== "bank") {
    return NextResponse.json({ error: "Bu hesablama üçün ətraflı analiz yoxdur" }, { status: 404 });
  }

  const userId = await getUserId();

  // Чужой сохранённый расчёт не отдаём даже залогиненному
  if (row.userId && row.userId !== userId) {
    return NextResponse.json({ error: "Nəticə tapılmadı" }, { status: 404 });
  }

  const form = row.input as BankForm;
  const createdAt = row.createdAt.toISOString();

  if (!userId) {
    return NextResponse.json(buildLockedAnalysis(form, row.id, createdAt));
  }

  /* Пользователь вошёл, а расчёт был сделан анонимно — привязываем к нему.
     Ссылку с UUID знает только он, так что это его расчёт; заодно попадает в историю. */
  if (!row.userId) {
    try {
      await claimCalculation(row.id, userId);
    } catch (e) {
      console.error("[analysis] hesablama istifadəçiyə bağlanmadı:", e);
    }
  }

  const rateParam = new URL(req.url).searchParams.get("rate");
  const simRate = rateParam ? Number(rateParam) : undefined;

  return NextResponse.json(
    buildAnalysis(form, row.id, createdAt, Number.isFinite(simRate) ? simRate : undefined),
  );
}
