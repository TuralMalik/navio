import Link from "next/link";
import {
  getTotals, getPreviousTotals, getBotCount, getSeries, getPages,
  getEventNames, getVisitTypes, getReferrers, getCampaigns, getCountries, getClientSources,
  hasGeoData, getSessions, parseRange,
} from "@/lib/server/analytics-queries";
import {
  PageHeader, RangeTabs, Kpi, Panel, BarList, LineChart, Table, Td, Badge, Empty,
  fmtDuration, fmtTime, fmtNumber,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function delta(now: number, before: number): number | null {
  if (!before) return null; // без базы процент не имеет смысла
  return ((now - before) / before) * 100;
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: raw } = await searchParams;
  const days = parseRange(raw);

  const [
    totals, prev, bots, series, pages, events,
    visitTypes, referrers, campaigns, countries, sources, geo, sessions,
  ] = await Promise.all([
    getTotals(days), getPreviousTotals(days), getBotCount(days), getSeries(days),
    getPages(days, 8), getEventNames(days), getVisitTypes(days), getReferrers(days, 8),
    getCampaigns(days, 6), getCountries(days, 8), getClientSources(days), hasGeoData(),
    getSessions(days, 8),
  ]);

  const noData = totals.pageviews === 0;
  const pagesPerSession = totals.sessions ? totals.pageviews / totals.sessions : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Overview"
        subtitle={
          <>
            Collected on our own server. Bots excluded
            {bots > 0 && <> ({fmtNumber(bots)} bot views filtered)</>}.
          </>
        }
        right={<RangeTabs days={days} base="/admin" />}
      />

      {noData && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[13px] text-amber-800">
          No data for this period. Open the site and browse a few pages — results appear here immediately.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Kpi label="Views" value={fmtNumber(totals.pageviews)} delta={delta(totals.pageviews, prev.pageviews)} hint="vs previous period" />
        <Kpi label="Sessions" value={fmtNumber(totals.sessions)} delta={delta(totals.sessions, prev.sessions)} />
        <Kpi label="Visitors" value={fmtNumber(totals.visitors)} delta={delta(totals.visitors, prev.visitors)} hint="per browser" />
        <Kpi label="New" value={fmtNumber(totals.newVisitors)} hint="first-time" />
        <Kpi label="Avg. time" value={fmtDuration(totals.avgMs)} delta={delta(totals.avgMs, prev.avgMs)} hint="active on page" />
        <Kpi label="Pages / session" value={pagesPerSession ? pagesPerSession.toFixed(1) : "—"} />
      </div>

      <Panel title="Trend" subtitle={days === 1 ? "By hour" : "By day"}>
        <LineChart
          points={series.map((s) => ({ label: s.label, value: s.views, secondary: s.visitors }))}
          height={190}
        />
      </Panel>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel
          title="Top pages"
          subtitle="Views and average active time per page"
          action={<Link href={`/admin/pages?days=${days}`} className="text-[12px] font-semibold text-blue-600 hover:underline shrink-0">All →</Link>}
        >
          <BarList
            rows={pages.map((p) => ({ key: p.path, value: p.views, extra: fmtDuration(p.avgMs) }))}
            hrefFor={(path) => `/admin/raw?days=${days}&path=${encodeURIComponent(path)}`}
          />
        </Panel>

        <Panel
          title="Events"
          subtitle="Clicks, form submits and other recorded events"
          action={<Link href={`/admin/events?days=${days}`} className="text-[12px] font-semibold text-blue-600 hover:underline shrink-0">All →</Link>}
        >
          <BarList
            rows={events.slice(0, 8).map((e) => ({ key: e.eventName, value: e.count, extra: `${e.sessions} sess.` }))}
            hrefFor={(name) => `/admin/events?days=${days}&name=${encodeURIComponent(name)}`}
          />
        </Panel>

        <Panel title="Traffic sources" subtitle="How sessions start">
          <div className="space-y-4">
            <BarList rows={visitTypes.map((v) => ({ key: v.visitType ?? "(unknown)", value: v.sessions }))} />
            {referrers.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">External referrers</p>
                <BarList rows={referrers.map((r) => ({ key: r.host ?? "—", value: r.sessions }))} />
              </div>
            )}
            {campaigns.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Campaigns</p>
                <BarList rows={campaigns.map((c) => ({
                  key: [c.source, c.medium, c.campaign].filter(Boolean).join(" · "),
                  value: c.sessions,
                }))} />
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Device & country">
          <div className="space-y-4">
            <BarList rows={sources.map((s) => ({ key: s.source ?? "(unknown)", value: s.views }))} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Countries</p>
              {geo ? (
                <BarList rows={countries.map((c) => ({ key: c.country ?? "—", value: c.views }))} />
              ) : (
                <p className="text-[12.5px] text-slate-500 leading-relaxed">
                  Country data is only available on the live server — we read it from Vercel&rsquo;s
                  <code className="mx-1 px-1 py-0.5 bg-slate-100 rounded text-[11px]">x-vercel-ip-country</code>
                  header. Running locally there is no such header, which is why this is empty.
                </p>
              )}
            </div>
          </div>
        </Panel>
      </div>

      <Panel
        title="Recent sessions"
        subtitle="Each row is one visit — click to open its full path"
        action={<Link href={`/admin/sessions?days=${days}`} className="text-[12px] font-semibold text-blue-600 hover:underline shrink-0">All →</Link>}
        pad={false}
      >
        {sessions.length === 0 ? (
          <div className="p-4"><Empty what="sessions" /></div>
        ) : (
          <Table head={["Started", "Entry page", "Views", "Events", "Active", "Source", "Who", ""]}>
            {sessions.map((s) => (
              <tr key={s.session_id} className="hover:bg-slate-50">
                <Td className="text-slate-500 tabular-nums whitespace-nowrap">{fmtTime(s.started_at)}</Td>
                <Td className="font-medium text-slate-800">
                  {s.entry_path} {s.is_new && <Badge tone="green">new</Badge>}
                </Td>
                <Td className="tabular-nums">{s.views}</Td>
                <Td className="tabular-nums">{s.events}</Td>
                <Td className="tabular-nums whitespace-nowrap">{fmtDuration(s.total_ms)}</Td>
                <Td className="text-slate-600 whitespace-nowrap">{s.utm_source ?? s.referrer ?? "direct"}</Td>
                <Td className="text-slate-600 max-w-[160px] truncate">{s.email ?? "anonymous"}</Td>
                <Td>
                  <Link href={`/admin/sessions/${s.session_id}`} className="text-[12px] font-semibold text-blue-600 hover:underline whitespace-nowrap">
                    Open →
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <p className="text-[11px] text-slate-400">
        Form values (income, debt, delinquency) never reach analytics — only field names.
        Browsing the admin panel is not tracked.
      </p>
    </div>
  );
}
