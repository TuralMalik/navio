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
        title="İcmal"
        subtitle={
          <>
            Öz serverimizdə toplanan məlumatlar. Botlar çıxarılıb
            {bots > 0 && <> ({fmtNumber(bots)} bot baxışı filtrləndi)</>}.
          </>
        }
        right={<RangeTabs days={days} base="/admin" />}
      />

      {noData && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[13px] text-amber-800">
          Bu dövr üçün məlumat yoxdur. Sayta daxil olub bir neçə səhifə açın — nəticələr dərhal burada görünür.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Kpi label="Baxış" value={fmtNumber(totals.pageviews)} delta={delta(totals.pageviews, prev.pageviews)} hint="əvvəlki dövrlə" />
        <Kpi label="Sessiya" value={fmtNumber(totals.sessions)} delta={delta(totals.sessions, prev.sessions)} />
        <Kpi label="Ziyarətçi" value={fmtNumber(totals.visitors)} delta={delta(totals.visitors, prev.visitors)} hint="brauzer üzrə" />
        <Kpi label="Yeni" value={fmtNumber(totals.newVisitors)} hint="ilk dəfə gələn" />
        <Kpi label="Orta vaxt" value={fmtDuration(totals.avgMs)} delta={delta(totals.avgMs, prev.avgMs)} hint="səhifədə aktiv" />
        <Kpi label="Sessiyada səhifə" value={pagesPerSession ? pagesPerSession.toFixed(1) : "—"} />
      </div>

      <Panel title="Dinamika" subtitle={days === 1 ? "Saat üzrə" : "Gün üzrə"}>
        <LineChart
          points={series.map((s) => ({ label: s.label, value: s.views, secondary: s.visitors }))}
          height={190}
        />
      </Panel>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel
          title="Ən çox baxılan səhifələr"
          subtitle="Baxış sayı və səhifədə orta aktiv vaxt"
          action={<Link href={`/admin/pages?days=${days}`} className="text-[12px] font-semibold text-blue-600 hover:underline shrink-0">Hamısı →</Link>}
        >
          <BarList
            rows={pages.map((p) => ({ key: p.path, value: p.views, extra: fmtDuration(p.avgMs) }))}
            hrefFor={(path) => `/admin/raw?days=${days}&path=${encodeURIComponent(path)}`}
          />
        </Panel>

        <Panel
          title="Hadisələr"
          subtitle="Klik, forma və digər qeydə alınan hadisələr"
          action={<Link href={`/admin/events?days=${days}`} className="text-[12px] font-semibold text-blue-600 hover:underline shrink-0">Hamısı →</Link>}
        >
          <BarList
            rows={events.slice(0, 8).map((e) => ({ key: e.eventName, value: e.count, extra: `${e.sessions} sess.` }))}
            hrefFor={(name) => `/admin/events?days=${days}&name=${encodeURIComponent(name)}`}
          />
        </Panel>

        <Panel title="Trafik mənbələri" subtitle="Sessiyalar necə başlayır">
          <div className="space-y-4">
            <BarList rows={visitTypes.map((v) => ({ key: v.visitType ?? "(bilinmir)", value: v.sessions }))} />
            {referrers.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Xarici keçidlər</p>
                <BarList rows={referrers.map((r) => ({ key: r.host ?? "—", value: r.sessions }))} />
              </div>
            )}
            {campaigns.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Kampaniyalar</p>
                <BarList rows={campaigns.map((c) => ({
                  key: [c.source, c.medium, c.campaign].filter(Boolean).join(" · "),
                  value: c.sessions,
                }))} />
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Cihaz və ölkə">
          <div className="space-y-4">
            <BarList rows={sources.map((s) => ({ key: s.source ?? "(bilinmir)", value: s.views }))} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Ölkələr</p>
              {geo ? (
                <BarList rows={countries.map((c) => ({ key: c.country ?? "—", value: c.views }))} />
              ) : (
                <p className="text-[12.5px] text-slate-500 leading-relaxed">
                  Ölkə məlumatı yalnız canlı serverdə əlçatandır — onu Vercel-in
                  <code className="mx-1 px-1 py-0.5 bg-slate-100 rounded text-[11px]">x-vercel-ip-country</code>
                  başlığından alırıq. Lokal işləyəndə belə başlıq olmur, ona görə burada boşdur.
                </p>
              )}
            </div>
          </div>
        </Panel>
      </div>

      <Panel
        title="Son sessiyalar"
        subtitle="Hər sətir bir ziyarətin tam yolu — açmaq üçün klikləyin"
        action={<Link href={`/admin/sessions?days=${days}`} className="text-[12px] font-semibold text-blue-600 hover:underline shrink-0">Hamısı →</Link>}
        pad={false}
      >
        {sessions.length === 0 ? (
          <div className="p-4"><Empty what="sessiya" /></div>
        ) : (
          <Table head={["Başlanğıc", "Giriş səhifəsi", "Baxış", "Hadisə", "Vaxt", "Mənbə", "Kim", ""]}>
            {sessions.map((s) => (
              <tr key={s.session_id} className="hover:bg-slate-50">
                <Td className="text-slate-500 tabular-nums whitespace-nowrap">{fmtTime(s.started_at)}</Td>
                <Td className="font-medium text-slate-800">
                  {s.entry_path} {s.is_new && <Badge tone="green">yeni</Badge>}
                </Td>
                <Td className="tabular-nums">{s.views}</Td>
                <Td className="tabular-nums">{s.events}</Td>
                <Td className="tabular-nums whitespace-nowrap">{fmtDuration(s.total_ms)}</Td>
                <Td className="text-slate-600 whitespace-nowrap">{s.utm_source ?? s.referrer ?? "birbaşa"}</Td>
                <Td className="text-slate-600 max-w-[160px] truncate">{s.email ?? "anonim"}</Td>
                <Td>
                  <Link href={`/admin/sessions/${s.session_id}`} className="text-[12px] font-semibold text-blue-600 hover:underline whitespace-nowrap">
                    Aç →
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <p className="text-[11px] text-slate-400">
        Forma dəyərləri (gəlir, borc, gecikmə) analitikaya düşmür — yalnız sahə adları.
        Admin panelindəki gəzişmə qeydə alınmır.
      </p>
    </div>
  );
}
