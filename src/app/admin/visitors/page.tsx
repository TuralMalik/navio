import { getVisitors, parseRange } from "@/lib/server/analytics-queries";
import {
  PageHeader, RangeTabs, Panel, Table, Td, Badge, Empty, fmtDuration, fmtTime, fmtNumber,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const days = parseRange(sp.days);
  const q = sp.q?.trim().toLowerCase();
  const all = await getVisitors(days, 300);
  const visitors = q ? all.filter((v) => v.visitor.toLowerCase().includes(q)) : all;

  const returning = all.filter((v) => v.sessions > 1).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ziyarətçilər"
        subtitle="Brauzer quraşdırması üzrə — təsadüfi identifikator, şəxsiyyət deyil"
        right={<RangeTabs days={days} base="/admin/visitors" params={{ q: sp.q }} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ziyarətçi</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{fmtNumber(all.length)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Qayıdan</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{fmtNumber(returning)}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">birdən çox sessiya</p>
        </div>
      </div>

      {q && (
        <p className="text-[13px] text-slate-600">
          Filtr: <span className="font-mono">{q}</span> — {visitors.length} nəticə
        </p>
      )}

      <Panel title={`${visitors.length} ziyarətçi`} subtitle="Baxış sayına görə sıralanıb" pad={false}>
        {visitors.length === 0 ? (
          <div className="p-4"><Empty what="ziyarətçi" /></div>
        ) : (
          <Table head={["Ziyarətçi", "Sessiya", "Baxış", "Aktiv vaxt", "İlk görülmə", "Son görülmə", "Ölkə"]}>
            {visitors.map((v) => (
              <tr key={v.visitor} className="hover:bg-slate-50">
                <Td className="font-mono text-[11.5px] text-slate-700">
                  {v.visitor.slice(0, 13)}…{" "}
                  {v.is_new && <Badge tone="green">yeni</Badge>}
                  {v.no_client_id && <Badge tone="amber">sessiya üzrə</Badge>}
                </Td>
                <Td className="tabular-nums font-bold">{v.sessions}</Td>
                <Td className="tabular-nums">{v.views}</Td>
                <Td className="tabular-nums whitespace-nowrap">{fmtDuration(v.total_ms)}</Td>
                <Td className="text-slate-500 tabular-nums whitespace-nowrap">{fmtTime(v.first_seen)}</Td>
                <Td className="text-slate-500 tabular-nums whitespace-nowrap">{fmtTime(v.last_seen)}</Td>
                <Td className="text-slate-500">{v.country ?? "—"}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <p className="text-[11px] text-slate-400">
        «Sessiya üzrə» — brauzer identifikatoru olmayan sətirlər (localStorage bağlıdır);
        onları sessiya üzrə sayırıq, ona görə qayıdışları göstərmir.
      </p>
    </div>
  );
}
