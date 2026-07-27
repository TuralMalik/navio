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

/* ─── Общий статус результата (5 статусов, детальная страница → «nəticə») ─── */
function overall(r: ReturnType<typeof calcBankScore>) {
  if (r.stops.length > 0) return { label: "Uyğun deyil", tone: "high" as Tone, note: "Bir və ya bir neçə göstərici üzrə tətbiq olunan limit və ya minimum tələb qarşılanmır." };
  if (r.score >= 80) return { label: "Yüksək nəticə", tone: "good" as Tone, note: "Göstəriciləriniz kredit müraciəti üçün müsbət görünür." };
  if (r.score >= 65) return { label: "Yaxşı nəticə", tone: "normal" as Tone, note: "Göstəriciləriniz əsasən uyğundur, amma bəzi məqamlar nəticəyə təsir edə bilər." };
  if (r.score >= 45) return { label: "Orta nəticə", tone: "attention" as Tone, note: "Nəticəniz orta səviyyədədir. Bəzi faktorlar kredit profilinizi zəiflədir." };
  return { label: "Aşağı nəticə", tone: "risk" as Tone, note: "Bir neçə faktor kredit müraciətini çətinləşdirə bilər." };
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
  const unofficial = f.gelirNovu === "qeyri_resmi";

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

  /* ─── 3. Nəticəyə təsir edən amillər — ПУБЛИЧНЫЙ УРОВЕНЬ поверх реального v3.x расчёта.
     Уровень выводится из того, в какую реальную ступень/кап попал фактор; без чисел-порогов.
     Можно показывать собственный ввод пользователя (его BGN%, его дни) — это не пороги системы. ─── */
  type PublicLevel = "Yüksək" | "Orta" | "Aşağı" | "Məhdudiyyət var";
  const LV: Record<PublicLevel, Tone> = { "Yüksək": "good", "Orta": "attention", "Aşağı": "risk", "Məhdudiyyət var": "high" };
  type Factor = { icon: React.ReactNode; label: string; tone: Tone; status: string; text: string; level: PublicLevel };
  const mk = (icon: React.ReactNode, label: string, level: PublicLevel, text: string): Factor =>
    ({ icon, label, tone: LV[level], status: level, text, level });

  const factors: Factor[] = [];

  // Borc yükü (BGN) — реальные ступени v3: ≤45 / 45-60 / 60-70 / >70(hard stop)
  factors.push(
    afterBgn > limit
      ? mk(<Scale size={17} />, "Borc yükü", "Məhdudiyyət var", "Yeni kreditdən sonra borc yükünüz tətbiq olunan həddi keçir. Bu halda nəticə uyğun deyil kimi qiymətləndirilir.")
      : afterBgn > CONFIG.bgnTierHighPct
      ? mk(<Scale size={17} />, "Borc yükü", "Aşağı", `Borc yükünüz yüksəkdir və kredit alma ehtimalına mənfi təsir edə bilər (${afterBgn.toFixed(1)}%).`)
      : afterBgn > CONFIG.bgnTierMidPct
      ? mk(<Scale size={17} />, "Borc yükü", "Orta", "Borc yükünüz orta səviyyədədir və əlavə diqqət tələb edə bilər.")
      : mk(<Scale size={17} />, "Borc yükü", "Yüksək", "Borc yükünüz kredit profili üçün müsbət göstəricidir."),
  );

  // Cari gecikmə — 4 реальные ступени v3.2
  factors.push(
    cari === 0
      ? mk(<History size={17} />, "Cari gecikmə", "Yüksək", "Aktiv gecikmə yoxdur. Bu, kredit tarixçəniz üçün müsbət göstəricidir.")
      : cari <= 5
      ? mk(<History size={17} />, "Cari gecikmə", "Orta", "Kiçik gecikmə var. Bu, nəticəyə müəyyən təsir göstərə bilər.")
      : mk(<History size={17} />, "Cari gecikmə", "Aşağı", `Aktiv gecikmə kredit profilinizə mənfi təsir edir (${cari} gün).`),
  );

  // Son 12 ayda maksimum gecikmə — реальный порог 120 (v3)
  factors.push(
    maks >= 120
      ? mk(<CalendarClock size={17} />, "Son 12 ayda maksimum gecikmə", "Aşağı", "Son 12 ayda gecikmə epizodu olub. Zamanla bunun təsiri azalır.")
      : mk(<CalendarClock size={17} />, "Son 12 ayda maksimum gecikmə", "Yüksək", "Son 12 ayda ciddi gecikmə görünmür."),
  );

  // Gəlir — ветвление по типу дохода
  if (f.gelirNovu === "teqaud") {
    factors.push(mk(<BadgeCheck size={17} />, "Gəlir növü", "Yüksək", "Təqaüd sabit gəlir mənbəyi kimi qiymətləndirilir."));
  } else if (f.gelirNovu === "qeyri_resmi") {
    factors.push(mk(<BadgeCheck size={17} />, "Gəlir növü", "Orta", "Qeyri-rəsmi gəlir mənbəyi kredit qiymətləndirməsində əlavə diqqətlə nəzərdən keçirilir."));
  } else {
    factors.push(
      stajOk
        ? mk(<BadgeCheck size={17} />, "Gəlirin etibarlılığı", "Yüksək", "Gəlir mənbəyiniz və staj göstəriciniz kredit profili üçün müsbət göstəricidir.")
        : mk(<BadgeCheck size={17} />, "Gəlirin etibarlılığı", "Aşağı", "İş stajınız minimum tələbi qarşılamır. Bu, nəticəyə mənfi təsir edə bilər."),
    );
  }

  // Müddət — ветвление по типу дохода
  if (unofficial) {
    factors.push(
      muddet <= 36
        ? mk(<CalendarRange size={17} />, "Müddət", "Yüksək", "Kredit müddəti aylıq ödəniş və ümumi risk baxımından münasib görünür.")
        : mk(<CalendarRange size={17} />, "Müddət", "Aşağı", "Uzun kredit müddəti ümumi faiz xərcini və risk qiymətləndirməsini artıra bilər."),
    );
  } else {
    factors.push(
      muddet > CONFIG.maxTermMonths && f.kreditNovu !== "ipoteka"
        ? mk(<CalendarRange size={17} />, "Müddət", "Məhdudiyyət var", "Seçilmiş müddət bu kredit növü üçün tətbiq olunan maksimum həddi keçir.")
        : muddet > 48
        ? mk(<CalendarRange size={17} />, "Müddət", "Aşağı", "Uzun kredit müddəti ümumi faiz xərcini və risk qiymətləndirməsini artıra bilər.")
        : muddet > 36
        ? mk(<CalendarRange size={17} />, "Müddət", "Orta", "Kredit müddəti orta səviyyədədir və ümumi faiz xərcinə təsir edə bilər.")
        : mk(<CalendarRange size={17} />, "Müddət", "Yüksək", "Kredit müddəti aylıq ödəniş və ümumi risk baxımından münasib görünür."),
    );
  }

  // Məbləğ — ветвление по типу дохода
  if (unofficial) {
    factors.push(
      mebleg <= 1000
        ? mk(<TrendingDown size={17} />, "Məbləğ", "Yüksək", "Seçilmiş məbləğ kredit profili baxımından münasib görünür.")
        : mebleg <= 1500
        ? mk(<TrendingDown size={17} />, "Məbləğ", "Orta", "Seçilmiş məbləğ orta səviyyədədir və əlavə qiymətləndirmə tələb edə bilər.")
        : mk(<TrendingDown size={17} />, "Məbləğ", "Aşağı", "Seçilmiş məbləğ yüksəkdir və kredit alma ehtimalına mənfi təsir edə bilər."),
    );
  } else {
    factors.push(
      mebleg <= 20000
        ? mk(<TrendingDown size={17} />, "Məbləğ", "Yüksək", "Seçilmiş məbləğ kredit profili baxımından münasib görünür.")
        : mebleg <= CONFIG.amountCap79Above
        ? mk(<TrendingDown size={17} />, "Məbləğ", "Orta", "Seçilmiş məbləğ orta səviyyədədir və əlavə qiymətləndirmə tələb edə bilər.")
        : mk(<TrendingDown size={17} />, "Məbləğ", "Aşağı", "Seçilmiş məbləğ yüksəkdir və kredit alma ehtimalına mənfi təsir edə bilər."),
    );
  }

  // Yaş — показываем ТОЛЬКО как Məhdudiyyət var (иначе фактор не выводится вовсе)
  if (yas > 0 && yas < 18) {
    factors.push(mk(<CalendarClock size={17} />, "Yaş", "Məhdudiyyət var", "Minimum yaş tələbi qarşılanmır."));
  } else if (ageAtEnd > CONFIG.maxAgeAtEnd) {
    factors.push(mk(<CalendarClock size={17} />, "Yaş", "Məhdudiyyət var", "Kreditin bitmə tarixi üçün maksimum yaş həddi keçir."));
  }

  // Kredit xətti limiti — показываем ТОЛЬКО как Məhdudiyyət var
  if (f.kreditNovu === "kart" && hasIncome && (mebleg + num(f.movcudKartLimit)) > income * CONFIG.maxCardLineToIncomeRatio) {
    factors.push(mk(<CreditCard size={17} />, "Kredit xətti limiti", "Məhdudiyyət var", "Ümumi kredit xətti limiti icazə verilən həddi keçir."));
  }

  const hasMehdudiyyet = factors.some((x) => x.level === "Məhdudiyyət var");

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

  /* ─── 5. Tövsiyələr — макс 3, приоритет: Məhdudiyyət var → Aşağı → Orta ─── */
  type Rec = { icon: React.ReactNode; title: string; text: string; priority: number };
  const recsAll: Rec[] = [];
  // Borc yükü / məbləğ
  if (afterBgn > limit || mebleg > CONFIG.amountCap59Above)
    recsAll.push({ priority: 0, icon: <TrendingDown size={17} />, title: "Kredit məbləğini azaldın", text: "Daha aşağı məbləğ aylıq ödənişi və borc yükünü azalda bilər." });
  else if (afterBgn > CONFIG.bgnTierHighPct || mebleg > CONFIG.amountCap79Above)
    recsAll.push({ priority: 1, icon: <TrendingDown size={17} />, title: "Kredit məbləğini azaldın", text: "Daha aşağı məbləğ aylıq ödənişi və borc yükünü azalda bilər." });
  else if (afterBgn > CONFIG.bgnTierMidPct)
    recsAll.push({ priority: 2, icon: <TrendingDown size={17} />, title: "Kredit məbləğini azaldın", text: "Daha aşağı məbləğ aylıq ödənişi və borc yükünü azalda bilər." });
  // Мövcud öhdəliklər
  if (num(f.movcudNaqdOdenis) > 0 || num(f.movcudKartLimit) > 0)
    recsAll.push({ priority: afterBgn > CONFIG.bgnTierMidPct ? 1 : 2, icon: <CreditCard size={17} />, title: "Mövcud öhdəlikləri azaldın", text: "Cari kredit ödənişlərinin azalması yeni kredit üçün profilinizi yaxşılaşdıra bilər." });
  // Cari gecikmə
  if (cari > 0) {
    recsAll.push({ priority: cari > 5 ? 1 : 2, icon: <Clock size={17} />, title: "Cari gecikməni bağlayın", text: "Aktiv gecikmə kredit profilinizə mənfi təsir edir." });
    recsAll.push({ priority: cari > 5 ? 1 : 2, icon: <CalendarRange size={17} />, title: "Müraciəti gecikmədən sonra edin", text: "Aktiv gecikmə bağlandıqdan sonra nəticəniz daha yaxşı görünə bilər." });
  }
  // Müddət
  if (muddet > CONFIG.maxTermMonths && f.kreditNovu !== "ipoteka")
    recsAll.push({ priority: 0, icon: <CalendarRange size={17} />, title: "Müddəti qısaldın", text: "Seçilmiş müddət tətbiq olunan maksimum həddi keçir." });
  else if (!unofficial && muddet > 48)
    recsAll.push({ priority: 1, icon: <CalendarRange size={17} />, title: "Müddəti yenidən yoxlayın", text: "Müddəti azaltmaq risk qiymətləndirməsini yaxşılaşdıra bilər." });
  else if ((unofficial && muddet > 36) || (!unofficial && muddet > 36))
    recsAll.push({ priority: 2, icon: <CalendarRange size={17} />, title: "Müddəti yenidən yoxlayın", text: "Müddəti artırmaq aylıq ödənişi azalda bilər, amma ümumi faiz xərcini artıra bilər." });
  // Gəlir
  if (f.gelirNovu === "qeyri_resmi")
    recsAll.push({ priority: 2, icon: <BadgeCheck size={17} />, title: "Gəliri rəsmiləşdirin", text: "Rəsmi gəlir təsdiqi (əmək müqaviləsi / VÖEN) profilinizi əhəmiyyətli gücləndirir." });
  else if ((f.gelirNovu === "resmi" || f.gelirNovu === "fs" || f.gelirNovu === "xarici") && !stajOk)
    recsAll.push({ priority: 1, icon: <BadgeCheck size={17} />, title: "İş stajını artırın", text: "Cari iş yerində daha uzun staj kredit profilinizi gücləndirir." });

  const recs: Rec[] = recsAll.sort((a, b) => a.priority - b.priority).slice(0, 3);
  if (recs.length === 0)
    recs.push({ priority: 3, icon: <Sparkles size={17} />, title: "Profiliniz yaxşı vəziyyətdədir", text: "Ödənişləri vaxtında etməyə davam edin — bu, kredit profilinizi güclü saxlayır." });

  /* ─── 6. Faiz simulyasiyası — чипы ставок (гипотетический «что если», не выбор реальной ставки) ─── */
  const baseRate = r.estimatedRate != null ? r.estimatedRate : (parseFloat(f.faiz) || 24);
  const RATE_CHIPS = [12, 16, 20, 24];
  const defaultChip = RATE_CHIPS.reduce((a, b) => (Math.abs(b - baseRate) < Math.abs(a - baseRate) ? b : a), RATE_CHIPS[0]);
  const rate = simRate ?? defaultChip;
  const simPayment = annuityPayment(mebleg, muddet, rate);
  const simTotal = num(f.movcudNaqdOdenis) + kartStress + simPayment;
  const simBgn = hasIncome ? (simTotal / income) * 100 : 999;
  const simTone: Tone = simBgn > limit ? "high" : simBgn > CONFIG.bgnTierHighPct ? "risk" : simBgn > CONFIG.bgnTierMidPct ? "attention" : "good";
  const simStatus = simBgn > limit ? "Uyğun deyil" : simBgn > CONFIG.bgnTierHighPct ? "Aşağı" : simBgn > CONFIG.bgnTierMidPct ? "Orta" : "Yüksək";

  const blocked = r.stops.length > 0;
  const metrics = [
    { label: "BGN", value: blocked || !hasIncome ? "—" : `${afterBgn.toFixed(1)}%` },
    { label: "Aylıq ödəniş", value: blocked || r.yeniOdenis <= 0 ? "—" : `${formatNumber(Math.round(r.yeniOdenis))} ₼` },
    { label: "Təxmini faiz", value: blocked ? "—" : (r.estimatedRate != null ? `${r.estimatedRate.toFixed(1)}%` : `${parseFloat(f.faiz) || 24}%`) },
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

            {/* Метрики (3) */}
            <div className="grid grid-cols-3 gap-2 md:w-[320px] shrink-0">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-xl p-3 text-center sm:text-left" style={{ background: WASH, border: `1px solid ${LINE}` }}>
                  <p className="text-[11px] font-medium mb-0.5" style={{ color: MUTED }}>{m.label}</p>
                  <p className="text-[15px] font-extrabold whitespace-nowrap" style={{ color: NAVY }}>{m.value}</p>
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

        {/* ── 3. Nəticəyə təsir edən amillər (публичные уровни) ── */}
        <SectionCard n={3} title="Nəticəyə təsir edən amillər" icon={<Sparkles size={17} />}>
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
          {hasMehdudiyyet && (
            <div className="mt-3 rounded-xl p-3 flex items-start gap-2 text-[12.5px] leading-relaxed" style={{ background: WASH, color: MUTED }}>
              <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: "#B7791F" }} />
              <p>Qeyd: «Məhdudiyyət var» statusu skorun aşağı olması deyil. Bu, müvafiq limit və ya minimum tələbin qarşılanmadığını göstərir.</p>
            </div>
          )}
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
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: MUTED }}>
              Navio hesablamada təxmini faiz istifadə edir. Fərqli faizlərdə aylıq ödənişin və borc yükünün necə dəyişdiyini yoxlayın.
            </p>
            {/* Прямой заметный дисклеймер рядом с чипами */}
            <div className="rounded-xl p-3 flex items-start gap-2 text-[12.5px] leading-relaxed mb-4" style={{ background: TONE.attention.bg, color: "#7a5a1e" }}>
              <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: "#B7791F" }} />
              <p>Bu, yalnız fərziyyə hesablamasıdır. Real faiz dərəcəsi bankın öz qiymətləndirməsinə əsasən dəyişə bilər.</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {RATE_CHIPS.map((c) => {
                const on = c === rate;
                return (
                  <button key={c} type="button" onClick={() => setSimRate(c)}
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
                <p className="text-[15px] font-extrabold whitespace-nowrap" style={{ color: NAVY }}>{formatNumber(Math.round(simPayment))} ₼</p>
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
