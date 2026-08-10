/* Заводит администратора. Регистрации в интерфейсе нет намеренно: админов
   создаём здесь, чтобы никого не просить «зарегистрируйтесь и пришлите email».

   Запуск:
   npx dotenv -e .env.local -- node scripts/seed-admin.mjs admin@navio.az "Ad Soyad"

   Пароль можно передать третьим аргументом; если не передан — генерируем
   стойкий и печатаем один раз. TOTP-секрет создаётся всегда: двухфакторная
   аутентификация обязательна, отключить её нельзя.

   Повторный запуск с тем же email обновляет пароль и выдаёт новый TOTP-секрет
   (то есть «сброс доступа»), остальное не трогает. */

import { randomUUID, randomBytes, createHash, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { neon } from "@neondatabase/serverless";

const scrypt = promisify(_scrypt);

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(buf) {
  let bits = 0, value = 0, out = "";
  for (const byte of buf) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { out += BASE32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

function generatePassword() {
  // Без похожих глифов: путаница I/l/1 и O/0 при переносе вручную стоит дорого
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#%*-_";
  const bytes = randomBytes(24);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function generateBackupCodes(count = 8) {
  const plain = [];
  for (let i = 0; i < count; i++) {
    const raw = randomBytes(10).toString("base64").replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase().replace(/[OIL01]/g, "").slice(0, 10);
    plain.push(`${raw.slice(0, 5)}-${raw.slice(5)}`);
  }
  return { plain, hashed: plain.map((c) => createHash("sha256").update(c).digest("hex")) };
}

function totpUri({ secret, accountName, issuer }) {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}`;
  const params = new URLSearchParams({ secret, issuer, algorithm: "SHA1", digits: "6", period: "30" });
  return `otpauth://totp/${label}?${params.toString()}`;
}

const [emailArg, nameArg, passwordArg] = process.argv.slice(2);

if (!emailArg) {
  console.error("Usage: node scripts/seed-admin.mjs <email> [name] [password]");
  process.exit(1);
}

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run via: npx dotenv -e .env.local -- node scripts/seed-admin.mjs ...");
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const name = nameArg?.trim() || email.split("@")[0];
const password = passwordArg || generatePassword();
const generated = !passwordArg;

const sql = neon(url);
const secret = base32Encode(randomBytes(20));
const { plain: backupPlain, hashed: backupHashed } = generateBackupCodes();
const passwordHash = await hashPassword(password);

const existing = await sql.query("select id from admin_user where email = $1", [email]);

if (existing.length > 0) {
  await sql.query(
    `update admin_user
        set password_hash = $2, totp_secret = $3, totp_confirmed_at = null,
            backup_codes = $4, failed_attempts = 0, locked_until = null
      where email = $1`,
    [email, passwordHash, secret, JSON.stringify(backupHashed)],
  );
  // Все прежние сессии этого админа больше не действительны
  await sql.query("delete from admin_session where admin_id = $1", [existing[0].id]);
  console.log(`\n  Reset existing admin: ${email}`);
  console.log("  Previous sessions were revoked and the authenticator must be re-added.\n");
} else {
  await sql.query(
    `insert into admin_user (id, email, name, password_hash, totp_secret, backup_codes)
     values ($1, $2, $3, $4, $5, $6)`,
    [randomUUID(), email, name, passwordHash, secret, JSON.stringify(backupHashed)],
  );
  console.log(`\n  Created admin: ${email}\n`);
}

const uri = totpUri({ secret, accountName: email, issuer: "Navio Admin" });

console.log("  ── Credentials ─────────────────────────────────────────────");
console.log(`  Email     : ${email}`);
if (generated) console.log(`  Password  : ${password}`);
else console.log("  Password  : (as supplied)");
console.log("");
console.log("  ── Two-factor (required) ───────────────────────────────────");
console.log("  Add this to Google Authenticator / 1Password / Authy.");
console.log(`  Manual key: ${secret}`);
console.log(`  Or scan   : ${uri}`);
console.log("");
console.log("  ── Backup codes (each usable once) ─────────────────────────");
for (const c of backupPlain) console.log(`  ${c}`);
console.log("");
console.log("  Store these now — they are not recoverable and are shown only once.");
console.log("  Sign in at /admin/login\n");
