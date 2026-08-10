import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pageView } from "@/db/schema";
import {
  allowIngest, ipHashOf, isBot, normalisePath, sessionIdOf, userAgentOf,
} from "@/lib/server/tracking-ingest";

/* Обновляет durationMs у уже существующей строки просмотра.

   Ищем ПОСЛЕДНЮЮ строку по (sessionId, path): в одной сессии на один путь можно
   зайти дважды (обновление страницы, кнопка «назад»), и засчитать надо свежий
   визит. Если строки нет — молча выходим: хартбит мог обогнать просмотр или
   сессия успела откатиться. */

const NO_CONTENT = new Response(null, { status: 204 });

/** Потолок на визит. Дальше человек почти наверняка ушёл, а visibilitychange
   не сработал (бывает на мобильных). Без потолка средние показатели поедут. */
const MAX_DURATION_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NO_CONTENT;
  }

  const path = normalisePath(body.path);
  const sessionId = sessionIdOf(body.sessionId);
  if (!path || !sessionId) return NO_CONTENT;

  if (isBot(userAgentOf(req))) return NO_CONTENT;

  const ipHash = ipHashOf(req);
  if (!allowIngest(`hb:${ipHash ?? sessionId}`)) return NO_CONTENT;

  const raw = Number(body.durationMs);
  if (!Number.isFinite(raw)) return NO_CONTENT;
  const durationMs = Math.round(Math.max(0, Math.min(raw, MAX_DURATION_MS)));

  try {
    const db = getDb();
    const [row] = await db
      .select({ id: pageView.id })
      .from(pageView)
      .where(and(eq(pageView.sessionId, sessionId), eq(pageView.path, path)))
      .orderBy(desc(pageView.createdAt))
      .limit(1);

    if (!row) return NO_CONTENT;

    await db
      .update(pageView)
      .set({ durationMs, lastHeartbeatAt: new Date() })
      .where(eq(pageView.id, row.id));
  } catch (e) {
    console.error("[track] heartbeat yazılmadı:", e);
  }

  return NO_CONTENT;
}
