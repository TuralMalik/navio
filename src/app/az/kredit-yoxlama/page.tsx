"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, XCircle, CheckCircle, Info, ArrowRight, Building2, Landmark } from "lucide-react";
import { SliderRow } from "@/components/ui/SliderRow";

/* ─── Types ─── */
type Mode = "bank" | "bokt";
type GelirNovu = "resmi" | "xarici" | "fs" | "teqaud" | "qeyri_resmi";
type KreditNovu = "naqd" | "kart" | "ipoteka" | "avto";
type IsStaji = "0_3" | "4_5" | "6_12" | "12_plus";
type BaglanmisTecrube = "var" | "yoxdur" | "tecrube_yox";

interface BankForm {
  kreditNovu: KreditNovu;
  mebleg: string;
  muddət: string;
  faiz: string;
  gelirNovu: GelirNovu;
  gelir: string;
  isStaji: IsStaji;
  yas: string;
  movcudNaqdOdenis: string;
  movcudKartLimit: string;
  cariGecikmeGun: string;      // текущая активная просрочка, дней
  kumulyativ6ay: string;       // суммарная просрочка за 6 мес, дней
  maks12ay: string;            // максимальная единичная просрочка за 12 мес, дней
  baglanmisTecrube: BaglanmisTecrube;
  emanet: boolean;
  emanetMebleg: string;
}

interface BoktForm {
  mebleg: string;
  gelir: string;
  kreditTarixce: "yox" | "gecikme";
  emanet: boolean;
  emanetMebleg: string;
}

/* ─── Scoring config — значения обновляются со временем (ежегодно) ─── */
const CONFIG = {
  subsistenceMinWorking: 317,    // прожиточный минимум, трудоспособные (2026)
  subsistenceMinPensioner: 245,  // прожиточный минимум, пенсионеры (2026)
  unofficialIncomeAvg: 600,      // оценка неофициального дохода (v2)
  cardStressMonths: 24,          // срок для стресс-платежа по кредитке
  cardStressRate: 26,            // % годовых для стресс-платежа по кредитке
  // Ставки наличного кредита
  cashRateUnofficial: 35,        // плоская ставка, НЕОФИЦИАЛЬНЫЙ наличный, всегда
  cashRateOfficialBase: 10.9,    // база ОФИЦИАЛЬНОГО наличного (лучший случай)
  cashRateOfficialMax: 29,       // потолок официального наличного (худший случай)
  bgnRateSurcharge: { low: 0, mid: 6, high: 12.5 },              // BGN <45 / 45–60 / 60–70
  termRateSurcharge: { m12: 0, m24: 1.5, m36: 3, m48: 4.5, m59: 5.5 }, // ≤12/24/36/48/59
  // Разовые комиссии (%) — матрица доход × тип кредита; null = тип кредита недоступен
  commissions: {
    official:   { cash: 1, card: 0, mortgage: 0.5, auto: 0.5 },
    unofficial: { cash: 3, card: 3, mortgage: null, auto: null },
  } as Record<"official" | "unofficial", Record<"cash" | "card" | "mortgage" | "auto", number | null>>,
  maxTermMonths: 59,             // максимальный срок (кроме ипотеки)
  maxAgeAtEnd: 73,               // макс. возраст на конец срока
  maxCardLineToIncomeRatio: 5,   // лимит по кредитным линиям: 5× дохода
};

