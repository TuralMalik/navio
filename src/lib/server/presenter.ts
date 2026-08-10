/* Презентация результата: превращает внутренний результат скоринга в публичный payload.
   SERVER-ONLY — здесь живут пороги тиров (80/65/45), которые раньше считались в браузере. */
import "server-only";
import type { BankForm, BoktForm, Mode } from "@/lib/scoring-types";
import type { PublicScoreResult, Tone } from "@/lib/score-contract";
import { calcBankScore, calcBoktScore, explainResult, CONFIG } from "./scoring";

/* Пороги тиров — внутренние. Клиент получает только готовый текст и тон. */
function scoreLabel(score: number, mode: Mode): { text: string; icon: string; tone: Tone } {
  if (mode === "bank") {
    if (score >= 80) return { text: "Yüksək şans — Bankların əksəriyyəti təsdiqləyə bilər", icon: "🟢", tone: "good" };
    if (score >= 65) return { text: "Yaxşı şans — Bir çox bank təsdiqləyə bilər", icon: "🟢", tone: "normal" };
    if (score >= 45) return { text: "Orta şans — Şansınız var, bankdan asılıdır", icon: "🟡", tone: "attention" };
    return { text: "Aşağı şans — Profili yaxşılaşdırmaq tövsiyə olunur", icon: "🟠", tone: "risk" };
  }
  if (score >= 80) return { text: "BOKT-dan kredit ala bilərsiniz", icon: "🟢", tone: "good" };
  if (score >= 40) return { text: "Bəzi BOKT-lar təklif edə bilər", icon: "🟡", tone: "attention" };
  return { text: "BOKT-dan da çətin olacaq", icon: "🔴", tone: "high" };
}

/** Сколько предупреждений показываем в инлайн-панели; остальные — в «Ətraflı analiz». */
const INLINE_WARNING_LIMIT = 2;

export function presentBankResult(form: BankForm, calculationId: string): PublicScoreResult {
  const r = calcBankScore(form);
  const blocked = r.stops.length > 0;
  const manualRate = r.estimatedRate == null ? parseFloat(form.faiz) || 24 : null;

  return {
    calculationId,
    mode: "bank",
    score: r.score,
    blocked,
    stops: r.stops,
    warnings: r.warnings.slice(0, INLINE_WARNING_LIMIT),
    extraWarningCount: Math.max(0, r.warnings.length - INLINE_WARNING_LIMIT),
    label: blocked ? null : scoreLabel(r.score, "bank"),
    // 999 — внутренний признак «доход не введён»; наружу отдаём null
    bgn: r.bgn >= 999 ? null : r.bgn,
    bgnLimit: CONFIG.bgnHardStopPct,
    yeniOdenis: r.yeniOdenis,
    estimatedRate: r.estimatedRate,
    manualRate,
    commission:
      r.commission && !r.commission.unavailable && r.commission.amount > 0
        ? { pct: r.commission.pct, amount: r.commission.amount }
        : null,
    topRecommendation: blocked ? null : explainResult(form, r)[0] ?? null,
    boktMaxOdenis: null,
  };
}

export function presentBoktResult(form: BoktForm, calculationId: string): PublicScoreResult {
  const r = calcBoktScore(form);

  return {
    calculationId,
    mode: "bokt",
    score: r.score,
    blocked: false,
    stops: r.stops,
    warnings: r.warnings.slice(0, INLINE_WARNING_LIMIT),
    extraWarningCount: Math.max(0, r.warnings.length - INLINE_WARNING_LIMIT),
    label: scoreLabel(r.score, "bokt"),
    bgn: null,
    bgnLimit: CONFIG.bgnHardStopPct,
    yeniOdenis: 0,
    estimatedRate: null,
    manualRate: null,
    commission: null,
    topRecommendation: null,
    boktMaxOdenis: r.maxOdenis,
  };
}
