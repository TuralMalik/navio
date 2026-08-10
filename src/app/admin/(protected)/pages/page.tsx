import { requireAdmin } from "@/lib/server/admin-auth";
import Link from "next/link";
import { getPages, getTotals, parseRange } from "@/lib/server/analytics-queries";
import {
  PageHeader, RangeTabs, Panel, Table, Td, Empty, fmtDuration, fmtNumber,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function PagesPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  // Проверяем доступ ДО любых запросов: см. requireAdmin()
  await requireAdmin();

  const { days: raw } = await searchParams;
  const days = parseRange(raw);
  const [pages, totals] = await Promise.all([getPages(days, 200), getTotals(days)]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pages"
        subtitle="Per page: views, visitors, average active time and entry count"
        right={<RangeTabs days={days} base="/admin/pages" />}
      />

      <Panel title={`${pages.length} pages`} subtitle="Sorted by view count" pad={false}>
        {pages.length === 0 ? (
          <div className="p-4"><Empty what="views" /></div>
        ) : (
          <Table head={["Page", "Views", "Share", "Visitors", "Avg. time", "Entries", "Raw"]}>
            {pages.map((p) => {
              const share = totals.pageviews ? (p.views / totals.pageviews) * 100 : 0;
              return (
                <tr key={p.path} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-800">{p.path}</Td>
                  <Td className="tabular-nums font-bold">{fmtNumber(p.views)}</Td>
                  <Td className="w-[140px]">
                    <span className="flex items-center gap-2">
                      <span className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden min-w-[50px]">
                        <span className="block h-full rounded-full bg-blue-500" style={{ width: `${share}%` }} />
                      </span>
                      <span className="text-[11px] text-slate-500 tabular-nums w-9 text-right">{share.toFixed(0)}%</span>
                    </span>
                  </Td>
                  <Td className="tabular-nums">{fmtNumber(p.visitors)}</Td>
                  <Td className="tabular-nums whitespace-nowrap">{fmtDuration(p.avgMs)}</Td>
                  <Td className="tabular-nums" title="Sessions that started on this page">{fmtNumber(p.entries)}</Td>
                  <Td>
                    <Link href={`/admin/raw?days=${days}&path=${encodeURIComponent(p.path)}`}
                      className="text-[12px] font-semibold text-blue-600 hover:underline whitespace-nowrap">
                      View →
                    </Link>
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
      </Panel>

      <p className="text-[11px] text-slate-400">
        &quot;Entries&quot; counts sessions that started on that page. &quot;Avg. time&quot; ignores
        zero-duration views — those are instant bounces whose heartbeat never arrived.
      </p>
    </div>
  );
}
