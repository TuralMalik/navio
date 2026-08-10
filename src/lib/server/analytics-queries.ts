import "server-only";
import { and, asc, desc, eq, gt, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { pageView, trackingEvent, user } from "@/db/schema";

/* Агрегаты для админки. Все запросы исключают ботов: строки помечены, но в
   цифрах их быть не должно, иначе краулеры сдвигают всё. */

export type Range = 1 | 7 | 30;

export function parseRange(raw: unknown): Range {
  const n = Number(raw);
  return n === 1 || n === 30 ? n : 7;
}

function since(days: Range): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

const humans = (days: Range) => and(eq(pageView.isBot, false), gt(pageView.createdAt, since(days)));

/* ─── Верхние показатели ─── */
export async function getTotals(days: Range) {
  const [row] = await getDb()
    .select({
      pageviews: sql<number>`count(*)::int`,
      sessions: sql<number>`count(distinct ${pageView.sessionId})::int`,
      // Посетитель = установка браузера; если clientId нет, считаем по сессии
      visitors: sql<number>`count(distinct coalesce(${pageView.clientId}, ${pageView.sessionId}))::int`,
      // Среднее — только по страницам, где время успело записаться. Нули это
      // мгновенные уходы без хартбита; считать их «0 секунд» значит занижать
      avgMs: sql<number>`coalesce(avg(nullif(${pageView.durationMs}, 0)), 0)::int`,
      totalMs: sql<number>`coalesce(sum(${pageView.durationMs}), 0)::bigint`,
      newVisitors: sql<number>`count(*) filter (where ${pageView.isNewVisitor})::int`,
      signedIn: sql<number>`count(distinct ${pageView.userId})::int`,
    })
    .from(pageView)
    .where(humans(days));
  return row ?? { pageviews: 0, sessions: 0, visitors: 0, avgMs: 0, totalMs: 0, newVisitors: 0, signedIn: 0 };
}

/** Показатели за предыдущий такой же период — для сравнения «против прошлого». */
export async function getPreviousTotals(days: Range) {
  const end = since(days);
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const [row] = await getDb()
    .select({
      pageviews: sql<number>`count(*)::int`,
      sessions: sql<number>`count(distinct ${pageView.sessionId})::int`,
      visitors: sql<number>`count(distinct coalesce(${pageView.clientId}, ${pageView.sessionId}))::int`,
      avgMs: sql<number>`coalesce(avg(nullif(${pageView.durationMs}, 0)), 0)::int`,
    })
    .from(pageView)
    .where(and(eq(pageView.isBot, false), gt(pageView.createdAt, start), sql`${pageView.createdAt} <= ${end}`));
  return row ?? { pageviews: 0, sessions: 0, visitors: 0, avgMs: 0 };
}

export async function getBotCount(days: Range) {
  const [row] = await getDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(pageView)
    .where(and(eq(pageView.isBot, true), gt(pageView.createdAt, since(days))));
  return row?.n ?? 0;
}

/** Есть ли вообще гео-данные: локально заголовка Vercel нет, и это не поломка. */
export async function hasGeoData() {
  const [row] = await getDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(pageView)
    .where(isNotNull(pageView.country));
  return (row?.n ?? 0) > 0;
}

/* ─── Временной ряд для графика ───
   Для 24 часов бьём по часам, иначе по дням: суточный график из одной точки
   бесполезен. Пустые интервалы заполняем нулями через generate_series,
   иначе линия «перепрыгивает» тихие часы и выглядит ровнее, чем есть. */
export async function getSeries(days: Range) {
  const unit = days === 1 ? "hour" : "day";
  const step = days === 1 ? "1 hour" : "1 day";
  const from = since(days);

  const rows = await getDb().execute(sql`
    with buckets as (
      select generate_series(
        date_trunc(${unit}, ${from}::timestamp),
        date_trunc(${unit}, now()),
        ${step}::interval
      ) as bucket
    ),
    data as (
      select date_trunc(${unit}, created_at) as bucket,
             count(*)::int as views,
             count(distinct session_id)::int as sessions,
             count(distinct coalesce(client_id, session_id))::int as visitors
      from page_view
      where is_bot = false and created_at > ${from}
      group by 1
    )
    select to_char(b.bucket, ${days === 1 ? sql`'HH24:00'` : sql`'DD.MM'`}) as label,
           coalesce(d.views, 0)::int as views,
           coalesce(d.sessions, 0)::int as sessions,
           coalesce(d.visitors, 0)::int as visitors
    from buckets b left join data d on d.bucket = b.bucket
    order by b.bucket
  `);

  // neon-http возвращает либо массив, либо { rows }
  const list = (Array.isArray(rows) ? rows : (rows as { rows?: unknown[] }).rows) ?? [];
  return list as { label: string; views: number; sessions: number; visitors: number }[];
}

/* ─── Страницы ─── */
export async function getPages(days: Range, limit = 100) {
  return getDb()
    .select({
      path: pageView.path,
      views: sql<number>`count(*)::int`,
      visitors: sql<number>`count(distinct coalesce(${pageView.clientId}, ${pageView.sessionId}))::int`,
      avgMs: sql<number>`coalesce(avg(nullif(${pageView.durationMs}, 0)), 0)::int`,
      entries: sql<number>`count(*) filter (where ${pageView.isFirstInSession})::int`,
    })
    .from(pageView)
    .where(humans(days))
    .groupBy(pageView.path)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

/* ─── События ─── */
export async function getEventNames(days: Range) {
  return getDb()
    .select({
      eventName: trackingEvent.eventName,
      count: sql<number>`count(*)::int`,
      sessions: sql<number>`count(distinct ${trackingEvent.sessionId})::int`,
    })
    .from(trackingEvent)
    .where(gt(trackingEvent.createdAt, since(days)))
    .groupBy(trackingEvent.eventName)
    .orderBy(desc(sql`count(*)`));
}

/** Разбивка одного типа события по подписи — «что именно нажимают». */
export async function getEventBreakdown(days: Range, eventName: string, limit = 25) {
  return getDb()
    .select({
      label: sql<string>`coalesce(${trackingEvent.props} ->> 'label', ${trackingEvent.props} ->> 'form', ${trackingEvent.props} ->> 'field', '(adsız)')`,
      count: sql<number>`count(*)::int`,
    })
    .from(trackingEvent)
    .where(and(eq(trackingEvent.eventName, eventName), gt(trackingEvent.createdAt, since(days))))
    .groupBy(sql`coalesce(${trackingEvent.props} ->> 'label', ${trackingEvent.props} ->> 'form', ${trackingEvent.props} ->> 'field', '(adsız)')`)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getEvents(opts: { days: Range; name?: string; path?: string; limit?: number; offset?: number }) {
  const { days, name, path, limit = 100, offset = 0 } = opts;
  const filters = [gt(trackingEvent.createdAt, since(days))];
  if (name) filters.push(eq(trackingEvent.eventName, name));
  if (path) filters.push(eq(trackingEvent.path, path));

  return getDb()
    .select({
      id: trackingEvent.id,
      createdAt: trackingEvent.createdAt,
      eventName: trackingEvent.eventName,
      path: trackingEvent.path,
      props: trackingEvent.props,
      sessionId: trackingEvent.sessionId,
      clientSource: trackingEvent.clientSource,
      email: user.email,
    })
    .from(trackingEvent)
    .leftJoin(user, eq(trackingEvent.userId, user.id))
    .where(and(...filters))
    .orderBy(desc(trackingEvent.createdAt))
    .limit(limit)
    .offset(offset);
}

/* ─── Сессии ─── */
export async function getSessions(days: Range, limit = 100) {
  const from = since(days);
  const rows = await getDb().execute(sql`
    select pv.session_id,
           min(pv.created_at) as started_at,
           max(pv.created_at) as last_at,
           count(*)::int as views,
           sum(pv.duration_ms)::bigint as total_ms,
           max(pv.country) as country,
           max(pv.client_source) as client_source,
           bool_or(pv.is_new_visitor) as is_new,
           (array_agg(pv.path order by pv.created_at))[1] as entry_path,
           max(pv.external_referrer_host) as referrer,
           max(pv.utm_source) as utm_source,
           max(u.email) as email,
           (select count(*)::int from tracking_event te where te.session_id = pv.session_id) as events
    from page_view pv
    left join "user" u on u.id = pv.user_id
    where pv.is_bot = false and pv.created_at > ${from}
    group by pv.session_id
    order by min(pv.created_at) desc
    limit ${limit}
  `);
  const list = (Array.isArray(rows) ? rows : (rows as { rows?: unknown[] }).rows) ?? [];
  return list as {
    session_id: string; started_at: string; last_at: string; views: number;
    total_ms: string | number; country: string | null; client_source: string | null;
    is_new: boolean; entry_path: string; referrer: string | null; utm_source: string | null;
    email: string | null; events: number;
  }[];
}

/** Хронология одной сессии: просмотры и события в одном порядке. */
export async function getSessionTimeline(sessionId: string) {
  const [views, events] = await Promise.all([
    getDb()
      .select({
        createdAt: pageView.createdAt,
        path: pageView.path,
        durationMs: pageView.durationMs,
        isFirstInSession: pageView.isFirstInSession,
        referrer: pageView.externalReferrerHost,
        country: pageView.country,
        clientSource: pageView.clientSource,
        clientId: pageView.clientId,
        userAgent: pageView.userAgent,
        utmSource: pageView.utmSource,
        utmCampaign: pageView.utmCampaign,
        visitType: pageView.visitType,
        email: user.email,
      })
      .from(pageView)
      .leftJoin(user, eq(pageView.userId, user.id))
      .where(eq(pageView.sessionId, sessionId))
      .orderBy(asc(pageView.createdAt)),
    getDb()
      .select({
        createdAt: trackingEvent.createdAt,
        eventName: trackingEvent.eventName,
        path: trackingEvent.path,
        props: trackingEvent.props,
      })
      .from(trackingEvent)
      .where(eq(trackingEvent.sessionId, sessionId))
      .orderBy(asc(trackingEvent.createdAt)),
  ]);

  type Item =
    | { kind: "view"; at: Date; path: string; durationMs: number; isFirst: boolean }
    | { kind: "event"; at: Date; eventName: string; path: string | null; props: unknown };

  const items: Item[] = [
    ...views.map((v) => ({
      kind: "view" as const, at: v.createdAt, path: v.path,
      durationMs: v.durationMs, isFirst: v.isFirstInSession,
    })),
    ...events.map((e) => ({
      kind: "event" as const, at: e.createdAt, eventName: e.eventName, path: e.path, props: e.props,
    })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());

  return { meta: views[0] ?? null, items, viewCount: views.length, eventCount: events.length };
}

/* ─── Посетители (по установке браузера) ─── */
export async function getVisitors(days: Range, limit = 100) {
  const from = since(days);
  const rows = await getDb().execute(sql`
    select coalesce(client_id, session_id) as visitor,
           client_id is null as no_client_id,
           count(*)::int as views,
           count(distinct session_id)::int as sessions,
           sum(duration_ms)::bigint as total_ms,
           min(created_at) as first_seen,
           max(created_at) as last_seen,
           max(country) as country,
           bool_or(is_new_visitor) as is_new
    from page_view
    where is_bot = false and created_at > ${from}
    group by 1, 2
    order by count(*) desc
    limit ${limit}
  `);
  const list = (Array.isArray(rows) ? rows : (rows as { rows?: unknown[] }).rows) ?? [];
  return list as {
    visitor: string; no_client_id: boolean; views: number; sessions: number;
    total_ms: string | number; first_seen: string; last_seen: string;
    country: string | null; is_new: boolean;
  }[];
}

/* ─── Источники ─── */
export async function getVisitTypes(days: Range) {
  return getDb()
    .select({ visitType: pageView.visitType, sessions: sql<number>`count(*)::int` })
    .from(pageView)
    .where(and(humans(days), eq(pageView.isFirstInSession, true)))
    .groupBy(pageView.visitType)
    .orderBy(desc(sql`count(*)`));
}

export async function getReferrers(days: Range, limit = 25) {
  return getDb()
    .select({ host: pageView.externalReferrerHost, sessions: sql<number>`count(*)::int` })
    .from(pageView)
    .where(and(humans(days), isNotNull(pageView.externalReferrerHost)))
    .groupBy(pageView.externalReferrerHost)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getCampaigns(days: Range, limit = 25) {
  return getDb()
    .select({
      source: pageView.utmSource,
      medium: pageView.utmMedium,
      campaign: pageView.utmCampaign,
      sessions: sql<number>`count(*)::int`,
    })
    .from(pageView)
    .where(and(humans(days), isNotNull(pageView.utmSource)))
    .groupBy(pageView.utmSource, pageView.utmMedium, pageView.utmCampaign)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getCountries(days: Range, limit = 25) {
  return getDb()
    .select({ country: pageView.country, views: sql<number>`count(*)::int` })
    .from(pageView)
    .where(and(humans(days), isNotNull(pageView.country)))
    .groupBy(pageView.country)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getClientSources(days: Range) {
  return getDb()
    .select({ source: pageView.clientSource, views: sql<number>`count(*)::int` })
    .from(pageView)
    .where(humans(days))
    .groupBy(pageView.clientSource)
    .orderBy(desc(sql`count(*)`));
}

/* ─── Сырые просмотры ─── */
export async function getRawPageViews(opts: { days: Range; path?: string; limit?: number; offset?: number; includeBots?: boolean }) {
  const { days, path, limit = 100, offset = 0, includeBots = false } = opts;
  const filters = [gt(pageView.createdAt, since(days))];
  if (!includeBots) filters.push(eq(pageView.isBot, false));
  if (path) filters.push(eq(pageView.path, path));

  return getDb()
    .select({
      id: pageView.id,
      createdAt: pageView.createdAt,
      path: pageView.path,
      durationMs: pageView.durationMs,
      sessionId: pageView.sessionId,
      country: pageView.country,
      clientSource: pageView.clientSource,
      isFirstInSession: pageView.isFirstInSession,
      isNewVisitor: pageView.isNewVisitor,
      isBot: pageView.isBot,
      referrer: pageView.externalReferrerHost,
      utmSource: pageView.utmSource,
      email: user.email,
    })
    .from(pageView)
    .leftJoin(user, eq(pageView.userId, user.id))
    .where(and(...filters))
    .orderBy(desc(pageView.createdAt))
    .limit(limit)
    .offset(offset);
}
