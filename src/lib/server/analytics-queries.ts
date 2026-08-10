import "server-only";
import { and, desc, eq, gt, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { pageView, trackingEvent, user } from "@/db/schema";

/* Агрегаты для админки. Все запросы исключают ботов: строки помечены, но в
   цифрах их быть не должно, иначе краулеры сдвигают всё. */

export type Range = 1 | 7 | 30;

function since(days: Range): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

const humans = (days: Range) => and(eq(pageView.isBot, false), gt(pageView.createdAt, since(days)));

/** Верхние показатели: просмотры, сессии, посетители, среднее вовлечённое время. */
export async function getTotals(days: Range) {
  const [row] = await getDb()
    .select({
      pageviews: sql<number>`count(*)::int`,
      sessions: sql<number>`count(distinct ${pageView.sessionId})::int`,
      // Посетитель = установка браузера; если clientId нет, считаем по сессии
      visitors: sql<number>`count(distinct coalesce(${pageView.clientId}, ${pageView.sessionId}))::int`,
      // Среднее берём по страницам, где время вообще успело записаться:
      // строки с 0 — это мгновенные уходы и хартбит по ним не пришёл,
      // включать их в среднее значит занижать его без причины
      avgMs: sql<number>`coalesce(avg(nullif(${pageView.durationMs}, 0)), 0)::int`,
      newVisitors: sql<number>`count(*) filter (where ${pageView.isNewVisitor})::int`,
      signedIn: sql<number>`count(distinct ${pageView.userId})::int`,
    })
    .from(pageView)
    .where(humans(days));
  return row ?? { pageviews: 0, sessions: 0, visitors: 0, avgMs: 0, newVisitors: 0, signedIn: 0 };
}

/** Сколько ботов отфильтровано — полезно понимать объём шума. */
export async function getBotCount(days: Range) {
  const [row] = await getDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(pageView)
    .where(and(eq(pageView.isBot, true), gt(pageView.createdAt, since(days))));
  return row?.n ?? 0;
}

export async function getTopPaths(days: Range, limit = 15) {
  return getDb()
    .select({
      path: pageView.path,
      views: sql<number>`count(*)::int`,
      visitors: sql<number>`count(distinct coalesce(${pageView.clientId}, ${pageView.sessionId}))::int`,
      avgMs: sql<number>`coalesce(avg(nullif(${pageView.durationMs}, 0)), 0)::int`,
    })
    .from(pageView)
    .where(humans(days))
    .groupBy(pageView.path)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

/** Входные страницы: первая строка сессии. Показывает, откуда люди начинают. */
export async function getEntryPaths(days: Range, limit = 10) {
  return getDb()
    .select({ path: pageView.path, sessions: sql<number>`count(*)::int` })
    .from(pageView)
    .where(and(humans(days), eq(pageView.isFirstInSession, true)))
    .groupBy(pageView.path)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getTopEvents(days: Range, limit = 20) {
  return getDb()
    .select({
      eventName: trackingEvent.eventName,
      count: sql<number>`count(*)::int`,
      sessions: sql<number>`count(distinct ${trackingEvent.sessionId})::int`,
    })
    .from(trackingEvent)
    .where(gt(trackingEvent.createdAt, since(days)))
    .groupBy(trackingEvent.eventName)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

/** Самые нажимаемые подписи — props->>'label' у ui.click. */
export async function getTopClicks(days: Range, limit = 15) {
  return getDb()
    .select({
      label: sql<string>`coalesce(${trackingEvent.props} ->> 'label', '(adsız)')`,
      to: sql<string | null>`${trackingEvent.props} ->> 'to'`,
      count: sql<number>`count(*)::int`,
    })
    .from(trackingEvent)
    .where(and(eq(trackingEvent.eventName, "ui.click"), gt(trackingEvent.createdAt, since(days))))
    .groupBy(sql`coalesce(${trackingEvent.props} ->> 'label', '(adsız)')`, sql`${trackingEvent.props} ->> 'to'`)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getVisitTypes(days: Range) {
  return getDb()
    .select({ visitType: pageView.visitType, sessions: sql<number>`count(*)::int` })
    .from(pageView)
    .where(and(humans(days), eq(pageView.isFirstInSession, true)))
    .groupBy(pageView.visitType)
    .orderBy(desc(sql`count(*)`));
}

export async function getReferrers(days: Range, limit = 12) {
  return getDb()
    .select({ host: pageView.externalReferrerHost, sessions: sql<number>`count(*)::int` })
    .from(pageView)
    .where(and(humans(days), isNotNull(pageView.externalReferrerHost)))
    .groupBy(pageView.externalReferrerHost)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getCampaigns(days: Range, limit = 12) {
  return getDb()
    .select({
      source: pageView.utmSource,
      campaign: pageView.utmCampaign,
      sessions: sql<number>`count(*)::int`,
    })
    .from(pageView)
    .where(and(humans(days), isNotNull(pageView.utmSource)))
    .groupBy(pageView.utmSource, pageView.utmCampaign)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getCountries(days: Range, limit = 10) {
  return getDb()
    .select({ country: pageView.country, views: sql<number>`count(*)::int` })
    .from(pageView)
    .where(and(humans(days), isNotNull(pageView.country)))
    .groupBy(pageView.country)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

/** Просмотры по дням — для простого графика. */
export async function getDailyViews(days: Range) {
  return getDb()
    .select({
      day: sql<string>`to_char(date_trunc('day', ${pageView.createdAt}), 'YYYY-MM-DD')`,
      views: sql<number>`count(*)::int`,
      visitors: sql<number>`count(distinct coalesce(${pageView.clientId}, ${pageView.sessionId}))::int`,
    })
    .from(pageView)
    .where(humans(days))
    .groupBy(sql`date_trunc('day', ${pageView.createdAt})`)
    .orderBy(sql`date_trunc('day', ${pageView.createdAt})`);
}

/** Живая лента последних просмотров. */
export async function getLiveViews(limit = 40) {
  return getDb()
    .select({
      id: pageView.id,
      createdAt: pageView.createdAt,
      path: pageView.path,
      durationMs: pageView.durationMs,
      country: pageView.country,
      clientSource: pageView.clientSource,
      isFirstInSession: pageView.isFirstInSession,
      isNewVisitor: pageView.isNewVisitor,
      sessionId: pageView.sessionId,
      email: user.email,
    })
    .from(pageView)
    .leftJoin(user, eq(pageView.userId, user.id))
    .where(eq(pageView.isBot, false))
    .orderBy(desc(pageView.createdAt))
    .limit(limit);
}

/** Живая лента последних событий. */
export async function getLiveEvents(limit = 40) {
  return getDb()
    .select({
      id: trackingEvent.id,
      createdAt: trackingEvent.createdAt,
      eventName: trackingEvent.eventName,
      path: trackingEvent.path,
      props: trackingEvent.props,
      sessionId: trackingEvent.sessionId,
    })
    .from(trackingEvent)
    .orderBy(desc(trackingEvent.createdAt))
    .limit(limit);
}
