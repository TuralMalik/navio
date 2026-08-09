/* Детальный отчёт /analiz — построение на сервере.
   SERVER-ONLY. Раньше эта логика жила в браузере и раскрывала реальные пороги
   (45/60/70, 120 дней, 20000/30000 и т.д.). Теперь клиент получает готовые
   уровни и тексты, а сами пороги не покидают сервер. */
import "server-only";
import type { BankForm } from "@/lib/scoring-types";
import type {
  UnlockedAnalysis, LockedAnalysis, Tone, PublicLevel, Factor, Recommendation, BgnAnalysis, Simulation,
} from "@/lib/score-contract";
import { formatNumber } from "@/lib/utils";
import {
  calcBankScore, annuityPayment, incomeForScoring, subsistenceMin, CONFIG,
} from "./scoring";

/* ─── Общий статус результата (5 статусов) ─── */
function overall(r: ReturnType<typeof calcBankScore>) {
  if (r.stops.length > 0)
    return { label: "Uyğun deyil", tone: "high" as Tone, note: "Bir və ya bir neçə göstərici üzrə tətbiq olunan limit və ya minimum tələb qarşılanmır." };
  if (r.score >= 80)
    return { label: "Yüksək nəticə", tone: "good" as Tone, note: "Göstəriciləriniz kredit müraciəti üçün müsbət görünür." };
  if (r.score >= 65)
    return { label: "Yaxşı nəticə", tone: "normal" as Tone, note: "Göstəriciləriniz əsasən uyğundur, amma bəzi məqamlar nəticəyə təsir edə bilər." };
  if (r.score >= 45)
    return { label: "Orta nəticə", tone: "attention" as Tone, note: "Nəticəniz orta səviyyədədir. Bəzi faktorlar kredit profilinizi zəiflədir." };
  return { label: "Aşağı nəticə", tone: "risk" as Tone, note: "Bir neçə faktor kredit müraciətini çətinləşdirə bilər." };
}

const LEVEL_TONE: Record<PublicLevel, Tone> = {
  "Yüksək": "good",
  "Orta": "attention",
  "Aşağı": "risk",
  "Məhdudiyyət var": "high",
};

const RATE_CHIPS = [12, 16, 20, 24];

/** Разделы, закрытые для незалогиненных — показываем названия в CTA. */
export const LOCKED_SECTIONS = [
  "Əsas məhdudiyyətlər",
  "Borc yükü analizi",
  "Nəticəyə təsir edən amillər",
  "Risk faktorları",
  "Kredit profilinizi yaxşılaşdırmaq üçün addımlar",
  "Faiz simulyasiyası",
];

/* Общие для обоих payload'ов величины (балл, итог, метрики) — они бесплатные. */
function baseParts(f: BankForm) {
  const r = calcBankScore(f);
  const blocked = r.stops.length > 0;
  const num = (s: string) => Math.max(0, parseFloat(s) || 0);
  const income = incomeForScoring(f.gelirNovu, num(f.gelir));
  const hasIncome = income > 0;

  const metrics = [
    { label: "BGN", value: blocked || !hasIncome ? "—" : `${r.bgn.toFixed(1)}%` },
    { label: "Aylıq ödəniş", value: blocked || r.yeniOdenis <= 0 ? "—" : `${formatNumber(Math.round(r.yeniOdenis))} ₼` },
    {
      label: "Təxmini faiz",
      value: blocked ? "—" : r.estimatedRate != null ? `${r.estimatedRate.toFixed(1)}%` : `${parseFloat(f.faiz) || 24}%`,
    },
  ];

  return { r, blocked, num, income, hasIncome, metrics, overall: overall(r) };
}

/** Урезанный отчёт для незалогиненных. */
export function buildLockedAnalysis(f: BankForm, calculationId: string, createdAt: string): LockedAnalysis {
  const { r, metrics, overall: o } = baseParts(f);
  return {
    locked: true,
    calculationId,
    createdAt,
    score: r.score,
    overall: o,
    stops: r.stops,
    metrics,
    lockedSections: LOCKED_SECTIONS,
  };
}

