import Link from "next/link";

/* Примитивы админки. Графики — инлайновый SVG: никакой внешней библиотеки,
   ничего не тянется в бандл, полный контроль над видом. */

export function fmtDuration(ms: number | string | null | undefined): string {
  const n = typeof ms === "string" ? Number(ms) : ms ?? 0;
  if (!n || n <= 0) return "—";
  const s = Math.round(n / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, "0")}s`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}

/** Детерминированные даты без Intl — как во всём проекте (hydration). */
export function fmtTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(date.getDate())}.${p(date.getMonth() + 1)} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}

export function fmtNumber(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-slate-200 ${className}`}>{children}</div>;
}

export function Panel({
  title, subtitle, action, children, pad = true,
}: {
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; pad?: boolean;
}) {
  return (
    <Card>
      <div className="px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={pad ? "p-4 overflow-x-auto" : "overflow-x-auto"}>{children}</div>
    </Card>
  );
}

export function Kpi({
  label, value, hint, delta,
}: {
  label: string; value: string; hint?: string; delta?: number | null;
}) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{value}</p>
        {delta != null && Number.isFinite(delta) && (
          <span className={`text-[11px] font-bold tabular-nums ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(Math.round(delta))}%
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>}
    </Card>
  );
}

export function Empty({ what }: { what: string }) {
  return <p className="text-[13px] text-slate-500 py-2">No {what} yet.</p>;
}

export function Badge({ tone = "slate", children }: { tone?: "slate" | "blue" | "green" | "amber" | "red"; children: React.ReactNode }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-600",
  };
  return <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${tones[tone]}`}>{children}</span>;
}

/* ─── Горизонтальный список-гистограмма ─── */
export function BarList({
  rows, hrefFor,
}: {
  rows: { key: string; value: number; extra?: string }[];
  hrefFor?: (key: string) => string;
}) {
  if (rows.length === 0) return <Empty what="data" />;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-1.5">
      {rows.map((r) => {
        const label = hrefFor ? (
          <Link href={hrefFor(r.key)} className="hover:text-blue-600 hover:underline truncate">{r.key}</Link>
        ) : (
          <span className="truncate">{r.key}</span>
        );
        return (
          <div key={r.key} className="flex items-center gap-3 text-[13px]">
            <span className="w-[44%] text-slate-700 min-w-0 flex" title={r.key}>{label}</span>
            <span className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden min-w-[40px]">
              <span className="block h-full rounded-full bg-blue-500" style={{ width: `${(r.value / max) * 100}%` }} />
            </span>
            <span className="w-14 text-right font-bold text-slate-900 tabular-nums">{fmtNumber(r.value)}</span>
            <span className="w-20 text-right text-slate-500 tabular-nums text-[12px]">{r.extra ?? ""}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Линейный график (area + line) на чистом SVG ───
   Рисуем в viewBox 0..100 по X и 0..100 по Y, растягиваем по ширине через CSS.
   preserveAspectRatio="none" — график тянется, а подписи рисуем отдельным
   слоем HTML, чтобы шрифт не растягивался вместе с ним. */
export function LineChart({
  points, height = 160,
}: {
  points: { label: string; value: number; secondary?: number }[];
  height?: number;
}) {
  if (points.length === 0) return <Empty what="data" />;

  const max = Math.max(...points.map((p) => Math.max(p.value, p.secondary ?? 0)), 1);
  const n = points.length;
  const x = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v: number) => 100 - (v / max) * 92 - 4;

  const line = (key: "value" | "secondary") => {
    const vals = points.map((p) => (key === "value" ? p.value : p.secondary ?? 0));
    return vals.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(" ");
  };
  const area = `${line("value")} L ${x(n - 1).toFixed(2)} 100 L ${x(0).toFixed(2)} 100 Z`;
  const hasSecondary = points.some((p) => p.secondary != null);

  // Подписи: показываем не больше ~8, иначе слипаются
  const labelStep = Math.max(1, Math.ceil(n / 8));

  return (
    <div>
      <div className="relative" style={{ height }}>
        {/* Сетка и максимум */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-slate-100" />
          ))}
        </div>
        <span className="absolute right-0 -top-1 text-[10px] text-slate-400 tabular-nums">{fmtNumber(max)}</span>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full relative">
          <defs>
            <linearGradient id="navioAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2447F0" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2447F0" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#navioAreaFill)" />
          {hasSecondary && (
            <path d={line("secondary")} fill="none" stroke="#94a3b8" strokeWidth="0.7"
              strokeDasharray="2 1.5" vectorEffect="non-scaling-stroke" />
          )}
          <path d={line("value")} fill="none" stroke="#2447F0" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="flex justify-between mt-1.5">
        {points.map((p, i) => (
          <span key={`${p.label}-${i}`} className="text-[10px] text-slate-400 tabular-nums"
            style={{ visibility: i % labelStep === 0 || i === n - 1 ? "visible" : "hidden" }}>
            {p.label}
          </span>
        ))}
      </div>
      {hasSecondary && (
        <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-blue-600 inline-block" /> Views</span>
          <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-slate-400 inline-block" /> Visitors</span>
        </div>
      )}
    </div>
  );
}

/* ─── Таблица ─── */
export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full text-[12.5px]">
      <thead>
        <tr className="text-left text-[10.5px] uppercase tracking-wide text-slate-500 border-b border-slate-100">
          {head.map((h) => (
            <th key={h} className="px-4 py-2 font-semibold whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export function Td({
  children, className = "", title,
}: {
  children?: React.ReactNode; className?: string; title?: string;
}) {
  return <td title={title} className={`px-4 py-2 border-b border-slate-50 ${className}`}>{children}</td>;
}

/** Переключатель периода — сохраняет остальные параметры адреса. */
export function RangeTabs({ days, base, params }: { days: number; base: string; params?: Record<string, string | undefined> }) {
  const ranges = [
    { days: 1, label: "24 hours" },
    { days: 7, label: "7 days" },
    { days: 30, label: "30 days" },
  ];
  const qs = (d: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params ?? {})) if (v) sp.set(k, v);
    sp.set("days", String(d));
    return `${base}?${sp.toString()}`;
  };
  return (
    <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 shrink-0">
      {ranges.map((r) => (
        <Link key={r.days} href={qs(r.days)}
          className={`px-3 py-1.5 rounded-md text-[12.5px] font-semibold transition-colors ${
            r.days === days ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}>
          {r.label}
        </Link>
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">{title}</h1>
        {subtitle && <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
