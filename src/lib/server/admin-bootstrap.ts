import "server-only";
import { randomUUID, randomBytes, timingSafeEqual } from "crypto";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { adminUser } from "@/db/schema";
import { generateBackupCodes, hashPassword } from "./admin-auth";
import { generateTotpSecret, totpUri } from "./totp";

/* Первичное создание администратора на живом сервере.

   Зачем: админов заводит скрипт, а у владельца проекта нет ни терминала, ни
   строки подключения к продовой базе. После деплоя таблица admin_user пуста,
   регистрации нет — войти было бы некому. Эта страница закрывает разрыв.

   Три условия, все обязательны:
   1) таблица admin_user ПУСТА — после первого админа вход закрывается навсегда
   2) задан ADMIN_BOOTSTRAP_TOKEN
   3) переданный токен совпадает с ним

   Условие (2) критично: без него любой, кто откроет /admin/bootstrap на свежем
   деплое, стал бы администратором. Нет токена — значит закрыто. */

export type BootstrapState =
  | { available: true }
  | { available: false; reason: "already-initialised" | "no-token-configured" | "bad-token" };

function tokenConfigured(): string | null {
  const t = process.env.ADMIN_BOOTSTRAP_TOKEN?.trim();
  return t && t.length >= 16 ? t : null;
}

export async function countAdmins(): Promise<number> {
  const [row] = await getDb().select({ n: sql<number>`count(*)::int` }).from(adminUser);
  return row?.n ?? 0;
}

/** Можно ли сейчас создать первого админа с этим токеном. */
export async function bootstrapState(token: string | undefined): Promise<BootstrapState> {
  const configured = tokenConfigured();
  if (!configured) return { available: false, reason: "no-token-configured" };

  if ((await countAdmins()) > 0) return { available: false, reason: "already-initialised" };

  const given = Buffer.from(token ?? "");
  const expected = Buffer.from(configured);
  const ok = given.length === expected.length && timingSafeEqual(given, expected);
  if (!ok) return { available: false, reason: "bad-token" };

  return { available: true };
}

export interface BootstrapResult {
  email: string;
  totpSecret: string;
  totpUri: string;
  backupCodes: string[];
}

/** Создаёт первого администратора. Секрет и резервные коды возвращаются один
   раз — показать на экране и больше нигде не хранить. */
export async function createFirstAdmin(params: {
  token: string | undefined;
  email: string;
  name: string;
  password: string;
}): Promise<{ ok: true; result: BootstrapResult } | { ok: false; reason: string }> {
  const state = await bootstrapState(params.token);
  if (!state.available) return { ok: false, reason: state.reason };

  const email = params.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, reason: "bad-email" };
  if (params.password.length < 12) return { ok: false, reason: "weak-password" };

  const secret = generateTotpSecret();
  const { plain, hashed } = generateBackupCodes();

  try {
    await getDb().insert(adminUser).values({
      id: randomUUID(),
      email,
      name: params.name.trim() || email.split("@")[0],
      passwordHash: await hashPassword(params.password),
      totpSecret: secret,
      backupCodes: hashed,
    });
  } catch {
    // Гонка: пока заполняли форму, админа успели создать другим путём
    return { ok: false, reason: "already-initialised" };
  }

  return {
    ok: true,
    result: {
      email,
      totpSecret: secret,
      totpUri: totpUri({ secret, accountName: email, issuer: "Navio Admin" }),
      backupCodes: plain,
    },
  };
}

/** Подсказка для владельца: сгенерировать значение ADMIN_BOOTSTRAP_TOKEN. */
export function suggestBootstrapToken(): string {
  return randomBytes(24).toString("base64url");
}
