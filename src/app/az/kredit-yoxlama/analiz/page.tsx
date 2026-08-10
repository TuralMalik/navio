"use client";

/* Детальный отчёт кредит-чека — ТОЛЬКО отрисовка.
   Ни расчёта, ни порогов: всё приходит готовым из /api/score/[id]/analysis.
   Незалогиненный получает locked-версию (балл и итог видны, разбор — нет). */

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2, MinusCircle,
  XCircle, Scale, History, BadgeCheck, FileText, CalendarClock, Lightbulb,
  TrendingDown, CreditCard, Clock, CalendarRange, Sparkles, Calculator, BookOpen,
  Lock, UserPlus,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type {
  AnalysisPayload, UnlockedAnalysis, Tone, FactorKey, RecKey,
} from "@/lib/score-contract";
import { useDebouncedCallback, useLatestRequest } from "@/lib/useDebouncedCallback";

const NAVY = "#0A1F44";
const BLUE = "#2447F0";
const MUTED = "#5B6577";
const LINE = "#E3E8F1";
const WASH = "#F4F6FB";

const TONE: Record<Tone, { fg: string; bg: string }> = {
  good:      { fg: "#0F9D58", bg: "#E4F6EC" },
  normal:    { fg: "#0BB07B", bg: "#E7F7F1" },
  attention: { fg: "#B7791F", bg: "#FCF3DC" },
  risk:      { fg: "#EA580C", bg: "#FFEDD5" },
  high:      { fg: "#DC2626", bg: "#FDE7E7" },
  na:        { fg: "#64748B", bg: "#EEF1F6" },
};

/* Иконки маппим по ключу: сервер присылает key, не разметку. */
const FACTOR_ICON: Record<FactorKey, React.ReactNode> = {
  "borc-yuku": <Scale size={17} />,
  "cari-gecikme": <History size={17} />,
  "maks-gecikme": <CalendarClock size={17} />,
  "gelir": <BadgeCheck size={17} />,
  "muddet": <CalendarRange size={17} />,
  "mebleg": <TrendingDown size={17} />,
  "yas": <CalendarClock size={17} />,
  "kredit-xetti": <CreditCard size={17} />,
};

const REC_ICON: Record<RecKey, React.ReactNode> = {
  "mebleg-azalt": <TrendingDown size={17} />,
  "ohdelik-azalt": <CreditCard size={17} />,
  "gecikme-bagla": <Clock size={17} />,
  "muraciet-gozle": <CalendarRange size={17} />,
  "muddet-qisalt": <CalendarRange size={17} />,
  "muddet-yoxla": <CalendarRange size={17} />,
  "gelir-resmilesdir": <BadgeCheck size={17} />,
  "staj-artir": <BadgeCheck size={17} />,
  "profil-yaxsi": <Sparkles size={17} />,
};

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const t = TONE[tone];
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ color: t.fg, background: t.bg }}>
      {children}
    </span>
  );
}

function SectionCard({ n, title, icon, children }: { n: number; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 sm:p-6 mb-4" style={{ border: `1px solid ${LINE}`, boxShadow: "0 1px 2px rgba(16,31,68,.04)" }}>
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-7 h-7 rounded-full grid place-items-center text-[13px] font-extrabold shrink-0" style={{ background: "#EBEFFE", color: BLUE }}>{n}</span>
        <span style={{ color: BLUE }}>{icon}</span>
        <h2 className="text-[16px] font-bold" style={{ color: NAVY }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen" style={{ background: WASH }}>
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
    </main>
  );
}

function NotFound({ message }: { message: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: WASH }}>
      <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center" style={{ border: `1px solid ${LINE}` }}>
        <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4" style={{ background: "#EBEFFE", color: BLUE }}>
          <FileText size={24} />
        </div>
        <h1 className="text-[19px] font-bold mb-2" style={{ color: NAVY }}>Nəticə tapılmadı</h1>
        <p className="text-[14px] mb-5" style={{ color: MUTED }}>{message}</p>
        <Link href="/az/kredit-yoxlama"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] font-semibold text-white text-sm"
          style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.28)" }}>
          İlkin yoxlamaya qayıt <ArrowRight size={15} />
        </Link>
      </div>
    </main>
  );
}

function AnalizContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<AnalysisPayload | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const { next: nextRequest, isLatest } = useLatestRequest();

  const load = useCallback(async (rate?: number) => {
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
  }, [id, nextRequest, isLatest]);

  // Отсутствие id обрабатываем при рендере, а не через setState в эффекте
  useEffect(() => {
    if (!id) return;
    void load();
  }, [id, load]);

  // Клик по чипу ставки — дебаунсим, чтобы быстрые переключения не слали лишних запросов
  const debouncedRate = useDebouncedCallback((rate: number) => { void load(rate); }, 250);

  if (!id) {
    return <NotFound message="Ətraflı analiz yalnız kredit yoxlamasını tamamladıqdan sonra göstərilir." />;
  }
  if (state === "loading") {
    return <main className="min-h-screen" style={{ background: WASH }} />;
  }
  if (state === "missing" || !data) {
    return <NotFound message="Ətraflı analiz yalnız kredit yoxlamasını tamamladıqdan sonra göstərilir." />;
  }
  if (state === "error") {
    return <NotFound message="Nəticə yüklənmədi. Bir az sonra yenidən cəhd edin." />;
  }

  const o = data.overall;

  const header = (
    <>
      <div className="flex items-center gap-2 text-[13px] mb-5 flex-wrap" style={{ color: MUTED }}>
        <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
        <ChevronRight size={13} />
        <Link href="/az/kredit-yoxlama" className="hover:text-blue-600">Kredit yoxlaması</Link>
        <ChevronRight size={13} />
        <span style={{ color: NAVY }}>Ətraflı analiz</span>
      </div>

      <h1 className="font-extrabold mb-1.5" style={{ color: NAVY, fontSize: "clamp(24px,3.4vw,32px)", letterSpacing: "-.02em" }}>
        Kredit yoxlaması nəticəsi
      </h1>
      <p className="text-[14.5px] mb-6" style={{ color: MUTED }}>
        Nəticənizin necə formalaşdığını görün və onu yaxşılaşdırmaq üçün konkret addımları öyrənin.
      </p>

      {/* Hero / summary — бесплатно в обоих случаях */}
      <section className="rounded-2xl bg-white p-5 sm:p-6 mb-4" style={{ border: `1px solid ${LINE}`, boxShadow: "0 1px 2px rgba(16,31,68,.04)" }}>
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-12 h-12 rounded-2xl grid place-items-center shrink-0" style={{ background: TONE[o.tone].bg, color: TONE[o.tone].fg }}>
                {o.tone === "high" ? <XCircle size={24} /> : o.tone === "good" ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
              </span>
              <div>
                <Badge tone={o.tone}>{o.label}</Badge>
                <p className="text-[26px] font-extrabold leading-none mt-1.5" style={{ color: NAVY }}>
                  {data.score}<span className="text-[15px] font-semibold" style={{ color: MUTED }}> / 100</span>
                </p>
              </div>
            </div>
            {data.stops.length > 0 && (
              <p className="text-[14px] font-semibold mb-1" style={{ color: TONE.high.fg }}>{data.stops[0]}</p>
            )}
            <p className="text-[13.5px] leading-relaxed" style={{ color: MUTED }}>{o.note}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:w-[320px] shrink-0">
            {data.metrics.map((m) => (
              <div key={m.label} className="rounded-xl p-3 text-center sm:text-left" style={{ background: WASH, border: `1px solid ${LINE}` }}>
                <p className="text-[11px] font-medium mb-0.5" style={{ color: MUTED }}>{m.label}</p>
                <p className="text-[15px] font-extrabold whitespace-nowrap" style={{ color: NAVY }}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  /* ─── Незалогиненный: балл виден, разбор закрыт ─── */
  if (data.locked) {
    return (
      <Shell>
        {header}

        <section className="rounded-2xl bg-white p-6 sm:p-8 mb-4 text-center" style={{ border: `1px solid ${LINE}`, boxShadow: "0 1px 2px rgba(16,31,68,.04)" }}>
          <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4" style={{ background: "#EBEFFE", color: BLUE }}>
            <Lock size={24} />
          </div>
          <h2 className="text-[20px] font-extrabold mb-2" style={{ color: NAVY }}>Ətraflı analiz üçün qeydiyyatdan keçin</h2>
          <p className="text-[14.5px] mb-6 max-w-[520px] mx-auto leading-relaxed" style={{ color: MUTED }}>
            Balınız və əsas göstəriciləriniz yuxarıda göstərilib. Tam hesabat — hansı amillərin nəticənizə necə təsir etdiyi
            və onu yaxşılaşdırmaq üçün konkret addımlar — pulsuz hesabla əlçatandır.
          </p>

          <div className="grid sm:grid-cols-2 gap-2.5 max-w-[560px] mx-auto mb-7 text-left">
            {data.lockedSections.map((s) => (
              <div key={s} className="flex items-center gap-2.5 rounded-xl p-3" style={{ background: WASH, border: `1px solid ${LINE}` }}>
                <Lock size={14} className="shrink-0" style={{ color: MUTED }} />
                <span className="text-[13px] font-medium" style={{ color: NAVY }}>{s}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/az/register?next=${encodeURIComponent(`/az/kredit-yoxlama/analiz?id=${data.calculationId}`)}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] font-bold text-white text-sm transition-all hover:-translate-y-px"
              style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.28)" }}>
              <UserPlus size={16} /> Pulsuz qeydiyyatdan keç
            </Link>
            <Link href={`/az/login?next=${encodeURIComponent(`/az/kredit-yoxlama/analiz?id=${data.calculationId}`)}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] font-semibold text-sm bg-white"
              style={{ border: `1px solid ${LINE}`, color: NAVY }}>
              Hesabım var — daxil ol
            </Link>
          </div>

          <p className="text-[12px] mt-5" style={{ color: MUTED }}>
            Qeydiyyat pulsuzdur. Sənəd tələb olunmur, banka sorğu göndərilmir.
          </p>
        </section>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-2">
          <Link href="/az/kredit-yoxlama"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[10px] font-semibold text-sm bg-white"
            style={{ border: `1px solid ${LINE}`, color: NAVY }}>
            <ArrowLeft size={15} /> Yenidən hesabla
          </Link>
        </div>

        <p className="text-[12px] mt-6 leading-relaxed" style={{ color: MUTED }}>
          Bu nəticə ilkin qiymətləndirmədir. Yekun qərarı bank/BOKT verir. Navio heç bir kredit vermir və kredit təsdiqinə zəmanət vermir.
        </p>
      </Shell>
    );
  }

  /* ─── Полный отчёт ─── */
  const d: UnlockedAnalysis = data;
  const checkView = (s: "ok" | "fail" | "na") =>
    s === "ok" ? { tone: "good" as Tone, icon: <CheckCircle2 size={15} />, text: "Uyğundur" }
    : s === "fail" ? { tone: "high" as Tone, icon: <XCircle size={15} />, text: "Uyğun deyil" }
    : { tone: "na" as Tone, icon: <MinusCircle size={15} />, text: "Tətbiq olunmur" };

  return (
    <Shell>
      {header}

      <SectionCard n={1} title="Əsas məhdudiyyətlər" icon={<BadgeCheck size={17} />}>
        <div className="divide-y" style={{ borderColor: LINE }}>
          {d.checks.map((c) => {
            const v = checkView(c.status);
            return (
              <div key={c.label} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="text-[14px] font-medium" style={{ color: NAVY }}>{c.label}</span>
                <Badge tone={v.tone}>{v.icon} {v.text}</Badge>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {d.bgn && (
        <SectionCard n={2} title="Borc yükü analizi" icon={<Scale size={17} />}>
          <div className="grid md:grid-cols-2 gap-5 items-center">
            <div className="space-y-2 text-[13.5px]">
              {[
                ["Cari borc yükü", `${d.bgn.current.toFixed(1)}%`],
                ["Yeni kreditdən sonra", `${d.bgn.after.toFixed(1)}%`],
                ["Limit", `${d.bgn.limit}%`],
                ["Yeni aylıq ödəniş", `${formatNumber(Math.round(d.bgn.payment))} ₼`],
                ["Gəlirdən sonra qalan məbləğ", d.bgn.remaining != null ? `${formatNumber(Math.round(d.bgn.remaining))} ₼` : "—"],
                ["Hesablamada istifadə olunan faiz", `${d.bgn.rate.toFixed(1)}%`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <span style={{ color: MUTED }}>{k}</span>
                  <span className="font-bold" style={{ color: NAVY }}>{v}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="relative h-3 rounded-full overflow-hidden"
                style={{ background: `linear-gradient(to right, #DCFCE7 0%, #DCFCE7 45%, #FEF3C7 45%, #FEF3C7 ${d.bgn.limit}%, #FEE2E2 ${d.bgn.limit}%, #FEE2E2 100%)` }}>
                <div className="absolute top-0 bottom-0" style={{ left: `${d.bgn.limit}%`, width: 2, background: "#B7791F" }} />
              </div>
              <div className="relative mt-1 h-5 text-[11px]">
                <div className="absolute -translate-x-1/2" style={{ left: `${Math.min(100, Math.max(0, d.bgn.current))}%` }}>
                  <span className="block w-2 h-2 rounded-full mx-auto" style={{ background: BLUE }} />
                </div>
                <div className="absolute -translate-x-1/2 font-bold" style={{ left: `${Math.min(100, Math.max(0, d.bgn.after))}%`, color: TONE[d.bgn.zone].fg }}>
                  <span className="block w-2.5 h-2.5 rounded-full mx-auto mb-0.5" style={{ background: TONE[d.bgn.zone].fg }} />
                </div>
              </div>
              <div className="flex justify-between text-[11px] mt-0.5" style={{ color: MUTED }}>
                <span>0%</span><span>Limit {d.bgn.limit}%</span><span>100%</span>
              </div>
              <div className="flex items-center gap-4 text-[11.5px] mt-2" style={{ color: MUTED }}>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: BLUE }} /> Cari</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: TONE[d.bgn.zone].fg }} /> Yeni kreditdən sonra</span>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl p-3 flex items-start gap-2 text-[13px] leading-relaxed"
            style={{ background: d.bgn.zone === "high" ? TONE.high.bg : WASH, color: d.bgn.zone === "high" ? "#8A2020" : MUTED }}>
            <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: d.bgn.zone === "high" ? TONE.high.fg : "#B7791F" }} />
            <p>{d.bgn.text}</p>
          </div>
        </SectionCard>
      )}

      <SectionCard n={3} title="Nəticəyə təsir edən amillər" icon={<Sparkles size={17} />}>
        <div className="space-y-2.5">
          {d.factors.map((ft) => (
            <div key={ft.key} className="rounded-xl p-3.5" style={{ background: WASH, border: `1px solid ${LINE}` }}>
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: NAVY }}>
                  <span style={{ color: TONE[ft.tone].fg }}>{FACTOR_ICON[ft.key]}</span> {ft.label}
                </span>
                <Badge tone={ft.tone}>{ft.level}</Badge>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: MUTED }}>{ft.text}</p>
            </div>
          ))}
        </div>
        {d.hasRestriction && (
          <div className="mt-3 rounded-xl p-3 flex items-start gap-2 text-[12.5px] leading-relaxed" style={{ background: WASH, color: MUTED }}>
            <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: "#B7791F" }} />
            <p>Qeyd: «Məhdudiyyət var» statusu skorun aşağı olması deyil. Bu, müvafiq limit və ya minimum tələbin qarşılanmadığını göstərir.</p>
          </div>
        )}
      </SectionCard>

      {d.risks.length > 0 && (
        <SectionCard n={4} title="Risk faktorları" icon={<AlertTriangle size={17} />}>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {d.risks.map((rk, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl p-3 text-[13px]" style={{ background: TONE.high.bg, color: "#8A2020" }}>
                <XCircle size={15} className="shrink-0 mt-0.5" style={{ color: TONE.high.fg }} />
                <p>{rk}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard n={5} title="Kredit profilinizi yaxşılaşdırmaq üçün addımlar" icon={<Lightbulb size={17} />}>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {d.recommendations.map((rc) => (
            <div key={rc.key} className="rounded-xl p-3.5 flex items-start gap-3" style={{ background: WASH, border: `1px solid ${LINE}` }}>
              <span className="w-8 h-8 rounded-lg grid place-items-center shrink-0" style={{ background: "#EBEFFE", color: BLUE }}>{REC_ICON[rc.key]}</span>
              <div>
                <p className="text-[13.5px] font-bold mb-0.5" style={{ color: NAVY }}>{rc.title}</p>
                <p className="text-[12.5px] leading-relaxed" style={{ color: MUTED }}>{rc.text}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {d.simulation && (
        <SectionCard n={6} title="Faiz dəyişsə, nəticə necə dəyişər?" icon={<Calculator size={17} />}>
          <p className="text-[13px] leading-relaxed mb-3" style={{ color: MUTED }}>
            Navio hesablamada təxmini faiz istifadə edir. Fərqli faizlərdə aylıq ödənişin və borc yükünün necə dəyişdiyini yoxlayın.
          </p>
          <div className="rounded-xl p-3 flex items-start gap-2 text-[12.5px] leading-relaxed mb-4" style={{ background: TONE.attention.bg, color: "#7a5a1e" }}>
            <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: "#B7791F" }} />
            <p>Bu, yalnız fərziyyə hesablamasıdır. Real faiz dərəcəsi bankın öz qiymətləndirməsinə əsasən dəyişə bilər.</p>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {d.simulation.chips.map((c) => {
              const on = c === d.simulation!.rate;
              return (
                <button key={c} type="button" onClick={() => debouncedRate(c)}
                  className="px-4 py-2 rounded-full text-[13px] font-bold transition-colors"
                  style={on
                    ? { background: BLUE, color: "#fff", border: `1px solid ${BLUE}` }
                    : { background: "#fff", color: NAVY, border: `1px solid ${LINE}` }}>
                  {c}%
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl p-3" style={{ background: WASH, border: `1px solid ${LINE}` }}>
              <p className="text-[11.5px] font-medium mb-0.5" style={{ color: MUTED }}>Aylıq ödəniş</p>
              <p className="text-[15px] font-extrabold whitespace-nowrap" style={{ color: NAVY }}>{formatNumber(Math.round(d.simulation.payment))} ₼</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: WASH, border: `1px solid ${LINE}` }}>
              <p className="text-[11.5px] font-medium mb-0.5" style={{ color: MUTED }}>BGN</p>
              <p className="text-[15px] font-extrabold" style={{ color: TONE[d.simulation.tone].fg }}>{d.simulation.bgn.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: WASH, border: `1px solid ${LINE}` }}>
              <p className="text-[11.5px] font-medium mb-0.5" style={{ color: MUTED }}>Nəticə</p>
              <p className="text-[13px] font-extrabold mt-1" style={{ color: TONE[d.simulation.tone].fg }}>{d.simulation.status}</p>
            </div>
          </div>
        </SectionCard>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-2">
        <Link href="/az/kredit-yoxlama"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[10px] font-semibold text-white text-sm"
          style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.28)" }}>
          <ArrowLeft size={15} /> Yenidən hesabla
        </Link>
        <Link href="/az/calculators"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[10px] font-semibold text-sm bg-white"
          style={{ border: `1px solid ${LINE}`, color: NAVY }}>
          <Calculator size={15} /> Ödənişi kalkulyatorda hesabla
        </Link>
        <Link href="/az/financial-assistant"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[10px] font-semibold text-sm"
          style={{ color: BLUE }}>
          <BookOpen size={15} /> Maliyyə köməkçisində oxu
        </Link>
      </div>

      <p className="text-[12px] mt-6 leading-relaxed" style={{ color: MUTED }}>
        Bu nəticə ilkin qiymətləndirmədir. Yekun qərarı bank/BOKT verir. Navio heç bir kredit vermir və kredit təsdiqinə zəmanət vermir.
      </p>
    </Shell>
  );
}

export default function AnalizPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" style={{ background: WASH }} />}>
      <AnalizContent />
    </Suspense>
  );
}
