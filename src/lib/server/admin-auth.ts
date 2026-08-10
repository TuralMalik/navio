import "server-only";
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { adminSession, adminUser } from "@/db/schema";
import { verifyTotp } from "./totp";
import { clientIp, hashIp } from "./rate-limit";

/* Аутентификация администраторов. Отдельная от публичной по трём причинам:
   админов заводят скриптом (регистрации нет), они не пользователи сайта, и
   компрометация публичного входа не должна открывать админку.

   Обязательные два фактора: пароль + TOTP. Сессия создаётся только после
   успешной проверки ОБОИХ — промежуточного «полу-входа» не существует. */

/* promisify(scrypt) типизируется только по трёхаргументной перегрузке, из-за
   чего объект параметров не проходит проверку типов. Оборачиваем вручную. */
function scryptAsync(password: string, salt: Buffer, keylen: number, params: ScryptParams): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, params, (err, derived) => (err ? reject(err) : resolve(derived)));
  });
}

interface ScryptParams { N: number; r: number; p: number }

const SESSION_COOKIE = "navio_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 часов: рабочая смена, не месяц
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 1000 * 60 * 15;

/* ─── Пароль ─── */

const SCRYPT_KEYLEN = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scryptAsync(password, Buffer.from(saltB64, "base64"), expected.length, SCRYPT_PARAMS);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/* ─── Резервные коды ───
   Храним хеши: утечка таблицы не должна давать готовые коды. */

export function generateBackupCodes(count = 8): { plain: string[]; hashed: string[] } {
  const plain: string[] = [];
  for (let i = 0; i < count; i++) {
    // 10 символов из base32-подобного алфавита без похожих глифов
    const raw = randomBytes(10)
      .toString("base64")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .replace(/[OIL01]/g, "")
      .slice(0, 10);
    plain.push(`${raw.slice(0, 5)}-${raw.slice(5)}`);
  }
  return { plain, hashed: plain.map(hashBackupCode) };
}

export function hashBackupCode(code: string): string {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

/* ─── Сессия ───
   В cookie кладём случайный токен, в базу — его SHA-256. Кража базы не даёт
   войти, а токен нигде больше не хранится. */

function tokenHashOf(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
}

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "locked"; retryAfterMinutes?: number };

/** Проверка обоих факторов БЕЗ побочных эффектов на cookie.
   Отделено от выдачи сессии специально: это единственное место, где решается
   «пускать или нет», и его надо проверять тестами. cookies() требует контекста
   запроса, поэтому вместе с ним функция была бы непроверяемой.
   Возвращает id админа, если оба фактора сошлись. */
export async function verifyAdminCredentials(params: {
  email: string;
  password: string;
  token: string;
}): Promise<{ ok: true; adminId: string } | { ok: false; reason: "invalid" | "locked"; retryAfterMinutes?: number }> {
  const db = getDb();
  const email = params.email.trim().toLowerCase();

  const [admin] = await db.select().from(adminUser).where(eq(adminUser.email, email)).limit(1);

  // Нет такого админа — всё равно тратим время на scrypt, чтобы по скорости
  // ответа нельзя было отличить «нет пользователя» от «неверный пароль»
  if (!admin) {
    await hashPassword(params.password);
    return { ok: false, reason: "invalid" };
  }

  if (admin.lockedUntil && admin.lockedUntil.getTime() > Date.now()) {
    return {
      ok: false,
      reason: "locked",
      retryAfterMinutes: Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000),
    };
  }

  const passwordOk = await verifyPassword(params.password, admin.passwordHash);

  // Второй фактор: сначала TOTP, затем — резервный код
  let secondFactorOk = false;
  let usedBackupCode: string | null = null;
  if (passwordOk) {
    if (verifyTotp(admin.totpSecret, params.token)) {
      secondFactorOk = true;
    } else {
      const candidate = hashBackupCode(params.token);
      if (admin.backupCodes.includes(candidate)) {
        secondFactorOk = true;
        usedBackupCode = candidate;
      }
    }
  }

  if (!passwordOk || !secondFactorOk) {
    const failed = admin.failedAttempts + 1;
    await db
      .update(adminUser)
      .set({
        failedAttempts: failed,
        lockedUntil: failed >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : null,
      })
      .where(eq(adminUser.id, admin.id));
    return { ok: false, reason: "invalid" };
  }

  // Резервный код одноразовый — вычёркиваем сразу
  const remainingCodes = usedBackupCode
    ? admin.backupCodes.filter((c) => c !== usedBackupCode)
    : admin.backupCodes;

  await db
    .update(adminUser)
    .set({
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      totpConfirmedAt: admin.totpConfirmedAt ?? new Date(),
      backupCodes: remainingCodes,
    })
    .where(eq(adminUser.id, admin.id));

  return { ok: true, adminId: admin.id };
}

/** Вход: проверка факторов, затем сессия и cookie. */
export async function loginAdmin(params: {
  email: string;
  password: string;
  token: string;
  req?: Request;
}): Promise<LoginResult> {
  const result = await verifyAdminCredentials(params);
  if (!result.ok) return result;
  await createAdminSession(result.adminId, params.req);
  return { ok: true };
}

async function createAdminSession(adminId: string, req?: Request): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await getDb().insert(adminSession).values({
    id: randomUUID(),
    adminId,
    tokenHash: tokenHashOf(token),
    expiresAt,
    ipHash: req ? safeIpHash(req) : null,
    userAgent: req ? (req.headers.get("user-agent") || "").slice(0, 500) : null,
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

function safeIpHash(req: Request): string | null {
  try {
    return hashIp(clientIp(req));
  } catch {
    return null;
  }
}

/** Текущий админ или null. Единственная точка проверки доступа. */
export async function getAdminSession(): Promise<AdminIdentity | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await getDb()
    .select({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
    })
    .from(adminSession)
    .innerJoin(adminUser, eq(adminSession.adminId, adminUser.id))
    .where(and(eq(adminSession.tokenHash, tokenHashOf(token)), gt(adminSession.expiresAt, new Date())))
    .limit(1);

  return row ?? null;
}

export async function logoutAdmin(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await getDb().delete(adminSession).where(eq(adminSession.tokenHash, tokenHashOf(token)));
  }
  jar.delete(SESSION_COOKIE);
}

/** Уборка истёкших сессий. Дёшево вызывать при входе. */
export async function purgeExpiredAdminSessions(): Promise<void> {
  await getDb().delete(adminSession).where(lt(adminSession.expiresAt, new Date()));
}
