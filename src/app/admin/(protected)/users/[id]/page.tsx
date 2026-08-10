import { requireAdmin } from "@/lib/server/admin-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserDetail } from "@/lib/server/analytics-queries";
import {
  PageHeader, Panel, Card, Table, Td, Badge, Empty, fmtTime, fmtDuration,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Проверяем доступ ДО любых запросов: см. requireAdmin()
  await requireAdmin();

  const { id } = await params;
  const data = await getUserDetail(id);
  if (!data) notFound();

  const { user: u, calculations, views, providers } = data;

  return (
    <div className="space-y-5">
      <PageHeader
        title={u.name || u.email}
        subtitle={u.email}
        right={
          <Link href="/admin/users" className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-[12.5px] font-semibold text-slate-700 hover:border-slate-400">
            ← Users
          </Link>
        }
      />

      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Registered</p>
            <p className="text-[13px] text-slate-800 mt-1 tabular-nums">{fmtTime(u.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Email verified</p>
            <p className="mt-1">{u.emailVerified ? <Badge tone="green">yes</Badge> : <Badge tone="amber">no</Badge>}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Sign-in methods</p>
            <p className="mt-1 flex gap-1 flex-wrap">
              {providers.length === 0 ? <span className="text-slate-400 text-[13px]">—</span> : providers.map((p) => (
                <Badge key={p.provider_id} tone={p.provider_id === "google" ? "blue" : "slate"}>
                  {p.provider_id === "credential" ? "password" : p.provider_id}
                </Badge>
              ))}
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Scorings</p>
            <p className="text-[15px] font-bold text-slate-800 mt-1 tabular-nums">{calculations.length}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">User id</p>
            <p className="text-[11px] font-mono text-slate-500 mt-1 break-all">{u.id}</p>
          </div>
        </div>
      </Card>

      <Panel title="Scoring submissions" subtitle="Everything this account has run" pad={false}>
        {calculations.length === 0 ? (
          <div className="p-4"><Empty what="submissions" /></div>
        ) : (
          <Table head={["Time", "Mode", "Score", "BGN", "", ""]}>
            {calculations.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <Td className="text-slate-500 tabular-nums whitespace-nowrap">{fmtTime(c.createdAt)}</Td>
                <Td className="uppercase text-[11px] font-bold text-slate-500">{c.mode}</Td>
                <Td className="tabular-nums font-bold">{c.blocked ? "—" : c.score}</Td>
                <Td className="tabular-nums">{c.bgn != null ? `${c.bgn.toFixed(1)}%` : "—"}</Td>
                <Td>{c.blocked && <Badge tone="red">blocked</Badge>}</Td>
                <Td>
                  <Link href={`/admin/scorings/${c.id}`}
                    className="text-[12px] font-semibold text-blue-600 hover:underline whitespace-nowrap">
                    Open →
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel title="Recent page views" subtitle="Only visits made while signed in" pad={false}>
        {views.length === 0 ? (
          <div className="p-4"><Empty what="views" /></div>
        ) : (
          <Table head={["Time", "Page", "Active", "Session"]}>
            {views.map((v, i) => (
              <tr key={`${v.sessionId}-${i}`} className="hover:bg-slate-50">
                <Td className="text-slate-500 tabular-nums whitespace-nowrap">{fmtTime(v.createdAt)}</Td>
                <Td className="font-medium text-slate-800">{v.path}</Td>
                <Td className="tabular-nums whitespace-nowrap">{fmtDuration(v.durationMs)}</Td>
                <Td>
                  <Link href={`/admin/sessions/${v.sessionId}`}
                    className="font-mono text-[11px] text-blue-600 hover:underline whitespace-nowrap">
                    {v.sessionId.slice(0, 8)} →
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
