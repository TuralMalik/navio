import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { pageView } from "@/db/schema";
import { getUserId } from "@/lib/server/session";
import {
  allowIngest, clientIdOf, countryOf, ipHashOf, isBot,
  normalisePath, referrerHostOf, sessionIdOf, str, userAgentOf,
} from "@/lib/server/tracking-ingest";

/* Один просмотр страницы. Отвечает 204 всегда: клиент ответ не читает, а
   ошибки в консоли только пугают. Мусор молча отбрасывается. */

const NO_CONTENT = new Response(null, { status: 204 });

/** Новый посетитель: с этого clientId за 30 дней ничего не было. */
async function isNewVisitor(clientId: string | null): Promise<boolean> {
  if (!clientId) return false;
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const [prior] = await getDb()
    .select({ id: pageView.id })
    .from(pageView)
    .where(and(eq(pageView.clientId, clientId), gt(pageView.createdAt, since)))
    .limit(1);
  return !prior;
}

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

  const ipHash = ipHashOf(req);
  if (!allowIngest(`pv:${ipHash ?? sessionId}`)) return NO_CONTENT;

  const userAgent = userAgentOf(req);
  const bot = isBot(userAgent);
  const clientId = clientIdOf(body.clientId);
  const isFirst = body.isFirstInSession === true;

  const ownHost = (() => {
    try {
      return new URL(req.url).host;
    } catch {
      return "";
    }
  })();
  const externalReferrerHost = isFirst ? referrerHostOf(body.referrerRaw, ownHost) : null;
  const referrerPath = isFirst ? null : normalisePath(body.referrerPath);

  const utmSource = str(body.utmSource, 80);
  const utmMedium = str(body.utmMedium, 80);
  const utmCampaign = str(body.utmCampaign, 120);
  const gclid = str(body.gclid, 200);
  const fbclid = str(body.fbclid, 200);

  // Классификация визита один раз, на первой строке сессии
  const visitType = !isFirst
    ? null
    : utmSource || utmCampaign || gclid || fbclid
      ? "campaign"
      : externalReferrerHost
        ? "external_referrer"
        : "direct";

  try {
    const newVisitor = isFirst && !bot ? await isNewVisitor(clientId) : false;

    await getDb().insert(pageView).values({
      sessionId,
      userId: await getUserId(),
      clientId,
      path,
      referrerPath,
      externalReferrerHost,
      visitType,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent: str(body.utmContent, 120),
      utmTerm: str(body.utmTerm, 120),
      gclid,
      fbclid,
      isBot: bot,
      isFirstInSession: isFirst,
      isNewVisitor: newVisitor,
      clientSource: str(body.clientSource, 20),
      userAgent,
      ipHash,
      country: countryOf(req),
    });
  } catch (e) {
    console.error("[track] pageview yazılmadı:", e);
  }

  return NO_CONTENT;
}
