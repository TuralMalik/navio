import Link from "next/link";
import { notFound } from "next/navigation";
import { getScoringDetail } from "@/lib/server/analytics-queries";
import { PageHeader, Panel, Card, Badge, fmtTime, fmtNumber } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/* Подписи полей ввода скоринга. Держим их здесь, а не тянем из формы:
   админка на английском, а форма на азербайджанском. */
const FIELD_LABEL: Record<string, string> = {
  kreditNovu: "Loan type",
  mebleg: "Amount requested",
  "muddət": "Term (months)",
  faiz: "Rate entered (%)",
  gelirNovu: "Income type",
  gelir: "Monthly net income",
  isStaji: "Job tenure",
  yas: "Age",
  movcudNaqdOdenis: "Existing monthly payments",
  movcudKartLimit: "Existing card limit",
  cariGecikmeGun: "Current delinquency (days)",
  maks12ay: "Worst delinquency, 12m (days)",
  kreditTarixce: "Credit history",
};

const VALUE_LABEL: Record<string, string> = {
  naqd: "cash", kart: "credit card", ipoteka: "mortgage", avto: "auto",
  resmi: "official", qeyri_resmi: "unofficial", teqaud: "pension",
  fs: "sole trader / VÖEN", xarici: "foreign earnings",
  "0_2": "0–2 months", "3_5": "3–5 months", "6_11": "6–11 months", "12_plus": "12+ months",
  yox: "no delinquency", gecikme: "has delinquency",
};

/** Поля с деньгами показываем с разделителями — иначе 100000 не читается. */
const MONEY_FIELDS = new Set(["mebleg", "gelir", "movcudNaqdOdenis", "movcudKartLimit"]);

export default async function ScoringDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getScoringDetail(id);
  if (!row) notFound();

  const input = (row.input ?? {}) as Record<string, string>;
  const entries = Object.entries(input);

  const tier = row.blocked
    ? { tone: "red" as const, label: "blocked — hard stop" }
    : row.score >= 80 ? { tone: "green" as const, label: "high chance" }
    : row.score >= 65 ? { tone: "green" as const, label: "good chance" }
    : row.score >= 45 ? { tone: "amber" as const, label: "medium chance" }
    : { tone: "red" as const, label: "low chance" };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Scoring submission"
        subtitle={<span className="font-mono text-[12px]">{row.id}</span>}
        right={
          <Link href="/admin/scorings" className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-[12.5px] font-semibold text-slate-700 hover:border-slate-400">
            ← Scorings
          </Link>
        }
      />

      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Result</p>
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
              {row.blocked ? "—" : row.score}
              {!row.blocked && <span className="text-[13px] font-semibold text-slate-400"> / 100</span>}
            </p>
            <Badge tone={tier.tone}>{tier.label}</Badge>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">BGN</p>
            <p className="text-[15px] font-bold text-slate-800 mt-1 tabular-nums">
              {row.bgn != null ? `${row.bgn.toFixed(1)}%` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Mode</p>
            <p className="text-[15px] font-bold text-slate-800 mt-1 uppercase">{row.mode}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">When</p>
            <p className="text-[15px] font-bold text-slate-800 mt-1 tabular-nums">{fmtTime(row.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Who</p>
            <p className="text-[15px] font-bold text-slate-800 mt-1 break-all">
              {row.userId ? (
                <Link href={`/admin/users/${row.userId}`} className="text-blue-600 hover:underline">
                  {row.email ?? row.userId.slice(0, 10)}
                </Link>
              ) : "anonymous"}
            </p>
          </div>
        </div>
      </Card>

      <Panel title="Inputs" subtitle="Exactly what was entered into the form">
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 py-1.5 border-b border-slate-50">
              <dt className="text-[12.5px] text-slate-500">{FIELD_LABEL[k] ?? k}</dt>
              <dd className="text-[13px] font-semibold text-slate-900 text-right tabular-nums">
                {VALUE_LABEL[v] ?? (MONEY_FIELDS.has(k) && v ? fmtNumber(Number(v)) : v || "—")}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>

      <p className="text-[11px] text-slate-400 leading-relaxed max-w-[720px]">
        This is real financial information a visitor entered. It is stored to calibrate the scoring
        model against actual data, as disclosed in the privacy policy — not for any other use.
      </p>
    </div>
  );
}
