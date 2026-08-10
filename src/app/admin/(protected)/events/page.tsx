import { requireAdmin } from "@/lib/server/admin-auth";
import Link from "next/link";
import { getEventNames, getEvents, getEventBreakdown, parseRange } from "@/lib/server/analytics-queries";
import {
  PageHeader, RangeTabs, Panel, BarList, Table, Td, Empty, fmtTime, fmtNumber,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 150;

/** props показываем как читаемые пары, а не как сырой JSON-ком. */
function Props({ value }: { value: unknown }) {
  if (!value || typeof value !== "object") return <span className="text-slate-400">—</span>;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return <span className="text-slate-400">—</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {entries.map(([k, v]) => (
        <span key={k} className="inline-flex items-baseline gap-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">{k}</span>
          <span className="text-[11.5px] text-slate-700 font-medium break-all">
            {typeof v === "object" ? JSON.stringify(v) : String(v)}
          </span>
        </span>
      ))}
    </span>
  );
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; name?: string; page?: string }>;
}) {
  // Проверяем доступ ДО любых запросов: см. requireAdmin()
  await requireAdmin();

  const sp = await searchParams;
  const days = parseRange(sp.days);
  const name = sp.name?.trim() || undefined;
  const pageNum = Math.max(1, Number(sp.page) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const [names, events, breakdown] = await Promise.all([
    getEventNames(days),
    getEvents({ days, name, limit: PAGE_SIZE, offset }),
    name ? getEventBreakdown(days, name) : Promise.resolve([]),
  ]);

  const linkFor = (n?: string) => {
    const q = new URLSearchParams({ days: String(days) });
    if (n) q.set("name", n);
    return `/admin/events?${q.toString()}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Events"
        subtitle="Every click, form submit and other recorded event"
        right={<RangeTabs days={days} base="/admin/events" params={{ name }} />}
      />

      {/* Фильтр по типу события */}
      <div className="flex flex-wrap gap-1.5">
        <Link href={linkFor()}
          className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold border transition-colors ${
            !name ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
          }`}>
          All
        </Link>
        {names.map((n) => (
          <Link key={n.eventName} href={linkFor(n.eventName)}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold border transition-colors font-mono ${
              name === n.eventName ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}>
            {n.eventName} <span className="opacity-60">{fmtNumber(n.count)}</span>
          </Link>
        ))}
      </div>

      {name && breakdown.length > 0 && (
        <Panel title={`${name} — breakdown`} subtitle="By element / form / field">
          <BarList rows={breakdown.map((b) => ({ key: b.label, value: b.count }))} />
        </Panel>
      )}

      <Panel
        title={name ? `${name}` : "All events"}
        subtitle={`${events.length} rows${offset > 0 ? ` · ${offset + 1}onwards` : ""}`}
        pad={false}
      >
        {events.length === 0 ? (
          <div className="p-4"><Empty what="events" /></div>
        ) : (
          <Table head={["Time", "Event", "Page", "Details", "Who", "Session"]}>
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50 align-top">
                <Td className="text-slate-500 tabular-nums whitespace-nowrap">{fmtTime(e.createdAt)}</Td>
                <Td>
                  <Link href={linkFor(e.eventName)} className="font-mono text-[11.5px] text-slate-800 hover:text-blue-600 hover:underline whitespace-nowrap">
                    {e.eventName}
                  </Link>
                </Td>
                <Td className="text-slate-600 whitespace-nowrap">{e.path ?? "—"}</Td>
                <Td className="max-w-[420px]"><Props value={e.props} /></Td>
                <Td className="text-slate-600 max-w-[150px] truncate">{e.email ?? "anonymous"}</Td>
                <Td>
                  <Link href={`/admin/sessions/${e.sessionId}`}
                    className="font-mono text-[11px] text-blue-600 hover:underline whitespace-nowrap">
                    {e.sessionId.slice(0, 8)} →
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      {(pageNum > 1 || events.length === PAGE_SIZE) && (
        <div className="flex gap-2">
          {pageNum > 1 && (
            <Link href={`${linkFor(name)}&page=${pageNum - 1}`}
              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-[12.5px] font-semibold text-slate-700 hover:border-slate-400">
              ← Previous
            </Link>
          )}
          {events.length === PAGE_SIZE && (
            <Link href={`${linkFor(name)}&page=${pageNum + 1}`}
              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-[12.5px] font-semibold text-slate-700 hover:border-slate-400">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
