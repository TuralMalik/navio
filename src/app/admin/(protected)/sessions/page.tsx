import { requireAdmin } from "@/lib/server/admin-auth";
import Link from "next/link";
import { getSessions, parseRange } from "@/lib/server/analytics-queries";
import {
  PageHeader, RangeTabs, Panel, Table, Td, Badge, Empty, fmtDuration, fmtTime,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  // Проверяем доступ ДО любых запросов: см. requireAdmin()
  await requireAdmin();

  const { days: raw } = await searchParams;
  const days = parseRange(raw);
  const sessions = await getSessions(days, 200);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sessions"
        subtitle="One session = one visit. A new one starts after 30 minutes of inactivity."
        right={<RangeTabs days={days} base="/admin/sessions" />}
      />

      <Panel title={`${sessions.length} sessions`} subtitle="Click a row to see the full path" pad={false}>
        {sessions.length === 0 ? (
          <div className="p-4"><Empty what="sessions" /></div>
        ) : (
          <Table head={["Started", "Entry page", "Views", "Events", "Active time", "Source", "Country", "Who", ""]}>
            {sessions.map((s) => (
              <tr key={s.session_id} className="hover:bg-slate-50">
                <Td className="text-slate-500 tabular-nums whitespace-nowrap">{fmtTime(s.started_at)}</Td>
                <Td className="font-medium text-slate-800 whitespace-nowrap">
                  {s.entry_path} {s.is_new && <Badge tone="green">new</Badge>}
                </Td>
                <Td className="tabular-nums">{s.views}</Td>
                <Td className="tabular-nums">{s.events}</Td>
                <Td className="tabular-nums whitespace-nowrap">{fmtDuration(s.total_ms)}</Td>
                <Td className="text-slate-600 whitespace-nowrap">{s.utm_source ?? s.referrer ?? "direct"}</Td>
                <Td className="text-slate-500">{s.country ?? "—"}</Td>
                <Td className="text-slate-600 max-w-[160px] truncate">{s.email ?? "anonymous"}</Td>
                <Td>
                  <Link href={`/admin/sessions/${s.session_id}`}
                    className="text-[12px] font-semibold text-blue-600 hover:underline whitespace-nowrap">
                    Open →
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
