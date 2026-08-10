import { NextResponse } from "next/server";
import { presentBankResult, presentBoktResult } from "@/lib/server/presenter";
import { parseBankForm, parseBoktForm } from "@/lib/server/validate";
import { saveCalculation } from "@/lib/server/calculations";
import { checkScoreWriteLimit, clientIp, hashIp } from "@/lib/server/rate-limit";
import { getUserId } from "@/lib/server/session";
import { randomUUID } from "crypto";

/* Расчёт скоринга. Вся механика (CONFIG, веса, капы, таблицы ставок) остаётся здесь:
   наружу уходит только готовый к показу payload. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yanlış sorğu" }, { status: 400 });
  }

  const mode = (body as { mode?: unknown })?.mode;
  if (mode !== "bank" && mode !== "bokt") {
    return NextResponse.json({ error: "Yanlış rejim" }, { status: 400 });
  }

  const rawInput = (body as { input?: unknown })?.input;
  const form = mode === "bank" ? parseBankForm(rawInput) : parseBoktForm(rawInput);
  if (!form) {
    return NextResponse.json({ error: "Məlumatlar düzgün deyil" }, { status: 400 });
  }

  const ipHash = hashIp(clientIp(req));
  const limit = await checkScoreWriteLimit(ipHash);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd edin." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const userId = await getUserId();
  // ID генерируем заранее: он попадает и в payload, и в строку БД
  const calculationId = randomUUID();

  const result =
    mode === "bank"
      ? presentBankResult(form as Parameters<typeof presentBankResult>[0], calculationId)
      : presentBoktResult(form as Parameters<typeof presentBoktResult>[0], calculationId);

  try {
    await saveCalculation({
      id: calculationId,
      mode,
      input: form,
      score: result.score,
      bgn: result.bgn,
      blocked: result.blocked,
      userId,
      ipHash,
    });
  } catch (e) {
    // Расчёт важнее логирования: не роняем ответ, но /analiz по этому ID работать не будет
    console.error("[score] hesablama yadda saxlanılmadı:", e);
    return NextResponse.json({ ...result, calculationId: null });
  }

  return NextResponse.json(result);
}
