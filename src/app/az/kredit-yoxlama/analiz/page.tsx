"use client";

/* Детальный отчёт кредит-чека — визуальный слой (не раскрывает внутренний скоринг).
   Данные берутся из sessionStorage (ключ navioCreditCheckResult), сохраняются при «Hesabla».
   Логика расчёта НЕ дублируется по существу: базовый результат берём из calcBankScore,
   для симуляции ставки — те же публичные хелперы (annuityPayment/incomeForScoring). */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2, MinusCircle,
  XCircle, Scale, History, BadgeCheck, FileText, CalendarClock, Lightbulb,
  TrendingDown, CreditCard, Clock, CalendarRange, Sparkles, Calculator, BookOpen,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import {
  type BankForm, calcBankScore, annuityPayment, incomeForScoring, subsistenceMin, CONFIG,
} from "@/lib/scoring";
import { SliderRow } from "@/components/ui/SliderRow";

const NAVY = "#0A1F44";
const BLUE = "#2447F0";
const MUTED = "#5B6577";
const LINE = "#E3E8F1";
const WASH = "#F4F6FB";

const STORAGE_KEY = "navioCreditCheckResult";

/* ─── Тоны статусов ─── */
type Tone = "good" | "normal" | "attention" | "risk" | "high" | "na";
const TONE: Record<Tone, { fg: string; bg: string }> = {
  good:      { fg: "#0F9D58", bg: "#E4F6EC" },
  normal:    { fg: "#0BB07B", bg: "#E7F7F1" },
  attention: { fg: "#B7791F", bg: "#FCF3DC" },
  risk:      { fg: "#EA580C", bg: "#FFEDD5" },
  high:      { fg: "#DC2626", bg: "#FDE7E7" },
  na:        { fg: "#64748B", bg: "#EEF1F6" },
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

/* ─── Общий тир результата ─── */
function overall(r: ReturnType<typeof calcBankScore>) {
  if (r.stops.length > 0) return { label: "Uyğun deyil", tone: "high" as Tone, note: "Hazırkı parametrlərlə kredit alma ehtimalı çox aşağıdır." };
  if (r.score >= 65) return { label: "Yaxşı nəticə", tone: "good" as Tone, note: "Borc yükünüz və əsas göstəriciləriniz normal səviyyədədir." };
  if (r.score >= 45) return { label: "Orta nəticə", tone: "attention" as Tone, note: "Hazırkı göstəriciləriniz kredit müraciəti üçün əlavə diqqət tələb edir." };
  return { label: "Zəif nəticə", tone: "risk" as Tone, note: "Kredit profilinizin bir neçə göstəricisi müraciət üçün zəifdir." };
}

export default function AnalizPage() {
  const [input, setInput] = useState<BankForm | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [simRate, setSimRate] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setInput(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  const r = useMemo(() => (input ? calcBankScore(input) : null), [input]);

  if (!loaded) return <main className="min-h-screen" style={{ background: WASH }} />;

  /* ─── Fallback: нет данных ─── */
  if (!input || !r) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: WASH }}>
        <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center" style={{ border: `1px solid ${LINE}` }}>
          <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4" style={{ background: "#EBEFFE", color: BLUE }}>
            <FileText size={24} />
          </div>
          <h1 className="text-[19px] font-bold mb-2" style={{ color: NAVY }}>Nəticə tapılmadı</h1>
          <p className="text-[14px] mb-5" style={{ color: MUTED }}>
            Ətraflı analiz yalnız kredit yoxlamasını tamamladıqdan sonra göstərilir.
          </p>
          <Link href="/az/kredit-yoxlama"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] font-semibold text-white text-sm"
            style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.28)" }}>
            İlkin yoxlamaya qayıt <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    );
  }

  /* ─── Производные значения (только для отображения) ─── */
  const f = input;
  const num = (s: string) => Math.max(0, parseFloat(s) || 0);
  const mebleg = num(f.mebleg);
  const muddet = Math.max(0, parseInt(f.muddət) || 0);
  const yas = Math.max(0, parseInt(f.yas) || 0);
  const cari = Math.max(0, parseInt(f.cariGecikmeGun) || 0);
  const maks = Math.max(0, parseInt(f.maks12ay) || 0);
  const income = incomeForScoring(f.gelirNovu, num(f.gelir));
  const kartStress = annuityPayment(num(f.movcudKartLimit), CONFIG.cardStressMonths, CONFIG.cardStressRate);
  const currentBgn = income > 0 ? ((num(f.movcudNaqdOdenis) + kartStress) / income) * 100 : 0;
  const afterBgn = r.bgn;
  const ageAtEnd = yas + Math.ceil(muddet / 12);
  const limit = CONFIG.bgnHardStopPct;
  const stajOk =
    (f.gelirNovu === "resmi" && (f.isStaji === "6_11" || f.isStaji === "12_plus")) ||
    ((f.gelirNovu === "fs" || f.gelirNovu === "xarici") && f.isStaji === "12_plus");
  const hasIncome = income > 0;

  const o = overall(r);

  /* ─── 1. Əsas məhdudiyyətlər (hard-checks) ─── */
  type Check = { label: string; status: "ok" | "fail" | "na" };
  const checks: Check[] = [
    { label: "Yaş tələbi", status: yas >= 18 && ageAtEnd <= CONFIG.maxAgeAtEnd ? "ok" : "fail" },
    { label: "Borc yükü limiti", status: hasIncome && afterBgn <= limit ? "ok" : "fail" },
    {
      label: "Cari iş yerində staj",
      status: f.gelirNovu === "teqaud" || f.gelirNovu === "qeyri_resmi" ? "na" : stajOk ? "ok" : "fail",
    },
    {
      label: "Kredit xətti limiti",
      status: f.kreditNovu !== "kart" ? "na" : hasIncome && (mebleg + num(f.movcudKartLimit)) <= income * CONFIG.maxCardLineToIncomeRatio ? "ok" : "fail",
    },
  ];
  const checkView = (s: Check["status"]) =>
    s === "ok" ? { tone: "good" as Tone, icon: <CheckCircle2 size={15} />, text: "Uyğundur" }
    : s === "fail" ? { tone: "high" as Tone, icon: <XCircle size={15} />, text: "Uyğun deyil" }
    : { tone: "na" as Tone, icon: <MinusCircle size={15} />, text: "Tətbiq olunmur" };

  /* ─── 2. Borc yükü analizi ─── */
  const bgnZone: Tone = afterBgn > limit ? "high" : afterBgn > CONFIG.bgnTierHighPct ? "risk" : afterBgn > CONFIG.bgnTierMidPct ? "attention" : "good";
  const bgnText = afterBgn > limit
    ? "Yeni kreditdən sonra borc yükünüz 70% limitini keçir. Bu halda bank müraciəti yüksək riskli hesab edə bilər."
    : "Yeni kreditdən sonra borc yükünüz yüksəlir. Bu göstərici bankın qiymətləndirməsində əsas risk faktorlarından biridir.";

  /* ─── 3. Nəticəyə təsir edən faktorlar (без цифр) ─── */
  type Factor = { icon: React.ReactNode; label: string; tone: Tone; status: string; text: string };
  const bgnFactor: Factor = {
    icon: <Scale size={17} />, label: "Borc yükü",
    ...(afterBgn > limit ? { tone: "high" as Tone, status: "Çox yüksək risk" }
      : afterBgn > CONFIG.bgnTierHighPct ? { tone: "risk" as Tone, status: "Yüksək risk" }
      : afterBgn > CONFIG.bgnTierMidPct ? { tone: "attention" as Tone, status: "Diqqət tələb edir" }
      : { tone: "good" as Tone, status: "Müsbət göstərici" }),
    text: "Yeni kreditdən sonra borc yükünüz bank qiymətləndirməsində mühüm rol oynayır.",
  };
  const histFactor: Factor = {
    icon: <History size={17} />, label: "Kredit tarixçəsi və gecikmələr",
    ...(cari > 15 || maks >= 120 ? { tone: "high" as Tone, status: "Yüksək risk" }
      : cari > 0 || maks >= 30 ? { tone: "attention" as Tone, status: "Diqqət tələb edir" }
      : { tone: "good" as Tone, status: "Müsbət göstərici" }),
    text: "Aktiv gecikmə və son dövrdə gecikmə halları kredit profilinizə mənfi təsir edə bilər.",
  };
  const incomeFactor: Factor = {
    icon: <BadgeCheck size={17} />, label: "Gəlirin təsdiqi",
    ...(f.gelirNovu === "qeyri_resmi" ? { tone: "attention" as Tone, status: "Diqqət tələb edir" }
      : (f.gelirNovu === "resmi" && stajOk) ? { tone: "good" as Tone, status: "Müsbət göstərici" }
      : { tone: "normal" as Tone, status: "Normal" }),
    text: "Gəlir növü və təsdiq müddəti bankın gəlir sabitliyini qiymətləndirməsində nəzərə alınır.",
  };
  const termsFactor: Factor = {
    icon: <FileText size={17} />, label: "Kredit şərtləri",
    ...(muddet > 48 || mebleg > CONFIG.amountCap59Above ? { tone: "attention" as Tone, status: "Diqqət tələb edir" }
      : { tone: "normal" as Tone, status: "Normal" }),
    text: "Kredit məbləği, müddət və təxmini faiz aylıq ödənişə və borc yükünə təsir edir.",
  };
  const factors: Factor[] = [bgnFactor, histFactor, incomeFactor, termsFactor];
  if (ageAtEnd > 65) {
    factors.push({
      icon: <CalendarClock size={17} />, label: "Pensiya yaşı riski",
      ...(ageAtEnd > CONFIG.maxAgeAtEnd ? { tone: "high" as Tone, status: "Yüksək risk" } : { tone: "attention" as Tone, status: "Diqqət tələb edir" }),
      text: "Kredit müddətinin bir hissəsi pensiya yaşından sonrakı dövrə düşə bilər.",
    });
  }

  /* ─── 4. Risk faktorları ─── */
  const highRiskPayment = hasIncome && (afterBgn > CONFIG.bgnTierMidPct || r.remaining != null && r.remaining < subsistenceMin(f.gelirNovu));
  const risks: string[] = [];
  if (afterBgn > limit) risks.push("Borc yükü 70%-dən yüksəkdir");
  else if (afterBgn > CONFIG.bgnTierMidPct) risks.push("Borc yükü yüksək səviyyədədir");
  if (cari > 0) risks.push(`Cari gecikmə var (${cari} gün)`);
  if (maks >= 30) risks.push("Son 12 ayda gecikmə müşahidə olunub");
  if (highRiskPayment) risks.push("Yeni aylıq ödəniş gəlirinizə görə yüksəkdir");
  if (muddet > 48) risks.push("Kredit müddəti uzun olduğuna görə ümumi xərc arta bilər");
  if (f.gelirNovu === "qeyri_resmi") risks.push("Gəlirin rəsmi təsdiqi yoxdur");
  if (ageAtEnd > CONFIG.maxAgeAtEnd) risks.push(`Müddətin sonunda yaşınız ${ageAtEnd} olur — limitdən yuxarıdır`);

  /* ─── 5. Tövsiyələr ─── */
  type Rec = { icon: React.ReactNode; title: string; text: string };
  const recs: Rec[] = [];
  if (afterBgn > CONFIG.bgnTierMidPct || mebleg > CONFIG.amountCap79Above)
    recs.push({ icon: <TrendingDown size={17} />, title: "Kredit məbləğini azaldın", text: "Daha aşağı məbləğ aylıq ödənişi və borc yükünü azalda bilər." });
  if (num(f.movcudNaqdOdenis) > 0 || num(f.movcudKartLimit) > 0)
    recs.push({ icon: <CreditCard size={17} />, title: "Mövcud öhdəlikləri azaldın", text: "Cari kredit ödənişlərinin azalması yeni kredit üçün profilinizi yaxşılaşdıra bilər." });
  if (cari > 0) {
    recs.push({ icon: <Clock size={17} />, title: "Cari gecikməni bağlayın", text: "Aktiv gecikmə kredit profilinizə mənfi təsir edir." });
    recs.push({ icon: <CalendarRange size={17} />, title: "Müraciəti gecikmədən sonra edin", text: "Aktiv gecikmə bağlandıqdan sonra nəticəniz daha yaxşı görünə bilər." });
  }
  if (muddet <= 48)
    recs.push({ icon: <CalendarRange size={17} />, title: "Müddəti yenidən yoxlayın", text: "Müddəti artırmaq aylıq ödənişi azalda bilər, amma ümumi faiz xərcini artıra bilər." });
  if (f.gelirNovu === "qeyri_resmi")
    recs.push({ icon: <BadgeCheck size={17} />, title: "Gəliri rəsmiləşdirin", text: "Rəsmi gəlir təsdiqi (əmək müqaviləsi / VÖEN) profilinizi əhəmiyyətli gücləndirir." });
  if (recs.length === 0)
    recs.push({ icon: <Sparkles size={17} />, title: "Profiliniz yaxşı vəziyyətdədir", text: "Ödənişləri vaxtında etməyə davam edin — bu, kredit profilinizi güclü saxlayır." });

  /* ─── 6. Faiz simulyasiyası ─── */
  const baseRate = r.estimatedRate != null ? r.estimatedRate : (parseFloat(f.faiz) || 24);
  const rate = simRate ?? Math.min(35, Math.max(5, baseRate));
  const simPayment = annuityPayment(mebleg, muddet, rate);
  const simTotal = num(f.movcudNaqdOdenis) + kartStress + simPayment;
  const simBgn = hasIncome ? (simTotal / income) * 100 : 999;
  const simTone: Tone = simBgn > limit ? "high" : simBgn > CONFIG.bgnTierHighPct ? "risk" : simBgn > CONFIG.bgnTierMidPct ? "attention" : "good";
  const simStatus = simBgn > limit ? "Uyğun deyil" : simBgn > CONFIG.bgnTierMidPct ? "Diqqət tələb edir" : "Normal";
  const rateTooLow = rate < baseRate - 0.01;

  const metrics = [
    { label: "BGN", value: hasIncome ? `${afterBgn.toFixed(1)}%` : "—" },
    { label: "Yeni aylıq ödəniş", value: r.yeniOdenis > 0 ? `${formatNumber(Math.round(r.yeniOdenis))} ₼` : "—" },
    { label: "Təxmini faiz", value: r.estimatedRate != null ? `${r.estimatedRate.toFixed(1)}%` : `${parseFloat(f.faiz) || 24}%` },
    { label: "Qalan məbləğ", value: r.remaining != null ? `${formatNumber(Math.round(r.remaining))} ₼` : "—" },
  ];

  return (
    <main className="min-h-screen" style={{ background: WASH }}>
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
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

        {/* ── Hero / summary ── */}
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
                    {r.score}<span className="text-[15px] font-semibold" style={{ color: MUTED }}> / 100</span>
                  </p>
                </div>
              </div>
              {r.stops.length > 0 && (
                <p className="text-[14px] font-semibold mb-1" style={{ color: TONE.high.fg }}>{r.stops[0]}</p>
              )}
              <p className="text-[13.5px] leading-relaxed" style={{ color: MUTED }}>{o.note}</p>
            </div>

            {/* Метрики */}
            <div className="grid grid-cols-2 gap-2.5 md:w-[300px] shrink-0">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-xl p-3" style={{ background: WASH, border: `1px solid ${LINE}` }}>
                  <p className="text-[11.5px] font-medium mb-0.5" style={{ color: MUTED }}>{m.label}</p>
                  <p className="text-[16px] font-extrabold" style={{ color: NAVY }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 1. Əsas məhdudiyyətlər ── */}
        <SectionCard n={1} title="Əsas məhdudiyyətlər" icon={<BadgeCheck size={17} />}>
          <div className="divide-y" style={{ borderColor: LINE }}>
            {checks.map((c) => {
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

        {/* ── 2. Borc yükü analizi ── */}
        {hasIncome && (
          <SectionCard n={2} title="Borc yükü analizi" icon={<Scale size={17} />}>
            <div className="grid md:grid-cols-2 gap-5 items-center">
              <div className="space-y-2 text-[13.5px]">
                {[
                  ["Cari borc yükü", `${currentBgn.toFixed(1)}%`],
                  ["Yeni kreditdən sonra", `${afterBgn.toFixed(1)}%`],
                  ["Limit", `${limit}%`],
                  ["Yeni aylıq ödəniş", `${formatNumber(Math.round(r.yeniOdenis))} ₼`],
                  ["Gəlirdən sonra qalan məbləğ", r.remaining != null ? `${formatNumber(Math.round(r.remaining))} ₼` : "—"],
                  ["Hesablamada istifadə olunan faiz", r.estimatedRate != null ? `${r.estimatedRate.toFixed(1)}%` : `${parseFloat(f.faiz) || 24}%`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <span style={{ color: MUTED }}>{k}</span>
                    <span className="font-bold" style={{ color: NAVY }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Range bar */}
              <div>
                <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #DCFCE7 0%, #DCFCE7 45%, #FEF3C7 45%, #FEF3C7 70%, #FEE2E2 70%, #FEE2E2 100%)" }}>
                  {/* limit tick */}
                  <div className="absolute top-0 bottom-0" style={{ left: `${limit}%`, width: 2, background: "#B7791F" }} />
                </div>
                {/* markers */}
                <div className="relative mt-1 h-5 text-[11px]">
                  <div className="absolute -translate-x-1/2" style={{ left: `${Math.min(100, Math.max(0, currentBgn))}%` }}>
                    <span className="block w-2 h-2 rounded-full mx-auto" style={{ background: BLUE }} />
                  </div>
                  <div className="absolute -translate-x-1/2 font-bold" style={{ left: `${Math.min(100, Math.max(0, afterBgn))}%`, color: TONE[bgnZone].fg }}>
                    <span className="block w-2.5 h-2.5 rounded-full mx-auto mb-0.5" style={{ background: TONE[bgnZone].fg }} />
                  </div>
                </div>
                <div className="flex justify-between text-[11px] mt-0.5" style={{ color: MUTED }}>
                  <span>0%</span><span>Limit {limit}%</span><span>100%</span>
                </div>
                <div className="flex items-center gap-4 text-[11.5px] mt-2" style={{ color: MUTED }}>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: BLUE }} /> Cari</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: TONE[bgnZone].fg }} /> Yeni kreditdən sonra</span>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-xl p-3 flex items-start gap-2 text-[13px] leading-relaxed"
              style={{ background: bgnZone === "high" ? TONE.high.bg : WASH, color: bgnZone === "high" ? "#8A2020" : MUTED }}>
              <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: bgnZone === "high" ? TONE.high.fg : "#B7791F" }} />
              <p>{bgnText}</p>
            </div>
          </SectionCard>
        )}

        {/* ── 3. Nəticəyə təsir edən faktorlar ── */}
        <SectionCard n={3} title="Nəticəyə təsir edən faktorlar" icon={<Sparkles size={17} />}>
          <div className="space-y-2.5">
            {factors.map((ft) => (
              <div key={ft.label} className="rounded-xl p-3.5" style={{ background: WASH, border: `1px solid ${LINE}` }}>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: NAVY }}>
                    <span style={{ color: TONE[ft.tone].fg }}>{ft.icon}</span> {ft.label}
                  </span>
                  <Badge tone={ft.tone}>{ft.status}</Badge>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: MUTED }}>{ft.text}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── 4. Risk faktorları ── */}
        {risks.length > 0 && (
          <SectionCard n={4} title="Risk faktorları" icon={<AlertTriangle size={17} />}>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {risks.map((rk, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl p-3 text-[13px]" style={{ background: TONE.high.bg, color: "#8A2020" }}>
                  <XCircle size={15} className="shrink-0 mt-0.5" style={{ color: TONE.high.fg }} />
                  <p>{rk}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── 5. Tövsiyələr ── */}
        <SectionCard n={5} title="Kredit profilinizi yaxşılaşdırmaq üçün addımlar" icon={<Lightbulb size={17} />}>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {recs.map((rc) => (
              <div key={rc.title} className="rounded-xl p-3.5 flex items-start gap-3" style={{ background: WASH, border: `1px solid ${LINE}` }}>
                <span className="w-8 h-8 rounded-lg grid place-items-center shrink-0" style={{ background: "#EBEFFE", color: BLUE }}>{rc.icon}</span>
                <div>
                  <p className="text-[13.5px] font-bold mb-0.5" style={{ color: NAVY }}>{rc.title}</p>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: MUTED }}>{rc.text}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── 6. Faiz simulyasiyası ── */}
        {hasIncome && mebleg > 0 && muddet > 0 && (
          <SectionCard n={6} title="Faiz dəyişsə, nəticə necə dəyişər?" icon={<Calculator size={17} />}>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: MUTED }}>
              Navio hesablamada təxmini faiz istifadə edir. Faizi dəyişərək aylıq ödənişin və borc yükünün necə dəyişdiyini görə bilərsiniz. Bu, əsas nəticəni əvəz etmir.
            </p>
            <SliderRow label="Seçilmiş faiz" value={Number(rate.toFixed(1))} min={5} max={35} step={0.5}
              format={(v) => `${v}%`} unit="%" onChange={(v) => setSimRate(v)} />
            <div className="grid grid-cols-3 gap-2.5 mt-4">
              <div className="rounded-xl p-3" style={{ background: WASH, border: `1px solid ${LINE}` }}>
                <p className="text-[11.5px] font-medium mb-0.5" style={{ color: MUTED }}>Aylıq ödəniş</p>
                <p className="text-[15px] font-extrabold" style={{ color: NAVY }}>{formatNumber(Math.round(simPayment))} ₼</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: WASH, border: `1px solid ${LINE}` }}>
                <p className="text-[11.5px] font-medium mb-0.5" style={{ color: MUTED }}>BGN</p>
                <p className="text-[15px] font-extrabold" style={{ color: TONE[simTone].fg }}>{simBgn.toFixed(1)}%</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: WASH, border: `1px solid ${LINE}` }}>
                <p className="text-[11.5px] font-medium mb-0.5" style={{ color: MUTED }}>Nəticə</p>
                <p className="text-[13px] font-extrabold mt-1" style={{ color: TONE[simTone].fg }}>{simStatus}</p>
              </div>
            </div>
            {rateTooLow && (
              <div className="mt-3 rounded-xl p-3 flex items-start gap-2 text-[12.5px] leading-relaxed" style={{ background: TONE.attention.bg, color: "#7a5a1e" }}>
                <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: "#B7791F" }} />
                <p>Bu faiz seçilmiş kredit növü və müddət üçün real bank təklifindən aşağı ola bilər. Bu nəticəyə yalnız simulyasiya kimi baxın.</p>
              </div>
            )}
          </SectionCard>
        )}

        {/* ── CTA ── */}
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
      </div>
    </main>
  );
}
