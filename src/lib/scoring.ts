/* Скоринг Navio v3 FINAL — единственный источник логики расчёта.
   Спецификация закрыта; правки только по реальным данным пользователей. */
import { formatNumber } from "@/lib/utils";

/* ─── Types ─── */
export type Mode = "bank" | "bokt";
export type GelirNovu = "resmi" | "xarici" | "fs" | "teqaud" | "qeyri_resmi";
export type KreditNovu = "naqd" | "kart" | "ipoteka" | "avto";
export type IsStaji = "0_3" | "4_5" | "6_12" | "12_plus";
export type BaglanmisTecrube = "var" | "yoxdur" | "tecrube_yox";

export interface BankForm {
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

export interface BoktForm {
  mebleg: string;
  gelir: string;
  kreditTarixce: "yox" | "gecikme";
  emanet: boolean;
  emanetMebleg: string;
}

/* ─── Scoring config — значения обновляются со временем (ежегодно) ─── */
export const CONFIG = {
  subsistenceMinWorking: 317,    // прожиточный минимум, трудоспособные (2026)
  subsistenceMinPensioner: 245,  // прожиточный минимум, пенсионеры (2026)
  unofficialIncomeAvg: 600,      // оценка неофициального дохода (v2)
  cardStressMonths: 24,          // срок для стресс-платежа по кредитке
  cardStressRate: 26,            // % годовых для стресс-платежа по кредитке
  // Ставки наличного кредита
  cashRateUnofficial: 35,        // плоская ставка, НЕОФИЦИАЛЬНЫЙ наличный, всегда
  // Официальный наличный (v3.1): таблица по сроку × 2 уровня BGN (<45% / ≥45%), НЕ формула с надбавками
  cashRateOfficialTable: {
    lowRisk:  { m12: 11, m24: 13, m36: 15, m48: 16, m59: 17 },  // BGN < 45%
    highRisk: { m12: 21, m24: 23, m36: 23, m48: 24, m59: 25 },  // BGN >= 45%
  },
  // Разовые комиссии (%) — матрица доход × тип кредита; null = тип кредита недоступен
  // Наличный официальный (v3.1): зависит от BGN — задаётся отдельно в cashCommissionOfficial
  commissions: {
    official:   { cash: null, card: 0, mortgage: 0.5, auto: 0.5 }, // cash считается через cashCommissionOfficial
    unofficial: { cash: 3, card: 3, mortgage: null, auto: null },
  } as Record<"official" | "unofficial", Record<"cash" | "card" | "mortgage" | "auto", number | null>>,
  cashCommissionOfficial: { lowRisk: 1, highRisk: 2 }, // % от суммы, наличный офиц., по BGN <45 / ≥45
  // Пороги BGN (ступени баллов, капов и hard stop)
  bgnHardStopPct: 70,
  bgnTierMidPct: 45,             // граница «хорошо/средне»
  bgnTierHighPct: 60,            // граница «средне/плохо»
  // Капы по сумме, официальный доход
  amountCap79Above: 30000,       // 30–40k → кап 79
  amountCap59Above: 40000,       // >40k → кап 59
  maxTermMonths: 59,             // максимальный срок (кроме ипотеки)
  maxAgeAtEnd: 73,               // макс. возраст на конец срока
  maxCardLineToIncomeRatio: 5,   // лимит по кредитным линиям: 5× дохода
};

/* ─── Annuity: единая реализация в lib/calculators/annuity ─── */
import { calcAnnuityPayment } from "./calculators/annuity";
export const annuityPayment = (principal: number, months: number, annualRate: number) =>
  calcAnnuityPayment(principal, annualRate, months);

/* ─── Доход для скоринга: неофициальный доход зажимается потолком ─── */
export function incomeForScoring(type: GelirNovu, entered: number): number {
  if (type === "qeyri_resmi") return Math.min(entered, CONFIG.unofficialIncomeAvg);
  return entered;
}

/* ─── Прожиточный минимум по типу дохода ─── */
export function subsistenceMin(type: GelirNovu): number {
  return type === "teqaud" ? CONFIG.subsistenceMinPensioner : CONFIG.subsistenceMinWorking;
}

/* ─── Разовая комиссия от суммы кредита — матрица доход × тип, НЕ входит в месячный платёж ───
   null = тип кредита недоступен для этого дохода (гейт срабатывает раньше расчёта).
   Наличный официальный (v3.1): зависит от BGN — bgn передаётся отдельно, только формальный BGN,
   без эффекта остатка (по умолчанию не применяется к комиссии). */
export function calcCommission(kreditNovu: KreditNovu, gelirNovu: GelirNovu, amount: number, bgn: number = 0) {
  const isUnofficial = gelirNovu === "qeyri_resmi";
  if (!isUnofficial && kreditNovu === "naqd") {
    const pct = bgn >= CONFIG.bgnTierMidPct ? CONFIG.cashCommissionOfficial.highRisk : CONFIG.cashCommissionOfficial.lowRisk;
    return { pct, amount: Math.round((pct / 100) * amount), unavailable: false };
  }
  const row = CONFIG.commissions[isUnofficial ? "unofficial" : "official"];
  const key = kreditNovu === "naqd" ? "cash" : kreditNovu === "kart" ? "card" : kreditNovu === "ipoteka" ? "mortgage" : "auto";
  const pct = row[key];
  if (pct === null) return { pct: 0, amount: 0, unavailable: true };
  return { pct, amount: Math.round((pct / 100) * amount), unavailable: false };
}

/* ─── Ставка наличного кредита по сегментам (v3.1) ───
   Неофициальный доход → плоские 35%.
   Официальный → ТАБЛИЦА (не формула): срок × 2 уровня BGN (<45% / ≥45%).
   Эффект остатка: если денег на руках < прожминимума — использовать строку «≥45%»,
   даже если формальный BGN < 45% (только для СТАВКИ, не для комиссии). */
export function estimateCashRate(incomeType: GelirNovu, bgn: number, termMonths: number, residual: number): number {
  if (incomeType === "qeyri_resmi") return CONFIG.cashRateUnofficial; // 35, плоская

  const effectiveHighRisk = bgn >= CONFIG.bgnTierMidPct || residual < subsistenceMin(incomeType);
  const t = effectiveHighRisk ? CONFIG.cashRateOfficialTable.highRisk : CONFIG.cashRateOfficialTable.lowRisk;

  if (termMonths <= 12) return t.m12;
  if (termMonths <= 24) return t.m24;
  if (termMonths <= 36) return t.m36;
  if (termMonths <= 48) return t.m48;
  return t.m59;
}

/* ─── Bank scoring ─── */
export function calcBankScore(f: BankForm) {
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
      commission: calcCommission(f.kreditNovu, f.gelirNovu, mebleg), blocks: null, isEmanet: false, emanetOk: false,
    };
  }

  // Наличный кредит → сегментная ставка (неофиц. 35% плоско / офиц. — таблица по сроку×BGN).
  // Карта/ипотека/авто — ставка вводится пользователем вручную.
  const useCashRate = f.kreditNovu === "naqd" && !f.emanet;

  if (useCashRate) {
    // Платёж/BGN/остаток зависят от ставки, а ставка — от BGN/остатка → два прохода.
    const calc = (rate: number) => {
      const pmt = annuityPayment(mebleg, muddət, rate);
      const total = movcudNaqdOdenis + kartAyliOdenis + pmt;
      return { pmt, bgn: income > 0 ? (total / income) * 100 : 999, rem: income - total };
    };
    // Проход 1 — при нижней ставке таблицы (lowRisk, 12мес) определяем BGN и остаток
    const p1 = calc(CONFIG.cashRateOfficialTable.lowRisk.m12);
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

  // Разовая комиссия от суммы кредита (наличный официальный — зависит от BGN, v3.1)
  const commission = calcCommission(f.kreditNovu, f.gelirNovu, mebleg, bgn);

  const ageAtEnd = yas + Math.ceil(muddət / 12);

  const stops: string[] = [];
  const warnings: string[] = [];

  if (!f.emanet) {
    // 1) Возраст < 18 — закон
    if (yas > 0 && yas < 18) stops.push("Yaşınız 18-dən azdır — qanunvericiliyə görə kredit verilə bilməz");
    // 2) Возраст на конец срока > лимит
    if (ageAtEnd > CONFIG.maxAgeAtEnd) stops.push(`Müddətin sonunda yaşınız ${ageAtEnd} olacaq — limit ${CONFIG.maxAgeAtEnd}-dür`);
    // 3) BGN > 70% — долговая нагрузка
    if (bgn > CONFIG.bgnHardStopPct) stops.push(`BGN ${bgn.toFixed(1)}% — borc yükü 70%-dən yüksəkdir`);
    // 4) Срок > лимит (кроме ипотеки)
    if (f.kreditNovu !== "ipoteka" && muddət > CONFIG.maxTermMonths) stops.push(`${f.kreditNovu === "naqd" ? "Nağd kredit" : f.kreditNovu === "kart" ? "Kredit kartı" : "Avtokredit"} müddəti ${CONFIG.maxTermMonths} aydan çox ola bilməz`);
    // 5) Kredit kartı: новый + существующие лимиты > 5× дохода — закон о кредитных линиях
    if (f.kreditNovu === "kart" && income > 0 && (mebleg + movcudKartLimit) > income * CONFIG.maxCardLineToIncomeRatio) stops.push(`Ümumi kredit xətti limiti (₼ ${formatNumber(mebleg + movcudKartLimit)}) gəlirin ${CONFIG.maxCardLineToIncomeRatio} mislini (₼ ${formatNumber(income * CONFIG.maxCardLineToIncomeRatio)}) keçir — yeni limit mövcud limitlərlə birlikdə aylıq gəlirin ${CONFIG.maxCardLineToIncomeRatio} mislindən çox ola bilməz`);
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
  const bBgn = bgn <= CONFIG.bgnTierMidPct ? 35 : bgn <= CONFIG.bgnTierHighPct ? 15 : 5;

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
  if (bgn > CONFIG.bgnTierMidPct && bgn <= CONFIG.bgnTierHighPct) caps.push(79);
  else if (bgn > CONFIG.bgnTierHighPct && bgn <= CONFIG.bgnHardStopPct) caps.push(59);
  if (cariGecikmeGun >= 6 && cariGecikmeGun <= 15) caps.push(79);
  else if (cariGecikmeGun > 15) caps.push(59);
  if (kumulyativ6ay >= 90) caps.push(69);
  if (maks12ay >= 120) caps.push(69);
  // Неофициальный доход: потолок доверия. Малая сумма/короткий срок → не выше 79;
  // всё что больше → не выше 59 (высокий шанс не даём вообще).
  if (unofficial) caps.push(mebleg <= 1000 && muddət <= 36 ? 79 : 59);
  // Официальный доход: крупная сумма необеспеченным наличным на практике почти не выдаётся —
  // даже при отличном профиле высокий шанс не даём.
  else if (mebleg > CONFIG.amountCap59Above) caps.push(59);
  else if (mebleg > CONFIG.amountCap79Above) caps.push(79);

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
export function calcBoktScore(f: BoktForm) {
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
export function explainResult(f: BankForm, r: { bgn: number }) {
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
