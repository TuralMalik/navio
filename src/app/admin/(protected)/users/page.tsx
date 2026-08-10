import { requireAdmin } from "@/lib/server/admin-auth";
import Link from "next/link";
import { getUsers } from "@/lib/server/analytics-queries";
import { PageHeader, Panel, Kpi, Table, Td, Badge, Empty, fmtTime, fmtNumber } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/** Провайдеры входа: credential = почта+пароль, остальное — соцвход. */
function providerBadges(providers: string | null) {
  const list = (providers ?? "").split(",").filter(Boolean);
  if (list.length === 0) return <span className="text-slate-400">—</span>;
  return (
    <span className="flex gap-1">
      {list.map((p) => (
        <Badge key={p} tone={p === "google" ? "blue" : "slate"}>
          {p === "credential" ? "password" : p}
        </Badge>
      ))}
    </span>
  );
}

export default async function UsersPage() {
  // Проверяем доступ ДО любых запросов: см. requireAdmin()
  await requireAdmin();

  const users = await getUsers(300);

  const verified = users.filter((u) => u.email_verified).length;
  const withGoogle = users.filter((u) => (u.providers ?? "").includes("google")).length;
  const withCalcs = users.filter((u) => u.calculations > 0).length;

  return (
    <div className="space-y-5">
      <PageHeader title="Users" subtitle="Registered accounts, newest first" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Accounts" value={fmtNumber(users.length)} />
        <Kpi label="Verified email" value={fmtNumber(verified)} hint="optional today" />
        <Kpi label="Via Google" value={fmtNumber(withGoogle)} />
        <Kpi label="Ran a scoring" value={fmtNumber(withCalcs)} />
      </div>

      <Panel title={`${users.length} accounts`} pad={false}>
        {users.length === 0 ? (
          <div className="p-4"><Empty what="accounts" /></div>
        ) : (
          <Table head={["Registered", "Email", "Name", "Sign-in", "Verified", "Scorings", "Sessions", "Views", "Last seen", ""]}>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <Td className="text-slate-500 tabular-nums whitespace-nowrap">{fmtTime(u.created_at)}</Td>
                <Td className="font-medium text-slate-800 max-w-[220px] truncate" title={u.email}>{u.email}</Td>
                <Td className="text-slate-600 max-w-[150px] truncate">{u.name || "—"}</Td>
                <Td>{providerBadges(u.providers)}</Td>
                <Td>{u.email_verified ? <Badge tone="green">yes</Badge> : <Badge tone="amber">no</Badge>}</Td>
                <Td className="tabular-nums font-bold">{u.calculations}</Td>
                <Td className="tabular-nums">{u.sessions}</Td>
                <Td className="tabular-nums">{u.views}</Td>
                <Td className="text-slate-500 tabular-nums whitespace-nowrap">
                  {u.last_seen ? fmtTime(u.last_seen) : "never"}
                </Td>
                <Td>
                  <Link href={`/admin/users/${u.id}`}
                    className="text-[12px] font-semibold text-blue-600 hover:underline whitespace-nowrap">
                    Open →
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <p className="text-[11px] text-slate-400">
        &quot;Last seen&quot; comes from page views, so it is only populated for visits made while signed in.
        Email verification is currently optional, so &quot;no&quot; is not a problem.
      </p>
    </div>
  );
}
