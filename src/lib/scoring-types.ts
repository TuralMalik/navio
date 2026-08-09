/* Клиентские типы скоринга.
   ВАЖНО: здесь не должно быть ни одного порога/веса/ставки — только формы ввода
   и диапазоны, которые пользователь и так видит на слайдерах.
   Вся логика расчёта живёт в src/lib/server/scoring.ts (server-only). */

export type Mode = "bank" | "bokt";
export type GelirNovu = "resmi" | "xarici" | "fs" | "teqaud" | "qeyri_resmi";
export type KreditNovu = "naqd" | "kart" | "ipoteka" | "avto";
export type IsStaji = "0_2" | "3_5" | "6_11" | "12_plus";

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
  cariGecikmeGun: string;
  maks12ay: string;
}

export interface BoktForm {
  mebleg: string;
  gelir: string;
  kreditTarixce: "yox" | "gecikme";
}

/* ─── Диапазоны формы: это UI-границы слайдеров, пользователь их всё равно видит.
   Не путать с порогами скоринга — тех здесь нет. ─── */
export const FORM_RANGES = {
  mebleg: (nov: KreditNovu) => ({
    min: nov === "naqd" ? 200 : 500,
    max: nov === "ipoteka" || nov === "avto" ? 500000 : 100000,
  }),
  muddet: (nov: KreditNovu) => ({
    min: nov === "naqd" ? 3 : 1,
    max: nov === "ipoteka" ? 360 : 59,
  }),
  yas: { min: 18, max: 75 },
  faiz: { min: 0, max: 100 },
} as const;

export const clampToRange = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
