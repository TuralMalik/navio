import Link from "next/link";
import {
  getTotals, getBotCount, getTopPaths, getEntryPaths, getTopEvents, getTopClicks,
  getVisitTypes, getReferrers, getCampaigns, getCountries, getDailyViews,
  getLiveViews, getLiveEvents, type Range,
} from "@/lib/server/analytics-queries";

export const dynamic = "force-dynamic";

const RANGES: { days: Range; label: string }[] = [
  { days: 1, label: "24 saat" },
  { days: 7, label: "7 gün" },
  { days: 30, label: "30 gün" },
];

function fmtDuration(ms: number): string {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} san`;
  const m = Math.floor(s / 60);
  return `${m} d ${String(s % 60).padStart(2, "0")} san`;
}

/** Детерминированное время без Intl — как в остальном проекте. */
function fmtTime(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>}
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-4 overflow-x-auto">{children}</div>
    </section>
  );
}

function Empty({ what }: { what: string }) {
  return <p className="text-[13px] text-slate-500">Hələ {what} yoxdur.</p>;
}

/** Простая горизонтальная гистограмма — без внешних библиотек. */
function Bars({ rows }: { rows: { key: string; value: number; extra?: string }[] }) {
  if (rows.length === 0) return <Empty what="məlumat" />;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.key} className="flex items-center gap-3 text-[13px]">
          <span className="w-[46%] truncate text-slate-700" title={r.key}>{r.key}</span>
          <span className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
            <span className="block h-full rounded-full bg-blue-500" style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="w-14 text-right font-bold text-slate-900 tabular-nums">{r.value}</span>
          {r.extra !== undefined && <span className="w-20 text-right text-slate-500 tabular-nums">{r.extra}</span>}
        </div>
      ))}
    </div>
  );
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: daysParam } = await searchParams;
  const parsed = Number(daysParam);
  const days: Range = parsed === 1 || parsed === 30 ? parsed : 7;

  const [
    totals, bots, topPaths, entryPaths, topEvents, topClicks,
    visitTypes, referrers, campaigns, countries, daily, liveViews, liveEvents,
  ] = await Promise.all([
    getTotals(days), getBotCount(days), getTopPaths(days), getEntryPaths(days),
    getTopEvents(days), getTopClicks(days), getVisitTypes(days), getReferrers(days),
    getCampaigns(days), getCountries(days), getDailyViews(days), getLiveViews(), getLiveEvents(),
  ]);

  const noData = totals.pageviews === 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Analitika</h1>
          <p className="text-[13px] text-slate-500">
            Öz serverimizdə toplanan məlumatlar. Botlar göstəricilərdən çıxarılıb
            {bots > 0 && ` (${bots} bot baxışı filtrlənib)`}.
          </p>
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {RANGES.map((r) => (
            <Link key={r.days} href={`/admin?days=${r.days}`}
              className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${
                r.days === days ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}>
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {noData && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[13px] text-amber-800">
          Bu dövr üçün məlumat yoxdur. Sayta daxil olub bir-iki səhifə açın — bir neçə saniyə
          sonra göstəricilər burada görünəcək.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Kpi label="Baxış" value={String(totals.pageviews)} />
        <Kpi label="Sessiya" value={String(totals.sessions)} />
        <Kpi label="Ziyarətçi" value={String(totals.visitors)} hint="brauzer üzrə" />
        <Kpi label="Yeni" value={String(totals.newVisitors)} hint="ilk dəfə" />
        <Kpi label="Orta vaxt" value={fmtDuration(totals.avgMs)} hint="səhifədə aktiv" />
        <Kpi label="Hesabla girən" value={String(totals.signedIn)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Səhifələr" subtitle="Baxış sayı və səhifədə orta aktiv vaxt">
          {topPaths.length === 0 ? <Empty what="baxış" /> : (
            <Bars rows={topPaths.map((p) => ({ key: p.path, value: p.views, extra: fmtDuration(p.avgMs) }))} />
          )}
        </Panel>

        <Panel title="Giriş səhifələri" subtitle="Sessiyanın başladığı səhifə">
          {entryPaths.length === 0 ? <Empty what="sessiya" /> : (
            <Bars rows={entryPaths.map((p) => ({ key: p.path, value: p.sessions }))} />
          )}
        </Panel>

        <Panel title="Kliklər" subtitle="Ən çox basılan düymə və linklər">
          {topClicks.length === 0 ? <Empty what="klik" /> : (
            <Bars rows={topClicks.map((c) => ({ key: c.label, value: c.count, extra: c.to ?? undefined }))} />
          )}
        </Panel>

        <Panel title="Hadisələr" subtitle="Bütün qeyd olunan hadisə növləri">
          {topEvents.length === 0 ? <Empty what="hadisə" /> : (
            <Bars rows={topEvents.map((e) => ({ key: e.eventName, value: e.count, extra: `${e.sessions} sess.` }))} />
          )}
        </Panel>

        <Panel title="Mənbələr" subtitle="Sessiyalar necə başlayır">
          <div className="space-y-4">
            <Bars rows={visitTypes.map((v) => ({ key: v.visitType ?? "(bilinmir)", value: v.sessions }))} />
            {referrers.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Xarici keçidlər</p>
                <Bars rows={referrers.map((r) => ({ key: r.host ?? "—", value: r.sessions }))} />
              </div>
            )}
            {campaigns.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Kampaniyalar</p>
                <Bars rows={campaigns.map((c) => ({
                  key: [c.source, c.campaign].filter(Boolean).join(" · "),
                  value: c.sessions,
                }))} />
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Günlər / Ölkələr">
          <div className="space-y-4">
            <Bars rows={daily.map((d) => ({ key: d.day, value: d.views, extra: `${d.visitors} ziy.` }))} />
            {countries.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Ölkələr</p>
                <Bars rows={countries.map((c) => ({ key: c.country ?? "—", value: c.views }))} />
              </div>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Canlı baxışlar" subtitle="Son 40 səhifə baxışı">
        {liveViews.length === 0 ? <Empty what="baxış" /> : (
          <table className="w-full text-[12.5px] whitespace-nowrap">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-100">
                <th className="pb-2 pr-4 font-semibold">Vaxt</th>
                <th className="pb-2 pr-4 font-semibold">Səhifə</th>
                <th className="pb-2 pr-4 font-semibold">Vaxt</th>
                <th className="pb-2 pr-4 font-semibold">Kim</th>
                <th className="pb-2 pr-4 font-semibold">Ölkə</th>
                <th className="pb-2 font-semibold">Sessiya</th>
              </tr>
            </thead>
            <tbody>
              {liveViews.map((v) => (
                <tr key={v.id} className="border-b border-slate-50">
                  <td className="py-1.5 pr-4 text-slate-500 tabular-nums">{fmtTime(v.createdAt)}</td>
                  <td className="py-1.5 pr-4 font-medium text-slate-800">
                    {v.path}
                    {v.isFirstInSession && <span className="ml-1.5 text-[10px] text-blue-600">giriş</span>}
                    {v.isNewVisitor && <span className="ml-1.5 text-[10px] text-emerald-600">yeni</span>}
                  </td>
                  <td className="py-1.5 pr-4 text-slate-600 tabular-nums">{fmtDuration(v.durationMs)}</td>
                  <td className="py-1.5 pr-4 text-slate-600 max-w-[180px] truncate">{v.email ?? "anonim"}</td>
                  <td className="py-1.5 pr-4 text-slate-500">{v.country ?? "—"}</td>
                  <td className="py-1.5 text-slate-400 font-mono text-[11px]">{v.sessionId.slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Canlı hadisələr" subtitle="Son 40 klik / forma / hadisə">
        {liveEvents.length === 0 ? <Empty what="hadisə" /> : (
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-100">
                <th className="pb-2 pr-4 font-semibold">Vaxt</th>
                <th className="pb-2 pr-4 font-semibold">Hadisə</th>
                <th className="pb-2 pr-4 font-semibold">Səhifə</th>
                <th className="pb-2 pr-4 font-semibold">Detallar</th>
                <th className="pb-2 font-semibold">Sessiya</th>
              </tr>
            </thead>
            <tbody>
              {liveEvents.map((e) => (
                <tr key={e.id} className="border-b border-slate-50 align-top">
                  <td className="py-1.5 pr-4 text-slate-500 tabular-nums whitespace-nowrap">{fmtTime(e.createdAt)}</td>
                  <td className="py-1.5 pr-4 font-mono text-[11.5px] text-slate-800 whitespace-nowrap">{e.eventName}</td>
                  <td className="py-1.5 pr-4 text-slate-600 whitespace-nowrap">{e.path ?? "—"}</td>
                  <td className="py-1.5 pr-4 text-slate-600 break-all max-w-[420px]">
                    {e.props ? JSON.stringify(e.props) : "—"}
                  </td>
                  <td className="py-1.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">{e.sessionId.slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <p className="text-[11px] text-slate-400">
        Forma dəyərləri (gəlir, borc, gecikmə) analitikaya düşmür — yalnız sahə adları.
      </p>
    </div>
  );
}
