"use client";

/* Детальный отчёт кредит-чека — ТОЛЬКО отрисовка.
   Ни расчёта, ни порогов: всё приходит готовым из /api/score/[id]/analysis.
   Незалогиненный получает locked-версию (балл и итог видны, разбор — нет). */

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight, ArrowLeft, AlertTriangle, CheckCircle2, MinusCircle, XCircle,
  Scale, History, BadgeCheck, FileText, CalendarClock, Lightbulb, TrendingDown,
  CreditCard, Clock, CalendarRange, Sparkles, Calculator, BookOpen, Lock, UserPlus,
} from "lucide-react";
import { formatNumber, formatPercent, NOT_AVAILABLE } from "@/lib/utils";
import type { AnalysisPayload, UnlockedAnalysis, Tone, FactorKey, RecKey } from "@/lib/score-contract";
import { toneStyle } from "@/lib/tone";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { ScoreDial } from "@/components/score/ScoreDial";
import { BgnCompare } from "@/components/score/BgnCompare";
import { useDebouncedCallback, useLatestRequest } from "@/lib/useDebouncedCallback";

const azn = (v: number) => `${formatNumber(Math.round(v))} ₼`;

/* Иконки маппим по ключу: сервер присылает key, не разметку. */
const FACTOR_ICON: Record<FactorKey, React.ReactNode> = {
  "borc-yuku": <Scale size={16} />,
  "cari-gecikme": <History size={16} />,
  "maks-gecikme": <CalendarClock size={16} />,
  gelir: <BadgeCheck size={16} />,
  muddet: <CalendarRange size={16} />,
  mebleg: <TrendingDown size={16} />,
  yas: <CalendarClock size={16} />,
  "kredit-xetti": <CreditCard size={16} />,
};

const REC_ICON: Record<RecKey, React.ReactNode> = {
  "mebleg-azalt": <TrendingDown size={16} />,
  "ohdelik-azalt": <CreditCard size={16} />,
  "gecikme-bagla": <Clock size={16} />,
  "muraciet-gozle": <CalendarRange size={16} />,
  "muddet-qisalt": <CalendarRange size={16} />,
  "muddet-yoxla": <CalendarRange size={16} />,
  "gelir-resmilesdir": <BadgeCheck size={16} />,
  "staj-artir": <BadgeCheck size={16} />,
  "profil-yaxsi": <Sparkles size={16} />,
};

/* Секции больше не нумеруются кружками с подкрашенной подложкой: это ровно
   тот шаблон «1-2-3 с цветными квадратиками», который запрещён. Порядок и так
   виден, а цвет должен оставаться за данными. */
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="mb-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-gray-400" aria-hidden>{icon}</span>
        <CardTitle>{title}</CardTitle>
      </div>
      {children}
    </Card>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </main>
  );
}

function NotFound({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md text-center">
        <FileText size={26} className="mx-auto mb-3 text-gray-300" aria-hidden />
        <h1 className="mb-2 text-lg font-bold tracking-tight text-ink">Nəticə tapılmadı</h1>
        <p className="mb-5 text-sm text-gray-600">{message}</p>
        <LinkButton href="/az/kredit-yoxlama">İlkin yoxlamaya qayıt</LinkButton>
      </Card>
    </main>
  );
}

function Breadcrumbs() {
  return (
    <nav aria-label="Naviqasiya" className="mb-5 flex flex-wrap items-center gap-1.5 text-[13px] text-gray-500">
      <Link href="/az" className="hover:text-brand-700">Ana səhifə</Link>
      <ChevronRight size={13} aria-hidden />
      <Link href="/az/kredit-yoxlama" className="hover:text-brand-700">Kredit yoxlaması</Link>
      <ChevronRight size={13} aria-hidden />
      <span className="text-gray-700">Ətraflı analiz</span>
    </nav>
  );
}

function AnalizContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<AnalysisPayload | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const { next: nextRequest, isLatest } = useLatestRequest();

  const load = useCallback(
    async (rate?: number) => {
      const reqId = nextRequest();
      try {
        const url = rate != null ? `/api/score/${id}/analysis?rate=${rate}` : `/api/score/${id}/analysis`;
        const res = await fetch(url);
        if (!isLatest(reqId)) return;
        if (res.status === 404) { setState("missing"); return; }
        if (!res.ok) { setState("error"); return; }
        setData(await res.json());
        setState("ready");
      } catch {
        if (isLatest(reqId)) setState("error");
      }
    },
    [id, nextRequest, isLatest],
  );

  /* Загрузка отчёта при монтировании. Это ровно тот случай, для которого
     эффект и предназначен: синхронизация с внешней системой (HTTP).
     setState здесь вызывается не синхронно, а после await, но правило
     react-hooks/set-state-in-effect не различает эти случаи внутри async. */
  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [id, load]);

  // Клик по чипу ставки дебаунсим, чтобы быстрые переключения не слали лишних запросов
  const debouncedRate = useDebouncedCallback((rate: number) => { void load(rate); }, 250);

  if (!id || state === "missing" || (state === "ready" && !data)) {
    return <NotFound message="Ətraflı analiz yalnız kredit yoxlamasını tamamladıqdan sonra göstərilir." />;
  }
  if (state === "error") {
    return <NotFound message="Nəticə yüklənmədi. Bir az sonra yenidən cəhd edin." />;
  }
  if (state === "loading" || !data) {
    return (
      <Shell>
        <div className="flex flex-col items-center py-24" role="status" aria-live="polite">
          <span className="nv-spin mb-3 block h-6 w-6 rounded-full border-2 border-gray-200 border-t-brand-600" />
          <p className="text-sm font-medium text-gray-600">Analiz yüklənir...</p>
        </div>
      </Shell>
    );
  }

  const o = data.overall;
  const blocked = data.stops.length > 0;

  const header = (
    <>
      <Breadcrumbs />

      <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
        Kredit yoxlaması nəticəsi
      </h1>
      <p className="mt-1.5 mb-6 text-sm text-gray-600">
        Nəticənizin necə formalaşdığını görün və onu yaxşılaşdırmaq üçün konkret addımları öyrənin.
      </p>

      {/* Итог виден всем, включая незалогиненных: балл — это то, за чем пришли */}
      <Card className="mb-4">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="w-full max-w-[240px] shrink-0">
            {/* При хард-стопе балл не рисуем: ноль на шкале читался бы как
                «у вас ноль баллов», хотя это признак блокировки, а не оценка. */}
            {blocked ? (
              <div className="flex flex-col items-center py-4 text-center">
                <XCircle size={30} className="mb-2 text-rose-500" aria-hidden />
                <Badge tone="high">Hazırkı şərtlərlə mümkün deyil</Badge>
              </div>
            ) : (
              <ScoreDial score={data.score} tone={o.tone} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {!blocked && <Badge tone={o.tone}>{o.label}</Badge>}
            {blocked && (
              <p className="text-sm font-semibold text-rose-700">{data.stops[0]}</p>
            )}
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{o.note}</p>

            <dl className="mt-4 grid grid-cols-3 gap-2">
              {data.metrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-gray-200 bg-gray-50 p-2.5">
                  <dt className="text-[11px] font-medium text-gray-500">{m.label}</dt>
                  <dd className="mt-0.5 text-sm font-extrabold tabular-nums whitespace-nowrap text-ink">{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Card>
    </>
  );

  const footerNote = (
    <p className="mt-6 text-xs leading-relaxed text-gray-500">
      Bu nəticə ilkin qiymətləndirmədir. Yekun qərarı bank və ya BOKT verir. Navio kredit vermir və kredit
      təsdiqinə zəmanət vermir.
    </p>
  );

  /* ─── Незалогиненный: балл виден, разбор закрыт ─── */
  if (data.locked) {
    const back = `/az/kredit-yoxlama/analiz?id=${data.calculationId}`;
    return (
      <Shell>
        {header}

        <Card className="mb-4">
          <div className="mx-auto max-w-lg text-center">
            <Lock size={24} className="mx-auto mb-3 text-gray-400" aria-hidden />
            <h2 className="mb-2 text-xl font-bold tracking-tight text-ink">
              Ətraflı analiz üçün qeydiyyatdan keçin
            </h2>
            {/* Честно: балл уже показан выше, и мы это проговариваем. Обещать,
                что «настоящий результат» ещё впереди, было бы неправдой. */}
            <p className="text-sm leading-relaxed text-gray-600">
              Balınız və əsas göstəriciləriniz yuxarıda göstərilib. Pulsuz hesabla əlavə olaraq bunlar açılır:
            </p>
          </div>

          <ul className="mx-auto mt-5 grid max-w-lg gap-2 sm:grid-cols-2">
            {data.lockedSections.map((s) => (
              <li
                key={s}
                className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 p-3 text-[13px] font-medium text-ink"
              >
                <Lock size={13} className="shrink-0 text-gray-400" aria-hidden />
                {s}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href={`/az/register?next=${encodeURIComponent(back)}`} icon={<UserPlus size={16} />}>
              Pulsuz qeydiyyatdan keç
            </LinkButton>
            <LinkButton href={`/az/login?next=${encodeURIComponent(back)}`} variant="secondary">
              Hesabım var, daxil ol
            </LinkButton>
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">
            Qeydiyyat pulsuzdur. Sənəd tələb olunmur, banka sorğu göndərilmir.
          </p>
        </Card>

        <LinkButton href="/az/kredit-yoxlama" variant="secondary" icon={<ArrowLeft size={15} />}>
          Yenidən hesabla
        </LinkButton>

        {footerNote}
      </Shell>
    );
  }

  /* ─── Полный отчёт ─── */
  const d: UnlockedAnalysis = data;
  const sim = d.simulation;

  const checkView = (s: "ok" | "fail" | "na") =>
    s === "ok"
      ? { tone: "good" as Tone, icon: <CheckCircle2 size={13} />, text: "Uyğundur" }
      : s === "fail"
        ? { tone: "high" as Tone, icon: <XCircle size={13} />, text: "Uyğun deyil" }
        : { tone: "na" as Tone, icon: <MinusCircle size={13} />, text: "Tətbiq olunmur" };

  return (
    <Shell>
      {header}

      <Section title="Əsas məhdudiyyətlər" icon={<BadgeCheck size={17} />}>
        <ul className="divide-y divide-gray-200">
          {d.checks.map((c) => {
            const v = checkView(c.status);
            return (
              <li key={c.label} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="text-sm font-medium text-ink">{c.label}</span>
                <Badge tone={v.tone} icon={v.icon}>{v.text}</Badge>
              </li>
            );
          })}
        </ul>
      </Section>

      {d.bgn && (
        <Section title="Borc yükü analizi" icon={<Scale size={17} />}>
          <BgnCompare current={d.bgn.current} after={d.bgn.after} limit={d.bgn.limit} tone={d.bgn.zone} />

          <dl className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
            {[
              ["Yeni aylıq ödəniş", azn(d.bgn.payment)],
              [
                "Gəlirdən sonra qalan məbləğ",
                d.bgn.remaining != null ? azn(d.bgn.remaining) : NOT_AVAILABLE,
              ],
              ["Hesablamada istifadə olunan faiz", formatPercent(d.bgn.rate)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3">
                <dt className="text-gray-600">{k}</dt>
                <dd className="font-bold tabular-nums text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          <p
            className={`mt-4 rounded-xl border p-3 text-[13px] leading-relaxed ${
              d.bgn.zone === "high" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-gray-200 bg-gray-50 text-gray-700"
            }`}
          >
            {d.bgn.text}
          </p>
        </Section>
      )}

      <Section title="Nəticəyə təsir edən amillər" icon={<Sparkles size={17} />}>
        <ul className="space-y-2.5">
          {d.factors.map((ft) => {
            const s = toneStyle(ft.tone);
            return (
              <li key={ft.key} className="rounded-xl border border-gray-200 p-3.5">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span className={s.text} aria-hidden>{FACTOR_ICON[ft.key]}</span>
                    {ft.label}
                  </span>
                  <Badge tone={ft.tone}>{ft.level}</Badge>
                </div>
                <p className="text-[13px] leading-relaxed text-gray-600">{ft.text}</p>
              </li>
            );
          })}
        </ul>
        {d.hasRestriction && (
          <p className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
            Qeyd: &laquo;Məhdudiyyət var&raquo; statusu balın aşağı olması demək deyil. Bu, müvafiq limitin və ya
            minimum tələbin qarşılanmadığını göstərir.
          </p>
        )}
      </Section>

      {d.risks.length > 0 && (
        <Section title="Risk faktorları" icon={<AlertTriangle size={17} />}>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {d.risks.map((rk, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[13px] leading-relaxed text-rose-800"
              >
                <XCircle size={14} className="mt-0.5 shrink-0 text-rose-600" aria-hidden />
                {rk}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Kredit profilinizi yaxşılaşdırmaq üçün addımlar" icon={<Lightbulb size={17} />}>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {d.recommendations.map((rc) => (
            <li key={rc.key} className="flex items-start gap-3 rounded-xl border border-gray-200 p-3.5">
              <span className="mt-0.5 shrink-0 text-gray-400" aria-hidden>{REC_ICON[rc.key]}</span>
              <div>
                <p className="text-sm font-bold text-ink">{rc.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-gray-600">{rc.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {sim && (
        <Section title="Faiz dəyişsə, nəticə necə dəyişər?" icon={<Calculator size={17} />}>
          <p className="mb-3 text-[13px] leading-relaxed text-gray-600">
            Navio hesablamada təxmini faiz istifadə edir. Fərqli faizlərdə aylıq ödənişin və borc yükünün necə
            dəyişdiyini yoxlayın.
          </p>
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            Bu, yalnız fərziyyə hesablamasıdır. Real faiz dərəcəsi bankın öz qiymətləndirməsinə əsasən dəyişə bilər.
          </p>

          <div role="group" aria-label="Faiz dərəcəsi" className="mb-4 flex flex-wrap gap-2">
            {sim.chips.map((c) => {
              const on = c === sim.rate;
              return (
                <Button
                  key={c}
                  size="sm"
                  variant={on ? "primary" : "secondary"}
                  aria-pressed={on}
                  onClick={() => debouncedRate(c)}
                  className="rounded-full tabular-nums"
                >
                  {formatPercent(c, 0)}
                </Button>
              );
            })}
          </div>

          <dl className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Aylıq ödəniş", value: azn(sim.payment), tone: null },
              { label: "Borc yükü", value: formatPercent(sim.bgn), tone: sim.tone },
              { label: "Nəticə", value: sim.status, tone: sim.tone },
            ].map((cell) => (
              <div key={cell.label} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <dt className="text-[11px] font-medium text-gray-500">{cell.label}</dt>
                <dd
                  className={`mt-0.5 text-sm font-extrabold tabular-nums ${
                    cell.tone ? toneStyle(cell.tone).text : "text-ink"
                  }`}
                >
                  {cell.value}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      <div className="mt-2 flex flex-col flex-wrap gap-3 sm:flex-row">
        <LinkButton href="/az/kredit-yoxlama" icon={<ArrowLeft size={15} />}>
          Yenidən hesabla
        </LinkButton>
        <LinkButton href="/az/calculators" variant="secondary" icon={<Calculator size={15} />}>
          Ödənişi kalkulyatorda hesabla
        </LinkButton>
        <LinkButton href="/az/financial-assistant" variant="ghost" icon={<BookOpen size={15} />}>
          Maliyyə köməkçisində oxu
        </LinkButton>
      </div>

      {footerNote}
    </Shell>
  );
}

export default function AnalizPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50" />}>
      <AnalizContent />
    </Suspense>
  );
}
