import "server-only";
import type { BankForm, BoktForm, GelirNovu, KreditNovu, IsStaji } from "@/lib/scoring-types";

/* Ввод приходит из браузера — доверять ему нельзя. Проверяем строго:
   enum'ы по белому списку, числовые строки — по длине и формату.
   Скоринг сам приводит строки к числам, поэтому здесь важна форма, не диапазон. */

const KREDIT_NOVU: KreditNovu[] = ["naqd", "kart", "ipoteka", "avto"];
const GELIR_NOVU: GelirNovu[] = ["resmi", "xarici", "fs", "teqaud", "qeyri_resmi"];
const IS_STAJI: IsStaji[] = ["0_2", "3_5", "6_11", "12_plus"];

const MAX_NUM_LEN = 12;

function isRec(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Числовая строка: пусто, целое или десятичное. Длина ограничена, чтобы не ловить 1e308. */
function numStr(v: unknown): string | null {
  if (typeof v === "number" && Number.isFinite(v)) v = String(v);
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (s === "") return "";
  if (s.length > MAX_NUM_LEN) return null;
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  return s;
}

function pick<T extends string>(v: unknown, allowed: T[]): T | null {
  return typeof v === "string" && (allowed as string[]).includes(v) ? (v as T) : null;
}

export function parseBankForm(raw: unknown): BankForm | null {
  if (!isRec(raw)) return null;

  const kreditNovu = pick(raw.kreditNovu, KREDIT_NOVU);
  const gelirNovu = pick(raw.gelirNovu, GELIR_NOVU);
  const isStaji = pick(raw.isStaji, IS_STAJI);
  if (!kreditNovu || !gelirNovu || !isStaji) return null;

  const nums = {
    mebleg: numStr(raw.mebleg),
    muddət: numStr(raw.muddət),
    faiz: numStr(raw.faiz),
    gelir: numStr(raw.gelir),
    yas: numStr(raw.yas),
    movcudNaqdOdenis: numStr(raw.movcudNaqdOdenis),
    movcudKartLimit: numStr(raw.movcudKartLimit),
    cariGecikmeGun: numStr(raw.cariGecikmeGun),
    maks12ay: numStr(raw.maks12ay),
  };
  if (Object.values(nums).some((v) => v === null)) return null;

  return { kreditNovu, gelirNovu, isStaji, ...(nums as Record<keyof typeof nums, string>) } as BankForm;
}

export function parseBoktForm(raw: unknown): BoktForm | null {
  if (!isRec(raw)) return null;
  const kreditTarixce = pick(raw.kreditTarixce, ["yox", "gecikme"] as const);
  const mebleg = numStr(raw.mebleg);
  const gelir = numStr(raw.gelir);
  if (!kreditTarixce || mebleg === null || gelir === null) return null;
  return { mebleg, gelir, kreditTarixce };
}