/** Полный отчёт. simRate — выбранный чип симуляции ставки. */
export function buildAnalysis(
  f: BankForm,
  calculationId: string,
  createdAt: string,
  simRate?: number,
): UnlockedAnalysis {
  const { r, blocked, num, income, hasIncome, metrics, overall: o } = baseParts(f);

  const mebleg = num(f.mebleg);
  const muddet = Math.max(0, parseInt(f.muddət) || 0);
  const yas = Math.max(0, parseInt(f.yas) || 0);
  const cari = Math.max(0, parseInt(f.cariGecikmeGun) || 0);
  const maks = Math.max(0, parseInt(f.maks12ay) || 0);
  const kartStress = annuityPayment(num(f.movcudKartLimit), CONFIG.cardStressMonths, CONFIG.cardStressRate);
  const currentBgn = hasIncome ? ((num(f.movcudNaqdOdenis) + kartStress) / income) * 100 : 0;
  const afterBgn = r.bgn;
  const ageAtEnd = yas + Math.ceil(muddet / 12);
  const limit = CONFIG.bgnHardStopPct;
  const unofficial = f.gelirNovu === "qeyri_resmi";
  const stajOk =
    (f.gelirNovu === "resmi" && (f.isStaji === "6_11" || f.isStaji === "12_plus")) ||
    ((f.gelirNovu === "fs" || f.gelirNovu === "xarici") && f.isStaji === "12_plus");

  /* ─── 1. Əsas məhdudiyyətlər ─── */
  const checks: UnlockedAnalysis["checks"] = [
    { label: "Yaş tələbi", status: yas >= 18 && ageAtEnd <= CONFIG.maxAgeAtEnd ? "ok" : "fail" },
    { label: "Borc yükü limiti", status: hasIncome && afterBgn <= limit ? "ok" : "fail" },
    {
      label: "Cari iş yerində staj",
      status: f.gelirNovu === "teqaud" || unofficial ? "na" : stajOk ? "ok" : "fail",
    },
    {
      label: "Kredit xətti limiti",
      status:
        f.kreditNovu !== "kart"
          ? "na"
          : hasIncome && mebleg + num(f.movcudKartLimit) <= income * CONFIG.maxCardLineToIncomeRatio
            ? "ok"
            : "fail",
    },
  ];

  /* ─── 2. Borc yükü analizi ─── */
  const bgnZone: Tone =
    afterBgn > limit ? "high"
    : afterBgn > CONFIG.bgnTierHighPct ? "risk"
    : afterBgn > CONFIG.bgnTierMidPct ? "attention"
    : "good";

  const bgn: BgnAnalysis | null = hasIncome
    ? {
        current: currentBgn,
        after: afterBgn,
        limit,
        payment: r.yeniOdenis,
        remaining: r.remaining,
        rate: r.estimatedRate != null ? r.estimatedRate : parseFloat(f.faiz) || 24,
        zone: bgnZone,
        text:
          afterBgn > limit
            ? "Yeni kreditdən sonra borc yükünüz 70% limitini keçir. Bu halda bank müraciəti yüksək riskli hesab edə bilər."
            : "Yeni kreditdən sonra borc yükünüz yüksəlir. Bu göstərici bankın qiymətləndirməsində əsas risk faktorlarından biridir.",
      }
    : null;

  /* ─── 3. Nəticəyə təsir edən amillər ─── */
  const mk = (key: Factor["key"], label: string, level: PublicLevel, text: string): Factor =>
    ({ key, label, level, tone: LEVEL_TONE[level], text });

  const factors: Factor[] = [];

  factors.push(
    afterBgn > limit
      ? mk("borc-yuku", "Borc yükü", "Məhdudiyyət var", "Yeni kreditdən sonra borc yükünüz tətbiq olunan həddi keçir. Bu halda nəticə uyğun deyil kimi qiymətləndirilir.")
      : afterBgn > CONFIG.bgnTierHighPct
        ? mk("borc-yuku", "Borc yükü", "Aşağı", `Borc yükünüz yüksəkdir və kredit alma ehtimalına mənfi təsir edə bilər (${afterBgn.toFixed(1)}%).`)
        : afterBgn > CONFIG.bgnTierMidPct
          ? mk("borc-yuku", "Borc yükü", "Orta", "Borc yükünüz orta səviyyədədir və əlavə diqqət tələb edə bilər.")
          : mk("borc-yuku", "Borc yükü", "Yüksək", "Borc yükünüz kredit profili üçün müsbət göstəricidir."),
  );

  factors.push(
    cari === 0
      ? mk("cari-gecikme", "Cari gecikmə", "Yüksək", "Aktiv gecikmə yoxdur. Bu, kredit tarixçəniz üçün müsbət göstəricidir.")
      : cari <= 5
        ? mk("cari-gecikme", "Cari gecikmə", "Orta", "Kiçik gecikmə var. Bu, nəticəyə müəyyən təsir göstərə bilər.")
        : mk("cari-gecikme", "Cari gecikmə", "Aşağı", `Aktiv gecikmə kredit profilinizə mənfi təsir edir (${cari} gün).`),
  );

  factors.push(
    maks >= 120
      ? mk("maks-gecikme", "Son 12 ayda maksimum gecikmə", "Aşağı", "Son 12 ayda gecikmə epizodu olub. Zamanla bunun təsiri azalır.")
      : mk("maks-gecikme", "Son 12 ayda maksimum gecikmə", "Yüksək", "Son 12 ayda ciddi gecikmə görünmür."),
  );

  if (f.gelirNovu === "teqaud") {
    factors.push(mk("gelir", "Gəlir növü", "Yüksək", "Təqaüd sabit gəlir mənbəyi kimi qiymətləndirilir."));
  } else if (unofficial) {
    factors.push(mk("gelir", "Gəlir növü", "Orta", "Qeyri-rəsmi gəlir mənbəyi kredit qiymətləndirməsində əlavə diqqətlə nəzərdən keçirilir."));
  } else {
    factors.push(
      stajOk
        ? mk("gelir", "Gəlirin etibarlılığı", "Yüksək", "Gəlir mənbəyiniz və staj göstəriciniz kredit profili üçün müsbət göstəricidir.")
        : mk("gelir", "Gəlirin etibarlılığı", "Aşağı", "İş stajınız minimum tələbi qarşılamır. Bu, nəticəyə mənfi təsir edə bilər."),
    );
  }

  if (unofficial) {
    factors.push(
      muddet <= 36
        ? mk("muddet", "Müddət", "Yüksək", "Kredit müddəti aylıq ödəniş və ümumi risk baxımından münasib görünür.")
        : mk("muddet", "Müddət", "Aşağı", "Uzun kredit müddəti ümumi faiz xərcini və risk qiymətləndirməsini artıra bilər."),
    );
  } else {
    factors.push(
      muddet > CONFIG.maxTermMonths && f.kreditNovu !== "ipoteka"
        ? mk("muddet", "Müddət", "Məhdudiyyət var", "Seçilmiş müddət bu kredit növü üçün tətbiq olunan maksimum həddi keçir.")
        : muddet > 48
          ? mk("muddet", "Müddət", "Aşağı", "Uzun kredit müddəti ümumi faiz xərcini və risk qiymətləndirməsini artıra bilər.")
          : muddet > 36
            ? mk("muddet", "Müddət", "Orta", "Kredit müddəti orta səviyyədədir və ümumi faiz xərcinə təsir edə bilər.")
            : mk("muddet", "Müddət", "Yüksək", "Kredit müddəti aylıq ödəniş və ümumi risk baxımından münasib görünür."),
    );
  }

  if (unofficial) {
    factors.push(
      mebleg <= 1000
        ? mk("mebleg", "Məbləğ", "Yüksək", "Seçilmiş məbləğ kredit profili baxımından münasib görünür.")
        : mebleg <= 1500
          ? mk("mebleg", "Məbləğ", "Orta", "Seçilmiş məbləğ orta səviyyədədir və əlavə qiymətləndirmə tələb edə bilər.")
          : mk("mebleg", "Məbləğ", "Aşağı", "Seçilmiş məbləğ yüksəkdir və kredit alma ehtimalına mənfi təsir edə bilər."),
    );
  } else {
    factors.push(
      mebleg <= 20000
        ? mk("mebleg", "Məbləğ", "Yüksək", "Seçilmiş məbləğ kredit profili baxımından münasib görünür.")
        : mebleg <= CONFIG.amountCap79Above
          ? mk("mebleg", "Məbləğ", "Orta", "Seçilmiş məbləğ orta səviyyədədir və əlavə qiymətləndirmə tələb edə bilər.")
          : mk("mebleg", "Məbləğ", "Aşağı", "Seçilmiş məbləğ yüksəkdir və kredit alma ehtimalına mənfi təsir edə bilər."),
    );
  }

  if (yas > 0 && yas < 18) {
    factors.push(mk("yas", "Yaş", "Məhdudiyyət var", "Minimum yaş tələbi qarşılanmır."));
  } else if (ageAtEnd > CONFIG.maxAgeAtEnd) {
    factors.push(mk("yas", "Yaş", "Məhdudiyyət var", "Kreditin bitmə tarixi üçün maksimum yaş həddi keçir."));
  }

  if (f.kreditNovu === "kart" && hasIncome && mebleg + num(f.movcudKartLimit) > income * CONFIG.maxCardLineToIncomeRatio) {
    factors.push(mk("kredit-xetti", "Kredit xətti limiti", "Məhdudiyyət var", "Ümumi kredit xətti limiti icazə verilən həddi keçir."));
  }

  /* ─── 4. Risk faktorları ─── */
  const highRiskPayment =
    hasIncome && (afterBgn > CONFIG.bgnTierMidPct || (r.remaining != null && r.remaining < subsistenceMin(f.gelirNovu)));
  const risks: string[] = [];
  if (afterBgn > limit) risks.push("Borc yükü 70%-dən yüksəkdir");
  else if (afterBgn > CONFIG.bgnTierMidPct) risks.push("Borc yükü yüksək səviyyədədir");
  if (cari > 0) risks.push(`Cari gecikmə var (${cari} gün)`);
  if (maks >= 30) risks.push("Son 12 ayda gecikmə müşahidə olunub");
  if (highRiskPayment) risks.push("Yeni aylıq ödəniş gəlirinizə görə yüksəkdir");
  if (muddet > 48) risks.push("Kredit müddəti uzun olduğuna görə ümumi xərc arta bilər");
  if (unofficial) risks.push("Gəlirin rəsmi təsdiqi yoxdur");
  if (ageAtEnd > CONFIG.maxAgeAtEnd) risks.push(`Müddətin sonunda yaşınız ${ageAtEnd} olur — limitdən yuxarıdır`);

  /* ─── 5. Tövsiyələr (макс 3, приоритет: ограничение → низкий → средний) ─── */
  type Rec = Recommendation & { priority: number };
  const recsAll: Rec[] = [];

  if (afterBgn > limit || mebleg > CONFIG.amountCap59Above)
    recsAll.push({ priority: 0, key: "mebleg-azalt", title: "Kredit məbləğini azaldın", text: "Daha aşağı məbləğ aylıq ödənişi və borc yükünü azalda bilər." });
  else if (afterBgn > CONFIG.bgnTierHighPct || mebleg > CONFIG.amountCap79Above)
    recsAll.push({ priority: 1, key: "mebleg-azalt", title: "Kredit məbləğini azaldın", text: "Daha aşağı məbləğ aylıq ödənişi və borc yükünü azalda bilər." });
  else if (afterBgn > CONFIG.bgnTierMidPct)
    recsAll.push({ priority: 2, key: "mebleg-azalt", title: "Kredit məbləğini azaldın", text: "Daha aşağı məbləğ aylıq ödənişi və borc yükünü azalda bilər." });

  if (num(f.movcudNaqdOdenis) > 0 || num(f.movcudKartLimit) > 0)
    recsAll.push({ priority: afterBgn > CONFIG.bgnTierMidPct ? 1 : 2, key: "ohdelik-azalt", title: "Mövcud öhdəlikləri azaldın", text: "Cari kredit ödənişlərinin azalması yeni kredit üçün profilinizi yaxşılaşdıra bilər." });

  if (cari > 0) {
    recsAll.push({ priority: cari > 5 ? 1 : 2, key: "gecikme-bagla", title: "Cari gecikməni bağlayın", text: "Aktiv gecikmə kredit profilinizə mənfi təsir edir." });
    recsAll.push({ priority: cari > 5 ? 1 : 2, key: "muraciet-gozle", title: "Müraciəti gecikmədən sonra edin", text: "Aktiv gecikmə bağlandıqdan sonra nəticəniz daha yaxşı görünə bilər." });
  }

  if (muddet > CONFIG.maxTermMonths && f.kreditNovu !== "ipoteka")
    recsAll.push({ priority: 0, key: "muddet-qisalt", title: "Müddəti qısaldın", text: "Seçilmiş müddət tətbiq olunan maksimum həddi keçir." });
  else if (!unofficial && muddet > 48)
    recsAll.push({ priority: 1, key: "muddet-yoxla", title: "Müddəti yenidən yoxlayın", text: "Müddəti azaltmaq risk qiymətləndirməsini yaxşılaşdıra bilər." });
  else if (muddet > 36)
    recsAll.push({ priority: 2, key: "muddet-yoxla", title: "Müddəti yenidən yoxlayın", text: "Müddəti artırmaq aylıq ödənişi azalda bilər, amma ümumi faiz xərcini artıra bilər." });

  if (unofficial)
    recsAll.push({ priority: 2, key: "gelir-resmilesdir", title: "Gəliri rəsmiləşdirin", text: "Rəsmi gəlir təsdiqi (əmək müqaviləsi / VÖEN) profilinizi əhəmiyyətli gücləndirir." });
  else if ((f.gelirNovu === "resmi" || f.gelirNovu === "fs" || f.gelirNovu === "xarici") && !stajOk)
    recsAll.push({ priority: 1, key: "staj-artir", title: "İş stajını artırın", text: "Cari iş yerində daha uzun staj kredit profilinizi gücləndirir." });

  const recommendations: Recommendation[] = recsAll
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
    .map(({ key, title, text }) => ({ key, title, text }));

  if (recommendations.length === 0)
    recommendations.push({ key: "profil-yaxsi", title: "Profiliniz yaxşı vəziyyətdədir", text: "Ödənişləri vaxtında etməyə davam edin — bu, kredit profilinizi güclü saxlayır." });

  /* ─── 6. Faiz simulyasiyası ─── */
  let simulation: Simulation | null = null;
  if (hasIncome && mebleg > 0 && muddet > 0) {
    const baseRate = r.estimatedRate != null ? r.estimatedRate : parseFloat(f.faiz) || 24;
    const defaultChip = RATE_CHIPS.reduce((a, b) => (Math.abs(b - baseRate) < Math.abs(a - baseRate) ? b : a), RATE_CHIPS[0]);
    // Принимаем только значения из списка чипов — иначе ставку можно перебирать и картировать пороги
    const rate = simRate != null && RATE_CHIPS.includes(simRate) ? simRate : defaultChip;
    const simPayment = annuityPayment(mebleg, muddet, rate);
    const simBgn = ((num(f.movcudNaqdOdenis) + kartStress + simPayment) / income) * 100;
    const simTone: Tone =
      simBgn > limit ? "high"
      : simBgn > CONFIG.bgnTierHighPct ? "risk"
      : simBgn > CONFIG.bgnTierMidPct ? "attention"
      : "good";
    const simStatus =
      simBgn > limit ? "Uyğun deyil"
      : simBgn > CONFIG.bgnTierHighPct ? "Aşağı"
      : simBgn > CONFIG.bgnTierMidPct ? "Orta"
      : "Yüksək";
    simulation = { chips: RATE_CHIPS, rate, payment: simPayment, bgn: simBgn, status: simStatus, tone: simTone };
  }

  return {
    locked: false,
    calculationId,
    createdAt,
    score: r.score,
    overall: o,
    stops: r.stops,
    metrics,
    checks,
    bgn,
    factors,
    hasRestriction: factors.some((x) => x.level === "Məhdudiyyət var"),
    risks,
    recommendations,
    simulation: blocked ? null : simulation,
  };
}
