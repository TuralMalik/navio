import Link from "next/link";
import { getRawPageViews, parseRange } from "@/lib/server/analytics-queries";
import {
  PageHeader, RangeTabs, Panel, Table, Td, Badge, Empty, fmtDuration, fmtTime,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 150;

export default async function RawPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; path?: string; page?: string; bots?: string }>;
}) {
  const sp = await searchParams;
  const days = parseRange(sp.days);
  const path = sp.path?.trim() || undefined;
  const includeBots = sp.bots === "1";
  const pageNum = Math.max(1, Number(sp.page) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const rows = await getRawPageViews({ days, path, limit: PAGE_SIZE, offset, includeBots });

  const qs = (over: Record<string, string | undefined>) => {
    const q = new URLSearchParams({ days: String(days) });
    if (path) q.set("path", path);
    if (includeBots) q.set("bots", "1");
    for (const [k, v] of Object.entries(over)) {
      if (v === undefined) q.delete(k);
      else q.set(k, v);
    }
    return `/admin/raw?${q.toString()}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Xam baxışlar"
        subtitle="Cədvəldəki sətirlər olduğu kimi — filtrsiz baxış üçün"
        right={<RangeTabs days={days} base="/admin/raw" params={{ path, bots: includeBots ? "1" : undefined }} />}
      />

      <div className="flex flex-wrap items-center gap-2">
        {path && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[12.5px] font-semibold text-blue-800">
            {path}
            <Link href={qs({ path: undefined })} className="text-blue-500 hover:text-blue-700">×</Link>
          </span>
        )}
        <Link href={qs({ bots: includeBots ? undefined : "1" })}
          className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold border transition-colors ${
            includeBots ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
          }`}>
          {includeBots ? "Botlar göstərilir" : "Botları göstər"}
        </Link>
      </div>

      <Panel title={`${rows.length} sətir`} subtitle={offset > 0 ? `${offset + 1}-dən başlayaraq` : undefined} pad={false}>
        {rows.length === 0 ? (
          <div className="p-4"><Empty what="baxış" /></div>
        ) : (
          <Table head={["Vaxt", "Səhifə", "Aktiv", "Mənbə", "Ölkə", "Cihaz", "Kim", "Sessiya"]}>
            {rows.map((r) => (
              <tr key={r.id} className={`hover:bg-slate-50 ${r.isBot ? "opacity-50" : ""}`}>
                <Td className="text-slate-500 tabular-nums whitespace-nowrap">{fmtTime(r.createdAt)}</Td>
                <Td className="font-medium text-slate-800 whitespace-nowrap">
                  {r.path}
                  {r.isFirstInSession && <> <Badge tone="blue">giriş</Badge></>}
                  {r.isNewVisitor && <> <Badge tone="green">yeni</Badge></>}
                  {r.isBot && <> <Badge tone="red">bot</Badge></>}
                </Td>
                <Td className="tabular-nums whitespace-nowrap">{fmtDuration(r.durationMs)}</Td>
                <Td className="text-slate-600 whitespace-nowrap">{r.utmSource ?? r.referrer ?? "birbaşa"}</Td>
                <Td className="text-slate-500">{r.country ?? "—"}</Td>
                <Td className="text-slate-500">{r.clientSource ?? "—"}</Td>
                <Td className="text-slate-600 max-w-[150px] truncate">{r.email ?? "anonim"}</Td>
                <Td>
                  <Link href={`/admin/sessions/${r.sessionId}`}
                    className="font-mono text-[11px] text-blue-600 hover:underline whitespace-nowrap">
                    {r.sessionId.slice(0, 8)} →
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      {(pageNum > 1 || rows.length === PAGE_SIZE) && (
        <div className="flex gap-2">
          {pageNum > 1 && (
            <Link href={qs({ page: String(pageNum - 1) })}
              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-[12.5px] font-semibold text-slate-700 hover:border-slate-400">
              ← Əvvəlki
            </Link>
          )}
          {rows.length === PAGE_SIZE && (
            <Link href={qs({ page: String(pageNum + 1) })}
              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-[12.5px] font-semibold text-slate-700 hover:border-slate-400">
              Sonrakı →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
