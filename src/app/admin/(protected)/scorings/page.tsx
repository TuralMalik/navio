import Link from "next/link";
import {
  getScoringStats, getScoreDistribution, getScoringBreakdown, getScorings, parseRange,
} from "@/lib/server/analytics-queries";
import {
  PageHeader, RangeTabs, Panel, Kpi, BarList, Table, Td, Badge, Empty,
  fmtTime, fmtNumber,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

/** Публичные ярлыки тиров — те же, что видит пользователь. */
function scoreTone(score: number, blocked: boolean) {
  if (blocked) return { tone: "red" as const, label: "blocked" };
  if (score >= 80) return { tone: "green" as const, label: "high" };
  if (score >= 65) return { tone: "green" as const, label: "good" };
  if (score >= 45) return { tone: "amber" as const, label: "medium" };
  return { tone: "red" as const, label: "low" };
}

const LOAN_LABEL: Record<string, string> = {
  naqd: "cash", kart: "card", ipoteka: "mortgage", avto: "auto",
};
const INCOME_LABEL: Record<string, string> = {
  resmi: "official", qeyri_resmi: "unofficial", teqaud: "pension",
  fs: "sole trader", xarici: "foreign",
};

export default async function ScoringsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; mode?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const days = parseRange(sp.days);
  const mode = sp.mode === "bank" || sp.mode === "bokt" ? sp.mode : undefined;
  const pageNum = Math.max(1, Number(sp.page) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const [stats, dist, byLoan, byIncome, rows] = await Promise.all([
    getScoringStats(days),
    getScoreDistribution(days),
    getScoringBreakdown(days, "kreditNovu"),
    getScoringBreakdown(days, "gelirNovu"),
    getScorings({ days, mode, limit: PAGE_SIZE, offset }),
  ]);

  const qs = (over: Record<string, string | undefined>) => {
    const q = new URLSearchParams({ days: String(days) });
    if (mode) q.set("mode", mode);
    for (const [k, v] of Object.entries(over)) {
      if (v === undefined) q.delete(k);
      else q.set(k, v);
    }
    return `/admin/scorings?${q.toString()}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Scoring submissions"
        subtitle="Every credit check run on the site, with the inputs it was given"
        right={<RangeTabs days={days} base="/admin/scorings" params={{ mode }} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Kpi label="Submissions" value={fmtNumber(stats.total)} />
        <Kpi label="Bank" value={fmtNumber(stats.bank)} />
        <Kpi label="BOKT" value={fmtNumber(stats.bokt)} />
        <Kpi label="Blocked" value={fmtNumber(stats.blocked)} hint="hard stop hit" />
        <Kpi label="Avg. score" value={stats.avgScore ? String(stats.avgScore) : "—"} hint="excl. blocked" />
        <Kpi label="With account" value={fmtNumber(stats.withAccount)} hint="rest anonymous" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Panel title="Result distribution" subtitle="Which tier people land in">
          <BarList rows={dist.map((d) => ({ key: d.bucket, value: d.n }))} />
        </Panel>
        <Panel title="Loan type" subtitle="With average score">
          <BarList rows={byLoan.map((b) => ({
            key: LOAN_LABEL[b.key] ?? b.key,
            value: b.n,
            extra: b.avg_score ? `avg ${b.avg_score}` : undefined,
          }))} />
        </Panel>
        <Panel title="Income type" subtitle="With average score">
          <BarList rows={byIncome.map((b) => ({
            key: INCOME_LABEL[b.key] ?? b.key,
            value: b.n,
            extra: b.avg_score ? `avg ${b.avg_score}` : undefined,
          }))} />
        </Panel>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[undefined, "bank", "bokt"].map((m) => (
          <Link key={m ?? "all"} href={qs({ mode: m, page: undefined })}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold border transition-colors ${
              mode === m ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}>
            {m ? m.toUpperCase() : "All modes"}
          </Link>
        ))}
      </div>

      <Panel title={`${rows.length} submissions`} subtitle="Click a row for the full input" pad={false}>
        {rows.length === 0 ? (
          <div className="p-4"><Empty what="submissions" /></div>
        ) : (
          <Table head={["Time", "Mode", "Result", "BGN", "Amount", "Term", "Loan", "Income", "Who", ""]}>
            {rows.map((r) => {
              const input = (r.input ?? {}) as Record<string, string>;
              const t = scoreTone(r.score, r.blocked);
              return (
                <tr key={r.id} className="hover:bg-slate-50">
                  <Td className="text-slate-500 tabular-nums whitespace-nowrap">{fmtTime(r.createdAt)}</Td>
                  <Td className="uppercase text-[11px] font-bold text-slate-500">{r.mode}</Td>
                  <Td className="whitespace-nowrap">
                    <span className="font-bold tabular-nums mr-1.5">{r.blocked ? "—" : r.score}</span>
                    <Badge tone={t.tone}>{t.label}</Badge>
                  </Td>
                  <Td className="tabular-nums">{r.bgn != null ? `${r.bgn.toFixed(1)}%` : "—"}</Td>
                  <Td className="tabular-nums">{input.mebleg ? fmtNumber(Number(input.mebleg)) : "—"}</Td>
                  <Td className="tabular-nums">{input["muddət"] ?? "—"}</Td>
                  <Td className="text-slate-600">{LOAN_LABEL[input.kreditNovu] ?? input.kreditNovu ?? "—"}</Td>
                  <Td className="text-slate-600">{INCOME_LABEL[input.gelirNovu] ?? input.gelirNovu ?? "—"}</Td>
                  <Td className="text-slate-600 max-w-[150px] truncate">{r.email ?? "anonymous"}</Td>
                  <Td>
                    <Link href={`/admin/scorings/${r.id}`}
                      className="text-[12px] font-semibold text-blue-600 hover:underline whitespace-nowrap">
                      Open →
                    </Link>
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
      </Panel>

      {(pageNum > 1 || rows.length === PAGE_SIZE) && (
        <div className="flex gap-2">
          {pageNum > 1 && (
            <Link href={qs({ page: String(pageNum - 1) })}
              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-[12.5px] font-semibold text-slate-700 hover:border-slate-400">
              ← Previous
            </Link>
          )}
          {rows.length === PAGE_SIZE && (
            <Link href={qs({ page: String(pageNum + 1) })}
              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-[12.5px] font-semibold text-slate-700 hover:border-slate-400">
              Next →
            </Link>
          )}
        </div>
      )}

      <p className="text-[11px] text-slate-400 leading-relaxed max-w-[720px]">
        These rows contain the figures people entered — income, existing debt, delinquency days, age.
        They are stored so the scoring model can be calibrated against real data, which is the stated
        purpose in the privacy policy. Treat this page accordingly: it is the most sensitive view in
        the admin.
      </p>
    </div>
  );
}
