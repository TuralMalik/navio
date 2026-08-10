import Link from "next/link";
import { FileText, MousePointerClick, Calculator, UserPlus } from "lucide-react";
import { getActivityFeed, parseRange } from "@/lib/server/analytics-queries";
import { PageHeader, RangeTabs, Panel, Badge, Empty, fmtTime, fmtDuration } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const KINDS = [
  { key: "view", label: "Page views", icon: FileText, tone: "blue" as const },
  { key: "event", label: "Events", icon: MousePointerClick, tone: "slate" as const },
  { key: "scoring", label: "Scorings", icon: Calculator, tone: "green" as const },
  { key: "signup", label: "Sign-ups", icon: UserPlus, tone: "amber" as const },
];

/** props приходят строкой (union в SQL) — печатаем компактно и не падаем на мусоре. */
function shortProps(detail: string | null): string | null {
  if (!detail) return null;
  try {
    const obj = JSON.parse(detail) as Record<string, unknown>;
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
      .join("  ·  ")
      .slice(0, 160);
  } catch {
    return detail.slice(0, 160);
  }
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; kind?: string }>;
}) {
  const sp = await searchParams;
  const days = parseRange(sp.days);
  const kind = KINDS.some((k) => k.key === sp.kind) ? sp.kind : undefined;

  const feed = await getActivityFeed(days, 250, kind ? [kind] : undefined);

  const href = (k?: string) => {
    const q = new URLSearchParams({ days: String(days) });
    if (k) q.set("kind", k);
    return `/admin/activity?${q.toString()}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Activity"
        subtitle="Everything happening on the site in one chronological stream"
        right={<RangeTabs days={days} base="/admin/activity" params={{ kind }} />}
      />

      <div className="flex flex-wrap gap-1.5">
        <Link href={href()}
          className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold border transition-colors ${
            !kind ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
          }`}>
          Everything
        </Link>
        {KINDS.map((k) => (
          <Link key={k.key} href={href(k.key)}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold border transition-colors ${
              kind === k.key ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}>
            {k.label}
          </Link>
        ))}
      </div>

      <Panel title={`${feed.length} entries`} subtitle="Newest first">
        {feed.length === 0 ? (
          <Empty what="activity" />
        ) : (
          <ol className="space-y-0.5">
            {feed.map((row, i) => {
              const meta = KINDS.find((k) => k.key === row.kind) ?? KINDS[0];
              const Icon = meta.icon;
              const props = row.kind === "event" ? shortProps(row.detail) : null;

              return (
                <li key={i} className="flex items-start gap-3 py-1.5 border-b border-slate-50 last:border-0">
                  <span className="w-6 h-6 rounded-md bg-slate-100 grid place-items-center shrink-0 mt-0.5">
                    <Icon size={12} className="text-slate-600" />
                  </span>

                  <span className="text-[11px] text-slate-400 tabular-nums shrink-0 w-[86px] mt-1">
                    {fmtTime(row.created_at)}
                  </span>

                  <span className="min-w-0 flex-1">
                    {row.kind === "view" && (
                      <>
                        <span className="text-[13.5px] font-semibold text-slate-900">{row.title}</span>
                        {row.num ? <span className="ml-2 text-[11.5px] text-slate-500">{fmtDuration(row.num)} active</span> : null}
                      </>
                    )}
                    {row.kind === "event" && (
                      <>
                        <span className="font-mono text-[12px] text-slate-800">{row.title}</span>
                        {row.ref && <span className="ml-2 text-[11.5px] text-slate-400">{row.ref}</span>}
                        {props && <span className="block text-[11.5px] text-slate-500 mt-0.5 break-all">{props}</span>}
                      </>
                    )}
                    {row.kind === "scoring" && (
                      <>
                        <span className="text-[13.5px] font-semibold text-slate-900">
                          Scoring run <span className="uppercase text-[11px] text-slate-500">{row.title}</span>
                        </span>
                        {row.num != null && <span className="ml-2 text-[12px] font-bold tabular-nums">{row.num}/100</span>}
                        {row.detail && <span className="ml-2 text-[11.5px] text-slate-500">{row.detail}</span>}
                        {row.ref && (
                          <Link href={`/admin/scorings/${row.ref}`} className="ml-2 text-[11.5px] font-semibold text-blue-600 hover:underline">
                            open →
                          </Link>
                        )}
                      </>
                    )}
                    {row.kind === "signup" && (
                      <>
                        <Badge tone="amber">new account</Badge>
                        <span className="ml-2 text-[13.5px] font-semibold text-slate-900">{row.title}</span>
                        {row.ref && (
                          <Link href={`/admin/users/${row.ref}`} className="ml-2 text-[11.5px] font-semibold text-blue-600 hover:underline">
                            open →
                          </Link>
                        )}
                      </>
                    )}
                  </span>

                  <span className="text-[11px] text-slate-400 shrink-0 max-w-[140px] truncate hidden sm:block">
                    {row.email ?? (row.kind === "signup" ? "" : "anonymous")}
                  </span>

                  {row.session_id && (
                    <Link href={`/admin/sessions/${row.session_id}`}
                      className="font-mono text-[10.5px] text-blue-600 hover:underline shrink-0 hidden md:block mt-1">
                      {row.session_id.slice(0, 8)}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
    </div>
  );
}
