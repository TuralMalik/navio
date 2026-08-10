import { getDb } from "@/db";
import { trackingEvent } from "@/db/schema";
import { getUserId } from "@/lib/server/session";
import {
  allowIngest, clientIdOf, eventNameOf, ipHashOf, isBot,
  normalisePath, propsOf, sessionIdOf, str, userAgentOf,
} from "@/lib/server/tracking-ingest";

/* Одно дискретное событие: клик, отправка формы, инструментированное действие.

   Имя проходит регулярку — иначе опечатка на месте вызова навсегда поселится
   в индексе как отдельное имя события. props ограничены по размеру.

   В props НЕ должно быть значений полей ввода: за это отвечает
   src/lib/tracking/auto-capture.ts, здесь мы только ограничиваем размер. */

const NO_CONTENT = new Response(null, { status: 204 });

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NO_CONTENT;
  }

  const eventName = eventNameOf(body.eventName);
  const sessionId = sessionIdOf(body.sessionId);
  if (!eventName || !sessionId) return NO_CONTENT;

  if (isBot(userAgentOf(req))) return NO_CONTENT;

  const ipHash = ipHashOf(req);
  if (!allowIngest(`ev:${ipHash ?? sessionId}`)) return NO_CONTENT;

  try {
    await getDb().insert(trackingEvent).values({
      sessionId,
      userId: await getUserId(),
      clientId: clientIdOf(body.clientId),
      eventName,
      path: normalisePath(body.path),
      props: propsOf(body.props),
      clientSource: str(body.clientSource, 20),
      ipHash,
    });
  } catch (e) {
    console.error("[track] event yazılmadı:", e);
  }

  return NO_CONTENT;
}