/* ─── Annuity formula ─── */
function annuityPayment(principal: number, months: number, annualRate: number): number {
  if (months <= 0 || principal <= 0 || annualRate <= 0) return principal / Math.max(months, 1);
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/* ─── Доход для скоринга: неофициальный доход зажимается потолком ─── */
function incomeForScoring(type: GelirNovu, entered: number): number {
  if (type === "qeyri_resmi") return Math.min(entered, CONFIG.unofficialIncomeAvg);
  return entered;
}

/* ─── Прожиточный минимум по типу дохода ─── */
function subsistenceMin(type: GelirNovu): number {
  return type === "teqaud" ? CONFIG.subsistenceMinPensioner : CONFIG.subsistenceMinWorking;
}

/* ─── Разовая комиссия от суммы кредита — матрица доход × тип, НЕ входит в месячный платёж ───
   null = тип кредита недоступен для этого дохода (гейт срабатывает раньше расчёта). */
function calcCommission(kreditNovu: KreditNovu, gelirNovu: GelirNovu, amount: number) {
  const row = CONFIG.commissions[gelirNovu === "qeyri_resmi" ? "unofficial" : "official"];
  const key = kreditNovu === "naqd" ? "cash" : kreditNovu === "kart" ? "card" : kreditNovu === "ipoteka" ? "mortgage" : "auto";
  const pct = row[key];
  if (pct === null) return { pct: 0, amount: 0, unavailable: true };
  return { pct, amount: Math.round((pct / 100) * amount), unavailable: false };
}

/* ─── Ставка наличного кредита по сегментам ───
   Неофициальный доход → плоские 35%.
   Официальный → плавающая: база 10.9 + надбавкаBGN (главный драйвер) + надбавкаСрок, зажим 10.9–29.
   Эффект остатка: если денег на руках < прожминимума — надбавкаBGN не ниже уровня «45–60%» (+mid). */
function estimateCashRate(incomeType: GelirNovu, bgn: number, termMonths: number, residual: number): number {
  if (incomeType === "qeyri_resmi") return CONFIG.cashRateUnofficial; // 35, плоская

  const s = CONFIG.bgnRateSurcharge;
  let bgnAdd = bgn < 45 ? s.low : bgn < 60 ? s.mid : s.high;

  // Эффект остатка: мало денег на руках → не ниже среднего уровня BGN
  if (residual < subsistenceMin(incomeType)) bgnAdd = Math.max(bgnAdd, s.mid);

  const t = CONFIG.termRateSurcharge;
  const termAdd = termMonths <= 12 ? t.m12 : termMonths <= 24 ? t.m24
    : termMonths <= 36 ? t.m36 : termMonths <= 48 ? t.m48 : t.m59;

  const rate = CONFIG.cashRateOfficialBase + bgnAdd + termAdd;
  return Math.min(CONFIG.cashRateOfficialMax, Math.max(CONFIG.cashRateOfficialBase, rate));
}

/* ─── Bank scoring ─── */
function calcBankScore(f: BankForm) {
  const nn = (v: string) => Math.max(0, parseFloat(v) || 0); // отрицательные → 0
  const mebleg = nn(f.mebleg);
  const muddət = Math.max(0, parseInt(f.muddət) || 0);
  const gelir = nn(f.gelir);
  const yas = Math.max(0, parseInt(f.yas) || 0);
  const movcudNaqdOdenis = nn(f.movcudNaqdOdenis);
  const movcudKartLimit = nn(f.movcudKartLimit);
  const cariGecikmeGun = Math.max(0, parseInt(f.cariGecikmeGun) || 0);   // текущая активная просрочка
  const kumulyativ6ay = Math.max(0, parseInt(f.kumulyativ6ay) || 0);    // суммарная просрочка за 6 мес
  const maks12ay = Math.max(0, parseInt(f.maks12ay) || 0);              // макс. единичная просрочка за 12 мес

  // Доход для скоринга: неофициальный зажимается потолком (банк оценивает своей моделью)
  const income = incomeForScoring(f.gelirNovu, gelir);

  // Разовая комиссия от суммы кредита (показывается в общей стоимости)
  const commission = calcCommission(f.kreditNovu, f.gelirNovu, mebleg);

  // Стресс-платёж по существующей кредитке (лимит под ставку CONFIG на CONFIG месяцев)
  const kartAyliOdenis = annuityPayment(movcudKartLimit, CONFIG.cardStressMonths, CONFIG.cardStressRate);

  let estimatedRate: number | null = null;
  let remaining: number | null = null;
  let highRisk = false;

  let yeniOdenis: number;
  let bgn: number;

  // ── ШАГ 1: гейт доступности типа кредита (до любых расчётов) ──
  // Для неофициального дохода ипотека и автокредит не выдаются.
  if (f.gelirNovu === "qeyri_resmi" && (f.kreditNovu === "ipoteka" || f.kreditNovu === "avto") && !f.emanet) {
    return {
      score: 0, stops: ["Bu kredit növü rəsmi gəlir tələb edir"], warnings: [],
      bgn: 0, yeniOdenis: 0, remaining: null, estimatedRate: null,
      commission: { pct: 0, amount: 0, unavailable: true },
      blocks: null, isEmanet: false, emanetOk: false,
    };
  }

  // Пустой или нулевой доход — расчёт невозможен, просим заполнить (вместо «BGN 999%»)
  if (!f.emanet && gelir <= 0) {
    return {
      score: 0, stops: ["Aylıq gəliri daxil edin — nəticə üçün gəlir məlumatı tələb olunur"], warnings: [],
      bgn: 0, yeniOdenis: 0, remaining: null, estimatedRate: null,
      commission, blocks: null, isEmanet: false, emanetOk: false,
    };
  }

  // Наличный кредит → сегментная ставка (неофиц. 35% плоско / офиц. плавающая).
  // Карта/ипотека/авто — ставка вводится пользователем вручную.
  const useCashRate = f.kreditNovu === "naqd" && !f.emanet;

  if (useCashRate) {
    // Платёж/BGN/остаток зависят от ставки, а ставка — от BGN/остатка → два прохода.
    const calc = (rate: number) => {
      const pmt = annuityPayment(mebleg, muddət, rate);
      const total = movcudNaqdOdenis + kartAyliOdenis + pmt;
      return { pmt, bgn: income > 0 ? (total / income) * 100 : 999, rem: income - total };
    };
    // Проход 1 — при базовой ставке определяем BGN и остаток
    const p1 = calc(CONFIG.cashRateOfficialBase);
    estimatedRate = estimateCashRate(f.gelirNovu, p1.bgn, muddət, p1.rem);
    // Проход 2 — пересчёт платежа по итоговой ставке (для отображения BGN/остатка)
    const p2 = calc(estimatedRate);
    yeniOdenis = p2.pmt;
    bgn = p2.bgn;
    remaining = p2.rem;
    highRisk = bgn > 45 || remaining < subsistenceMin(f.gelirNovu);
  } else {
    const faiz = parseFloat(f.faiz) || 24;
    yeniOdenis = annuityPayment(mebleg, muddət, faiz);
    // BGN с учётом нового кредита; знаменатель — доход для скоринга
    bgn = income > 0 ? ((movcudNaqdOdenis + kartAyliOdenis + yeniOdenis) / income) * 100 : 999;
    remaining = income - (movcudNaqdOdenis + kartAyliOdenis + yeniOdenis);
  }

  const ageAtEnd = yas + Math.ceil(muddət / 12);

  const stops: string[] = [];
  const warnings: string[] = [];

  if (!f.emanet) {
    // 1) Возраст < 18 — закон
    if (yas > 0 && yas < 18) stops.push("Yaşınız 18-dən azdır — qanunvericiliyə görə kredit verilə bilməz");
    // 2) Возраст на конец срока > лимит
    if (ageAtEnd > CONFIG.maxAgeAtEnd) stops.push(`Müddətin sonunda yaşınız ${ageAtEnd} olacaq — limit ${CONFIG.maxAgeAtEnd}-dür`);
    // 3) BGN > 70% — долговая нагрузка
    if (bgn > 70) stops.push(`BGN ${bgn.toFixed(1)}% — borc yükü 70%-dən yüksəkdir`);
    // 4) Срок > лимит (кроме ипотеки)
    if (f.kreditNovu !== "ipoteka" && muddət > CONFIG.maxTermMonths) stops.push(`${f.kreditNovu === "naqd" ? "Nağd kredit" : f.kreditNovu === "kart" ? "Kredit kartı" : "Avtokredit"} müddəti ${CONFIG.maxTermMonths} aydan çox ola bilməz`);
    // 5) Kredit kartı: новый + существующие лимиты > 5× дохода — закон о кредитных линиях
    if (f.kreditNovu === "kart" && income > 0 && (mebleg + movcudKartLimit) > income * CONFIG.maxCardLineToIncomeRatio) stops.push(`Ümumi kredit xətti limiti (₼ ${(mebleg + movcudKartLimit).toLocaleString()}) gəlirin ${CONFIG.maxCardLineToIncomeRatio} mislini (₼ ${(income * CONFIG.maxCardLineToIncomeRatio).toLocaleString()}) keçir — yeni limit mövcud limitlərlə birlikdə aylıq gəlirin ${CONFIG.maxCardLineToIncomeRatio} mislindən çox ola bilməz`);
  } else {
    const em = parseFloat(f.emanetMebleg) || 0;
    if (em < mebleg) warnings.push("Əmanət məbləği kredit məbləğini tam örtməlidir");
  }

  if (!f.emanet) {
    if (f.gelirNovu === "qeyri_resmi") {
      warnings.push(`Qeyri-rəsmi gəlir hesablamada məhdud dəyərlə (təxminən ${CONFIG.unofficialIncomeAvg} ₼) qiymətləndirilir — bank öz modeli ilə yoxlayır.`);
    }
    if (bgn >= 45 && bgn <= 70) {
      warnings.push(`BGN ${bgn.toFixed(1)}% — borc yükü yüksəkdir, bəzi banklar rədd edə bilər.`);
    }
    if (highRisk) {
      warnings.push("Borc yükü və ya gəlirdən sonra qalan məbləğ bank üçün əlavə risk yarada bilər. Buna görə hesablamada daha yüksək faiz ssenarisi istifadə olunub.");
    }
    if (cariGecikmeGun > 0) {
      warnings.push(`Cari gecikmə ${cariGecikmeGun} gün — aktiv gecikmə kredit şansını azaldır.`);
    }
    if (kumulyativ6ay >= 90) {
      warnings.push(`Son 6 ayda kumulyativ gecikmə ${kumulyativ6ay} gün — bu, ciddi risk faktorudur.`);
    }
    if (maks12ay >= 120) {
      warnings.push(`Son 12 ayda maksimum gecikmə ${maks12ay} gün — banklar bu dövrə xüsusi diqqət yetirir.`);
    }
  }

  if (f.emanet) {
    const em = parseFloat(f.emanetMebleg) || 0;
    return { score: em >= mebleg ? 92 : 0, stops: [], warnings, bgn, yeniOdenis, remaining, estimatedRate, commission, blocks: null, isEmanet: true, emanetOk: em >= mebleg };
  }

  if (stops.length > 0) {
    return { score: 0, stops, warnings, bgn, yeniOdenis, remaining, estimatedRate, commission, blocks: null, isEmanet: false, emanetOk: false };
  }

  // ── Блок BGN (35) — плоские ступени ──
  const bBgn = bgn <= 45 ? 35 : bgn <= 60 ? 15 : 5;

  // ── Блок «Кредитная история» (35) ──
  // Положительный опыт (0–15)
  const positivePts =
    f.baglanmisTecrube === "var" ? 15 :           // есть успешно закрытые кредиты
    f.baglanmisTecrube === "tecrube_yox" ? 8 :    // новый заёмщик, нет истории
    5;                                            // была проблемная история
  // Текущий статус по активной просрочке (0–12)
  const cariPts =
    cariGecikmeGun === 0 ? 12 :
    cariGecikmeGun <= 5 ? 8 :
    cariGecikmeGun <= 15 ? 4 : 0;
  // Недавняя история (кумулятив 6 мес): чистая / незначительные / серьёзные (0–8)
  const recentPts =
    kumulyativ6ay === 0 ? 8 :
    kumulyativ6ay < 30 ? 4 : 0;
  const bHistory = positivePts + cariPts + recentPts;

  // ── Блок «Надёжность дохода» (15) — тип + бинарный порог стажа ──
  let bIncome: number;
  if (f.gelirNovu === "teqaud") {
    bIncome = 8;                                  // пенсионер: стаж не применяется
  } else if (f.gelirNovu === "qeyri_resmi") {
    bIncome = 5;                                  // неофициальный: стаж не участвует
  } else {
    const base = f.gelirNovu === "resmi" ? 9 : 7; // resmi выше; xarici/fs — высокий
    // Порог стажа: rəsmi ≥6 мес, xarici/VÖEN ≥12 мес — бинарно
    const thresholdMet = f.gelirNovu === "resmi"
      ? (f.isStaji === "6_12" || f.isStaji === "12_plus")
      : f.isStaji === "12_plus";
    const bonus = thresholdMet ? (f.gelirNovu === "resmi" ? 6 : 5) : 0;
    bIncome = base + bonus;
  }

  // ── Блок «Доступность» (15) — срок + сумма, ЗАВИСИТ ОТ ТИПА ДОХОДА ──
  const unofficial = f.gelirNovu === "qeyri_resmi";
  const termPts = unofficial
    ? (muddət <= 36 ? 7 : 1)                               // неофиц.: длинные сроки — только повторным
    : (muddət <= 36 ? 7 : muddət <= 48 ? 4 : 1);
  const amountPts = unofficial
    ? (mebleg <= 1000 ? 7 : mebleg <= 1500 ? 5 : mebleg <= 2500 ? 2 : 1)  // неофиц.: потолок доверия ниже
    : (mebleg <= 10000 ? 8 : mebleg <= 20000 ? 6 : mebleg <= 30000 ? 4 : mebleg <= 40000 ? 2 : 1);
  const bAccess = termPts + amountPts;

  const rawBlockScore = bBgn + bHistory + bIncome + bAccess;

  // ── Капы балла (потолки) — срабатывает худший ──
  const caps: number[] = [100];
  if (bgn > 45 && bgn <= 60) caps.push(79);
  else if (bgn > 60 && bgn <= 70) caps.push(59);
  if (cariGecikmeGun >= 6 && cariGecikmeGun <= 15) caps.push(79);
  else if (cariGecikmeGun > 15) caps.push(59);
  if (kumulyativ6ay >= 90) caps.push(69);
  if (maks12ay >= 120) caps.push(69);
  // Неофициальный доход: потолок доверия. Малая сумма/короткий срок → не выше 79;
  // всё что больше → не выше 59 (высокий шанс не даём вообще).
  if (unofficial) caps.push(mebleg <= 1000 && muddət <= 36 ? 79 : 59);
  // Официальный доход: крупная сумма необеспеченным наличным на практике почти не выдаётся —
  // даже при отличном профиле высокий шанс не даём.
  else if (mebleg > 40000) caps.push(59);
  else if (mebleg > 30000) caps.push(79);

  const score = Math.min(rawBlockScore, ...caps);

  return {
    score, stops, warnings, bgn, yeniOdenis, remaining, estimatedRate, commission, isEmanet: false, emanetOk: false,
    blocks: [
      { label: "Borc yükü (BGN)", score: bBgn, max: 35 },
      { label: "Kredit tarixçəsi", score: bHistory, max: 35 },
      { label: "Gəlirin etibarlılığı", score: bIncome, max: 15 },
      { label: "Əlçatanlıq (məbləğ + müddət)", score: bAccess, max: 15 },
    ],
  };
}

/* ─── BOKT scoring ─── */
function calcBoktScore(f: BoktForm) {
  const mebleg = parseFloat(f.mebleg) || 0;
  const gelir = parseFloat(f.gelir) || 0;
  const warnings: string[] = [];

  if (f.emanet) {
    const em = parseFloat(f.emanetMebleg) || 0;
    if (em < mebleg) warnings.push("Əmanət məbləği kredit məbləğini tam örtməlidir");
    return { score: em >= mebleg ? 92 : 0, warnings, stops: [] as string[], maxOdenis: mebleg * 2, isEmanet: true, emanetOk: em >= mebleg };
  }

  if (mebleg > 500) warnings.push("BOKT-larda maksimum məbləğ adətən 500 AZN-dir");

  const gelirPts = gelir > 500 ? 40 : gelir >= 300 ? 25 : 10;
  const tarixcePts = f.kreditTarixce === "yox" ? 40 : 15;
  const meblegPts = mebleg <= 500 ? 20 : 0;
  const score = Math.min(100, gelirPts + tarixcePts + meblegPts);

  return { score, warnings, stops: [] as string[], maxOdenis: mebleg * 2, isEmanet: false, emanetOk: false };
}

/* ─── Разбор кейса: почему такой балл и как улучшить (только текст) ─── */
function explainResult(f: BankForm, r: { bgn: number }) {
  const items: { title: string; text: string }[] = [];
  const cari = parseInt(f.cariGecikmeGun) || 0;
  const kum = parseInt(f.kumulyativ6ay) || 0;
  const maks = parseInt(f.maks12ay) || 0;
  const mebleg = parseFloat(f.mebleg) || 0;
  const muddət = parseInt(f.muddət) || 0;

  if (r.bgn > 45)
    items.push({ title: "Borc yükü yüksəkdir", text: "Mövcud kreditləri azaltmaq və ya daha kiçik məbləğ seçmək şansınızı artırar." });
  if (cari > 0)
    items.push({ title: "Aktiv gecikmə", text: "Aktiv gecikməniz var. Onu bağlamaq nəticəni əhəmiyyətli yaxşılaşdırar." });
  if (kum >= 90 || maks >= 120)
    items.push({ title: "Kredit tarixçəsi", text: "Keçmiş gecikmələr nəticəni məhdudlaşdırır. Ödənişləri vaxtında etmək zamanla profilinizi yaxşılaşdırır." });
  if (mebleg > 20000 || muddət > 48)
    items.push({ title: "Məbləğ və müddət", text: "Daha kiçik məbləğ və ya qısa müddət təsdiq şansını artırır." });
  if (f.gelirNovu === "qeyri_resmi")
    items.push({ title: "Gəlir növü", text: "Rəsmi gəlir təsdiq şansını əhəmiyyətli artırır." });
  const stajOk =
    (f.gelirNovu === "resmi" && (f.isStaji === "6_12" || f.isStaji === "12_plus")) ||
    ((f.gelirNovu === "fs" || f.gelirNovu === "xarici") && f.isStaji === "12_plus");
  if ((f.gelirNovu === "resmi" || f.gelirNovu === "fs" || f.gelirNovu === "xarici") && !stajOk)
    items.push({ title: "İş stajı", text: "Cari iş yerində daha uzun staj (rəsmi üçün 6+ ay, digərləri üçün 12+ ay) şansı artırır." });
  // Всегда — позитивный совет про зарплатный проект (без названия банка)
  items.push({ title: "Əmək haqqı layihəsi", text: "Əmək haqqınızı aldığınız banka müraciət etsəniz, şansınız adətən daha yüksək olur." });
  return items;
}

/* ─── Gauge SVG ─── */
function Gauge({ score }: { score: number }) {
  const pct = Math.min(score / 100, 1);
  const r = 70;
  const cx = 90, cy = 85;
  const arcLen = Math.PI * r;
  const dashLen = pct * arcLen;
  const needleX = cx + r * Math.cos(Math.PI - pct * Math.PI);
  const needleY = cy - r * Math.sin(pct * Math.PI);

  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-xs mx-auto">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="url(#scoreGrad)"
        strokeWidth="14" strokeLinecap="round" strokeDasharray={`${dashLen} ${arcLen}`} />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#1e293b" />
      <text x={cx - r - 2} y={cy + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">0</text>
      <text x={cx + r + 2} y={cy + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">100</text>
      <text x={cx} y={cy - 16} textAnchor="middle" fontSize="26" fontWeight="800" fill="#0f172a">{score}</text>
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="8" fill="#64748b">/ 100</text>
    </svg>
  );
}

/* ─── BGN Bar ─── */
function BgnBar({ bgn }: { bgn: number }) {
  const pct = Math.min(bgn / 100, 1);
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>BGN: <strong className="text-gray-800">{bgn.toFixed(1)}%</strong></span>
        <span>Limit: 70%</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500">
        <div className="absolute top-0 bottom-0 right-0 bg-gray-100/60" style={{ left: `${pct * 100}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-gray-700 shadow"
          style={{ left: `calc(${pct * 100}% - 5px)` }} />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
        <span>Yaxşı</span><span>Orta</span><span>Yüksək</span><span>Stop</span>
      </div>
    </div>
  );
}

/* ─── Score label ─── */
function scoreLabel(score: number, mode: Mode) {
  if (mode === "bank") {
    if (score >= 80) return { text: "Yüksək şans — Bankların əksəriyyəti təsdiqləyə bilər", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: "🟢" };
    if (score >= 65) return { text: "Yaxşı şans — Bir çox bank təsdiqləyə bilər", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: "🟢" };
    if (score >= 45) return { text: "Orta şans — Şansınız var, bankdan asılıdır", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", icon: "🟡" };
    return { text: "Aşağı şans — Profili yaxşılaşdırmaq tövsiyə olunur", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", icon: "🟠" };
  } else {
    if (score >= 80) return { text: "BOKT-dan kredit ala bilərsiniz", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: "🟢" };
    if (score >= 40) return { text: "Bəzi BOKT-lar təklif edə bilər", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", icon: "🟡" };
    return { text: "BOKT-dan da çətin olacaq", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: "🔴" };
  }
}

function Field({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
const selectCls = inputCls;
const sectionTitle = "text-xs font-bold text-gray-400 uppercase tracking-wider mb-3";

/* ─── Main ─── */
function KreditYoxlamaContent() {
  const searchParams = useSearchParams();
  const initNov = (searchParams.get("nov") as KreditNovu) || "naqd";
  const initMebleq = searchParams.get("mebleq") || "500";
  const initMuddet = searchParams.get("muddet") || "24";
  const initFaiz = searchParams.get("faiz") || "24";

  const [mode, setMode] = useState<Mode>("bank");
  const [submitted, setSubmitted] = useState(false);
  const [pressed, setPressed] = useState(false);

  const [bank, setBank] = useState<BankForm>({
    kreditNovu: initNov,
    mebleg: initMebleq,
    muddət: initMuddet,
    faiz: initFaiz,
    gelirNovu: "resmi",
    gelir: "",
    isStaji: "12_plus",
    yas: "30",
    movcudNaqdOdenis: "0",
    movcudKartLimit: "0",
    cariGecikmeGun: "0",
    kumulyativ6ay: "0",
    maks12ay: "0",
    baglanmisTecrube: "var",
    emanet: false,
    emanetMebleg: "",
  });

  const [bokt, setBokt] = useState<BoktForm>({
    mebleg: "",
    gelir: "",
    kreditTarixce: "yox",
    emanet: false,
    emanetMebleg: "",
  });

  const bResult = useMemo(() => calcBankScore(bank), [bank]);
  const nResult = useMemo(() => calcBoktScore(bokt), [bokt]);

  const result = mode === "bank" ? bResult : nResult;

  function switchToBokt() {
    setBokt(n => ({ ...n, mebleg: bank.mebleg, gelir: bank.gelir }));
    setMode("bokt");
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const bStops = (bResult as any).stops as string[];
  const hasStops = mode === "bank" && bStops.length > 0 && !bank.emanet;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Kredit Skoring Kalkulyatoru</h1>
          <p className="text-blue-100 text-base">Bank müraciətindən əvvəl kredit şansınızı qiymətləndirin</p>

          <div className="mt-6 inline-flex rounded-2xl bg-white/15 p-1 border border-white/20">
            <button onClick={() => { setMode("bank"); setSubmitted(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${mode === "bank" ? "bg-white text-blue-700 shadow-md" : "text-white/80 hover:text-white"}`}>
              <Landmark size={16} /> Banklar
            </button>
            <button onClick={() => { setMode("bokt"); setSubmitted(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${mode === "bokt" ? "bg-white text-blue-700 shadow-md" : "text-white/80 hover:text-white"}`}>
              <Building2 size={16} /> BOKT
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── FORM ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

            {mode === "bank" ? (
              <>
                {/* Əmanət */}
                <label className="flex items-start gap-3 p-3 rounded-xl border-2 border-blue-100 bg-blue-50 cursor-pointer hover:border-blue-300 transition">
                  <input type="checkbox" checked={bank.emanet} onChange={e => setBank(b => ({ ...b, emanet: e.target.checked }))}
                    className="mt-0.5 accent-blue-600 w-4 h-4" />
                  <span className="text-sm text-blue-800 font-medium">Əmanətim var və onu girov kimi istifadə etmək istəyirəm</span>
                </label>

                {bank.emanet && (
                  <Field label="Əmanət məbləği (AZN)">
                    <input type="number" placeholder="5000" value={bank.emanetMebleg}
                      onChange={e => setBank(b => ({ ...b, emanetMebleg: e.target.value }))} className={inputCls} />
                  </Field>
                )}

                {/* ── Gəlir məlumatları ── */}
                <div>
                  {/* Тип дохода спрашивается РАНЬШЕ типа кредита (гейт доступности) */}
                  <p className={sectionTitle}>Gəlir məlumatları</p>
                  <div className="space-y-4">
                    <Field label="Gəlir növü">
                      <select value={bank.gelirNovu}
                        onChange={e => {
                          const nov = e.target.value as GelirNovu;
                          setBank(b => ({
                            ...b,
                            gelirNovu: nov,
                            // Для неофиц. дохода ипотека/авто недоступны — сброс на наличный
                            kreditNovu: nov === "qeyri_resmi" && (b.kreditNovu === "ipoteka" || b.kreditNovu === "avto") ? "naqd" : b.kreditNovu,
                          }));
                        }} className={selectCls}>
                        <option value="resmi">Rəsmi gəlir</option>
                        <option value="xarici">Xaricdə rəsmi iş (bank çıxarışı ilə)</option>
                        <option value="fs">Fiziki sahibkar (VÖEN)</option>
                        <option value="teqaud">Təqaüd</option>
                        <option value="qeyri_resmi">Qeyri-rəsmi gəlir</option>
                      </select>
                    </Field>

                    <Field label="Aylıq gəlir (net, AZN)" note="Vergi çıxıldıqdan sonra">
                      <input type="number" placeholder="1000" min={0} value={bank.gelir}
                        onChange={e => setBank(b => ({ ...b, gelir: e.target.value }))} className={inputCls} />
                    </Field>

                    {/* Стаж не применяется для пенсионера и неофициального дохода */}
                    {bank.gelirNovu !== "teqaud" && bank.gelirNovu !== "qeyri_resmi" && (
                      <Field label="Cari iş yerində staj" note={bank.gelirNovu === "resmi" ? "Rəsmi gəlir üçün minimum 6 ay tələb olunur" : "Minimum 12 ay tələb olunur"}>
                        <select value={bank.isStaji} onChange={e => setBank(b => ({ ...b, isStaji: e.target.value as IsStaji }))} className={selectCls}>
                          <option value="0_3">0 – 3 ay</option>
                          <option value="4_5">4 – 5 ay</option>
                          <option value="6_12">6 – 12 ay</option>
                          <option value="12_plus">12 aydan çox</option>
                        </select>
                      </Field>
                    )}
                  </div>
                </div>

                {/* ── Kredit parametrləri ── */}
                <div className="border-t border-gray-100 pt-4">
                  <p className={sectionTitle}>Kredit parametrləri</p>
                  <div className="space-y-4">
                    <Field label="Kredit növü"
                      note={bank.gelirNovu === "qeyri_resmi" ? "İpoteka və avtokredit rəsmi gəlir tələb edir" : undefined}>
                      <select value={bank.kreditNovu} onChange={e => setBank(b => ({ ...b, kreditNovu: e.target.value as KreditNovu }))} className={selectCls}>
                        <option value="naqd">Nağd kredit</option>
                        <option value="kart">Kredit kartı</option>
                        <option value="ipoteka" disabled={bank.gelirNovu === "qeyri_resmi"}>
                          İpoteka{bank.gelirNovu === "qeyri_resmi" ? " — rəsmi gəlir tələb edir" : ""}
                        </option>
                        <option value="avto" disabled={bank.gelirNovu === "qeyri_resmi"}>
                          Avtomobil krediti{bank.gelirNovu === "qeyri_resmi" ? " — rəsmi gəlir tələb edir" : ""}
                        </option>
                      </select>
                    </Field>

                    <SliderRow label="Tələb olunan məbləğ" value={parseFloat(bank.mebleg) || 500} min={500}
                      max={bank.kreditNovu === "ipoteka" || bank.kreditNovu === "avto" ? 500000 : 100000} step={500}
                      format={(v) => `₼ ${v.toLocaleString()}`} unit="₼"
                      onChange={(v) => setBank(b => ({ ...b, mebleg: String(v) }))} />

                    <SliderRow label="Kredit müddəti" value={parseInt(bank.muddət) || 24} min={1} max={bank.kreditNovu === "ipoteka" ? 360 : 59} step={1}
                      format={(v) => `${v} ay`} unit="ay"
                      onChange={(v) => setBank(b => ({ ...b, muddət: String(v) }))} />

                    {bank.kreditNovu !== "naqd" && (
                      <SliderRow label="İllik faiz dərəcəsi" value={parseFloat(bank.faiz) || 24} min={0} max={100} step={0.5}
                        format={(v) => `${v}%`} unit="%"
                        onChange={(v) => setBank(b => ({ ...b, faiz: String(v) }))} />
                    )}
                  </div>
                </div>

                {/* ── Şəxsi məlumatlar ── */}
                <div className="border-t border-gray-100 pt-4">
                  <p className={sectionTitle}>Şəxsi məlumatlar</p>
                  <SliderRow label="Yaş" value={parseInt(bank.yas) || 30} min={16} max={75} step={1}
                    format={(v) => `${v} yaş`} unit="yaş"
                    onChange={(v) => setBank(b => ({ ...b, yas: String(v) }))} />
                </div>

                {/* ── Mövcud öhdəliklər ── */}
                <div className="border-t border-gray-100 pt-4">
                  <p className={sectionTitle}>Mövcud öhdəliklər</p>
                  <div className="space-y-4">
                    <Field label="Mövcud aylıq nağd kredit ödənişi (AZN)" note="Aktiv kreditlər üzrə cəmi aylıq ödəniş. Yoxdursa 0 yazın.">
                      <input type="number" placeholder="0" min={0} value={bank.movcudNaqdOdenis}
                        onChange={e => setBank(b => ({ ...b, movcudNaqdOdenis: e.target.value }))} className={inputCls} />
                    </Field>

                    <Field label="Mövcud kredit kartı limiti (AZN)" note="Bütün aktiv kredit kartlarının ümumi limiti. Yoxdursa 0 yazın.">
                      <input type="number" placeholder="0" min={0} value={bank.movcudKartLimit}
                        onChange={e => setBank(b => ({ ...b, movcudKartLimit: e.target.value }))} className={inputCls} />
                    </Field>
                  </div>
                </div>

                {/* ── Kredit tarixçəsi ── */}
                <div className="border-t border-gray-100 pt-4">
                  <p className={sectionTitle}>Kredit tarixçəsi</p>
                  <div className="space-y-4">
                    <Field label="Cari (aktiv) gecikmə (gün)" note="Hazırda gecikmiş ödənişiniz yoxdursa 0 yazın.">
                      <input type="number" placeholder="0" min={0} value={bank.cariGecikmeGun}
                        onChange={e => setBank(b => ({ ...b, cariGecikmeGun: e.target.value }))} className={inputCls} />
                    </Field>

                    <Field label="Son 6 ayda kumulyativ gecikmə (gün)" note="Son 6 ayda bütün gecikmələrin cəmi. Yoxdursa 0 yazın.">
                      <input type="number" placeholder="0" min={0} value={bank.kumulyativ6ay}
                        onChange={e => setBank(b => ({ ...b, kumulyativ6ay: e.target.value }))} className={inputCls} />
                    </Field>

                    <Field label="Son 12 ayda maksimum gecikmə (gün)" note="Son 12 ayda ən uzun tək gecikmə. Yoxdursa 0 yazın.">
                      <input type="number" placeholder="0" min={0} value={bank.maks12ay}
                        onChange={e => setBank(b => ({ ...b, maks12ay: e.target.value }))} className={inputCls} />
                    </Field>

                    <Field label="Bağlanmış kredit təcrübəsi">
                      <select value={bank.baglanmisTecrube} onChange={e => setBank(b => ({ ...b, baglanmisTecrube: e.target.value as BaglanmisTecrube }))} className={selectCls}>
                        <option value="var">Var (vaxtında bağlamışam)</option>
                        <option value="yoxdur">Var, lakin problemli olub</option>
                        <option value="tecrube_yox">Kredit təcrübəm yoxdur</option>
                      </select>
                    </Field>

                  </div>
                </div>
              </>
            ) : (
              <>
                {/* BOKT form */}
                <label className="flex items-start gap-3 p-3 rounded-xl border-2 border-blue-100 bg-blue-50 cursor-pointer hover:border-blue-300 transition">
                  <input type="checkbox" checked={bokt.emanet} onChange={e => setBokt(n => ({ ...n, emanet: e.target.checked }))}
                    className="mt-0.5 accent-blue-600 w-4 h-4" />
                  <span className="text-sm text-blue-800 font-medium">Əmanətim var və onu girov kimi istifadə etmək istəyirəm</span>
                </label>

                {bokt.emanet && (
                  <Field label="Əmanət məbləği (AZN)">
                    <input type="number" placeholder="500" value={bokt.emanetMebleg}
                      onChange={e => setBokt(n => ({ ...n, emanetMebleg: e.target.value }))} className={inputCls} />
                  </Field>
                )}

                <SliderRow label="Tələb olunan məbləğ" value={parseFloat(bokt.mebleg) || 100} min={50} max={1000} step={50}
                  format={(v) => `₼ ${v}`} unit="₼"
                  onChange={(v) => setBokt(n => ({ ...n, mebleg: String(v) }))} />

                <SliderRow label="Aylıq gəlir" value={parseFloat(bokt.gelir) || 300} min={100} max={5000} step={50}
                  format={(v) => `₼ ${v.toLocaleString()}`} unit="₼"
                  onChange={(v) => setBokt(n => ({ ...n, gelir: String(v) }))} />

                <Field label="Kredit tarixçəsi">
                  <select value={bokt.kreditTarixce} onChange={e => setBokt(n => ({ ...n, kreditTarixce: e.target.value as "yox" | "gecikme" }))} className={selectCls}>
                    <option value="yox">Gecikmə yoxdur</option>
                    <option value="gecikme">Gecikmələr var</option>
                  </select>
                </Field>

                {parseFloat(bokt.mebleg) > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm">
                    <p className="font-bold text-amber-800 mb-1">💸 BOKT Xərc Hesablaması</p>
                    <p className="text-amber-700">Maksimum ödəniləcək məbləğ: <strong>{(parseFloat(bokt.mebleg) * 2).toFixed(0)} AZN</strong></p>
                    <p className="text-xs text-amber-600 mt-1">Mərkəzi Bank qaydası: ümumi borcun artımı əsas borcun 100%-ni keçə bilməz</p>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => {
                setPressed(true);
                setTimeout(() => { setPressed(false); setSubmitted(true); }, 350);
              }}
              disabled={pressed}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white text-sm transition-all duration-200 shadow-md
                ${pressed ? "scale-95 shadow-inner brightness-90" : "hover:shadow-lg hover:brightness-110 active:scale-95"}`}
              style={{ background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)" }}
            >
              {pressed ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Hesablanır...
                </>
              ) : (
                <>Hesabla <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>

        {/* ── RESULT ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4 text-center text-sm uppercase tracking-wider">Nəticə</h2>

            {!submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 180 100" className="w-12">
                    <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
                    <line x1="90" y1="90" x2="90" y2="25" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="90" cy="90" r="5" fill="#d1d5db" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400 font-medium">Məlumatları daxil edin<br />və "Hesabla" düyməsinə basın</p>
              </div>
            ) : (
              <>
                {hasStops && (
                  <div className="mb-4 space-y-2">
                    {bStops.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm">
                        <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-red-700">⛔ {s}</p>
                          <p className="text-red-600 text-xs mt-0.5">Banklar bu parametrlərlə kredit verə bilməz.</p>
                        </div>
                      </div>
                    ))}
                    <button onClick={switchToBokt}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition">
                      BOKT-da yoxlamaq istəyirsiniz? <ArrowRight size={14} />
                    </button>
                  </div>
                )}

                {result.warnings.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {result.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-amber-700">⚠️ {w}</p>
                      </div>
                    ))}
                  </div>
                )}

                {result.isEmanet && result.emanetOk && (
                  <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-sm">
                    <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" />
                    <p className="text-green-700 font-medium">Əmanət kimi istifadə etdikdə təsdiqlənmə ehtimalı çox yüksəkdir.</p>
                  </div>
                )}

                <div className="mb-2">
                  <Gauge score={hasStops ? 0 : result.score} />
                </div>

                {!hasStops && (
                  <div className={`mt-3 p-3 rounded-xl border text-sm font-medium text-center ${scoreLabel(result.score, mode).bg} ${scoreLabel(result.score, mode).color}`}>
                    {scoreLabel(result.score, mode).icon} {scoreLabel(result.score, mode).text}
                  </div>
                )}

                {mode === "bank" && bResult.bgn < 999 && !bank.emanet && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <BgnBar bgn={bResult.bgn} />
                    {bResult.yeniOdenis > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Yeni aylıq ödəniş: <strong className="text-gray-700">{bResult.yeniOdenis.toFixed(0)} AZN</strong>
                        {bResult.estimatedRate != null ? (
                          <span className="text-gray-400"> ({bResult.estimatedRate.toFixed(1)}% illik — təxmini)</span>
                        ) : (
                          <span className="text-gray-400"> ({bank.faiz}% illik ilə)</span>
                        )}
                      </p>
                    )}
                    {bResult.commission && bResult.commission.amount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Birdəfəlik komissiya: <strong className="text-gray-700">{bResult.commission.amount.toLocaleString()} AZN</strong>
                        <span className="text-gray-400"> ({bResult.commission.pct}% — aylıq ödənişə daxil deyil, ümumi dəyərə əlavə olunur)</span>
                      </p>
                    )}
                    {bResult.estimatedRate != null && (
                      <div className="mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 space-y-1">
                        <p className="font-semibold">Navio tərəfindən hesablanan təxmini faiz: {bResult.estimatedRate.toFixed(1)}%</p>
                        <p className="text-indigo-500">İlkin hesablama. İctimai təklif deyil. Faiz fərdi hesablanır.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bal bölgüsü — внутренняя механика скоринга, клиенту не показываем */}

                {/* Разбор кейса — почему такой балл и как улучшить */}
                {mode === "bank" && !hasStops && !bank.emanet && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kredit şansını artır — nəticənin izahı</p>
                    <div className="space-y-2">
                      {explainResult(bank, bResult).map((it) => (
                        <div key={it.title} className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                          <ArrowRight size={13} className="text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-blue-800">{it.title}</p>
                            <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">{it.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-start gap-2 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700">
            <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
            <p>Bu nəticə ilkin qiymətləndirmədir. Yekun qərarı bank/BOKT verir. Navio heç bir kredit vermir.</p>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function KreditYoxlamaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <KreditYoxlamaContent />
    </Suspense>
  );
}
