/* Контракт между сервером и клиентом.
   ТОЛЬКО типы и уже готовые к показу значения/тексты. Ни одного порога:
   всё, что решает «какой уровень», считается на сервере и приходит сюда
   как готовая строка/тон. Файл безопасно импортировать из клиентских компонентов. */

import type { Mode } from "@/lib/scoring-types";

export type Tone = "good" | "normal" | "attention" | "risk" | "high" | "na";

/* ─── Публичный результат (виден всем, включая незалогиненных) ─── */
export interface PublicScoreResult {
  calculationId: string;
  mode: Mode;
  score: number;
  /** Сработал хард-стоп: балл не показываем как достижение, показываем причину. */
  blocked: boolean;
  stops: string[];
  /** Первые N предупреждений для инлайн-панели. */
  warnings: string[];
  /** Сколько предупреждений осталось за кадром (для ссылки «+N əlavə qeyd»). */
  extraWarningCount: number;
  /* Вердикт разделён на короткий заголовок и пояснение.
     Раньше это была одна строка вида «Yüksək şans — Bankların əksəriyyəti
     təsdiqləyə bilər» плюс поле icon с эмодзи. Эмодзи как индикатор статуса
     запрещены (тон уже несёт цвет), а склейка через тире мешала показать
     главное крупно: ведёт заголовок, пояснение его поддерживает. */
  label: { text: string; detail: string; tone: Tone } | null;
  bgn: number | null;
  bgnLimit: number;
  /** Тон долговой нагрузки. Считается на сервере: пороги зон внутренние. */
  bgnTone: Tone;
  yeniOdenis: number;
  /** Ставка, рассчитанная Navio (наличный кредит). null — ставку ввёл пользователь. */
  estimatedRate: number | null;
  /** Ставка, введённая пользователем (карта/ипотека/авто). */
  manualRate: number | null;
  commission: { pct: number; amount: number } | null;
  topRecommendation: { title: string; text: string } | null;
  /** BOKT: максимальная сумма к возврату. */
  boktMaxOdenis: number | null;
}

/* ─── Детальный отчёт (/analiz) ─── */
export type PublicLevel = "Yüksək" | "Orta" | "Aşağı" | "Məhdudiyyət var";

export type FactorKey =
  | "borc-yuku" | "cari-gecikme" | "maks-gecikme"
  | "gelir" | "muddet" | "mebleg" | "yas" | "kredit-xetti";

export type RecKey =
  | "mebleg-azalt" | "ohdelik-azalt" | "gecikme-bagla"
  | "muraciet-gozle" | "muddet-qisalt" | "muddet-yoxla"
  | "gelir-resmilesdir" | "staj-artir" | "profil-yaxsi";

export interface Factor {
  key: FactorKey;
  label: string;
  level: PublicLevel;
  tone: Tone;
  text: string;
}

export interface Recommendation {
  key: RecKey;
  title: string;
  text: string;
}

export interface BgnAnalysis {
  current: number;
  after: number;
  limit: number;
  payment: number;
  remaining: number | null;
  rate: number;
  zone: Tone;
  text: string;
}

export interface Simulation {
  chips: number[];
  rate: number;
  payment: number;
  bgn: number;
  status: string;
  tone: Tone;
}

/** Полный отчёт — только для зарегистрированных. */
export interface UnlockedAnalysis {
  locked: false;
  calculationId: string;
  createdAt: string;
  score: number;
  overall: { label: string; tone: Tone; note: string };
  stops: string[];
  metrics: { label: string; value: string }[];
  checks: { label: string; status: "ok" | "fail" | "na" }[];
  bgn: BgnAnalysis | null;
  factors: Factor[];
  hasRestriction: boolean;
  risks: string[];
  recommendations: Recommendation[];
  simulation: Simulation | null;
}

/** Урезанный отчёт для незалогиненных: балл и итог видны, разбор — нет. */
export interface LockedAnalysis {
  locked: true;
  calculationId: string;
  createdAt: string;
  score: number;
  overall: { label: string; tone: Tone; note: string };
  stops: string[];
  metrics: { label: string; value: string }[];
  /** Заголовки закрытых разделов — показываем в CTA, чтобы было видно ценность. */
  lockedSections: string[];
}

export type AnalysisPayload = UnlockedAnalysis | LockedAnalysis;
