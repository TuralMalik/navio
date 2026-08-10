import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, MousePointerClick } from "lucide-react";
import { getSessionTimeline } from "@/lib/server/analytics-queries";
import { PageHeader, Panel, Card, Badge, fmtDuration, fmtTime } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-[13px] text-slate-800 mt-0.5 break-words">{value}</p>
    </div>
  );
}

function Props({ value }: { value: unknown }) {
  if (!value || typeof value !== "object") return null;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return null;
  return (
    <span className="flex flex-wrap gap-1.5 mt-1">
      {entries.map(([k, v]) => (
        <span key={k} className="inline-flex items-baseline gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">{k}</span>
          <span className="text-[11.5px] text-slate-700 font-medium break-all">
            {typeof v === "object" ? JSON.stringify(v) : String(v)}
          </span>
        </span>
      ))}
    </span>
  );
}

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { meta, items, viewCount, eventCount } = await getSessionTimeline(id);

  // Нет ни одного просмотра — такой сессии у нас не было
  if (!meta) notFound();

  const started = items[0]?.at;
  const ended = items[items.length - 1]?.at;
  const wallMs = started && ended ? ended.getTime() - started.getTime() : 0;
  const activeMs = items.reduce((sum, i) => sum + (i.kind === "view" ? i.durationMs : 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sessiya"
        subtitle={<span className="font-mono text-[12px]">{id}</span>}
        right={
          <Link href="/admin/sessions" className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-[12.5px] font-semibold text-slate-700 hover:border-slate-400">
            ← Sessiyalar
          </Link>
        }
      />

      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Meta label="Başlanğıc" value={started ? fmtTime(started) : "—"} />
          <Meta label="Aktiv vaxt" value={fmtDuration(activeMs)} />
          <Meta label="Ümumi müddət" value={fmtDuration(wallMs)} />
          <Meta label="Səhifə / hadisə" value={`${viewCount} / ${eventCount}`} />
          <Meta label="Kim" value={meta.email ?? "anonim"} />
          <Meta label="Mənbə" value={meta.utmSource ?? meta.referrer ?? meta.visitType ?? "birbaşa"} />
          <Meta label="Kampaniya" value={meta.utmCampaign ?? "—"} />
          <Meta label="Ölkə / cihaz" value={`${meta.country ?? "—"} · ${meta.clientSource ?? "—"}`} />
          <Meta label="Brauzer" value={<span className="text-[11px] text-slate-500 break-all">{meta.userAgent ?? "—"}</span>} />
          <Meta
            label="Ziyarətçi"
            value={
              meta.clientId ? (
                <Link href={`/admin/visitors?q=${encodeURIComponent(meta.clientId)}`} className="font-mono text-[11.5px] text-blue-600 hover:underline">
                  {meta.clientId.slice(0, 13)}…
                </Link>
              ) : "—"
            }
          />
        </div>
      </Card>

      <Panel title="Yol" subtitle="Səhifə baxışları və hadisələr vaxt sırası ilə">
        <ol className="relative border-l border-slate-200 ml-2 space-y-3">
          {items.map((item, i) => (
            <li key={i} className="pl-5 relative">
              <span
                className={`absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full grid place-items-center ${
                  item.kind === "view" ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                {item.kind === "view"
                  ? <FileText size={8} className="text-white" />
                  : <MousePointerClick size={8} className="text-slate-700" />}
              </span>

              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400 tabular-nums">{fmtTime(item.at)}</span>
                {item.kind === "view" ? (
                  <>
                    <span className="text-[13.5px] font-semibold text-slate-900">{item.path}</span>
                    {item.isFirst && <Badge tone="blue">giriş</Badge>}
                    {item.durationMs > 0 && (
                      <span className="text-[11.5px] text-slate-500">{fmtDuration(item.durationMs)} aktiv</span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="font-mono text-[12px] text-slate-700">{item.eventName}</span>
                    {item.path && <span className="text-[11.5px] text-slate-400">{item.path}</span>}
                  </>
                )}
              </div>
              {item.kind === "event" && <Props value={item.props} />}
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
