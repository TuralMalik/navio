/* Проверка решения «пускать или нет». Работает против живой базы:
   заводит временного админа, гоняет все пути отказа, потом удаляет. */
import { neon } from "@neondatabase/serverless";
import { randomUUID, randomBytes } from "crypto";
import { totp } from "../src/lib/server/totp.ts";
import { verifyAdminCredentials, hashPassword, hashBackupCode } from "../src/lib/server/admin-auth.ts";

const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);
const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const b32 = (buf) => { let bits=0,v=0,o=""; for (const b of buf){v=(v<<8)|b;bits+=8;while(bits>=5){o+=BASE32[(v>>>(bits-5))&31];bits-=5;}} if(bits>0)o+=BASE32[(v<<(5-bits))&31]; return o; };

const email = `authtest-${Date.now()}@navio.test`;
const password = "CorrectHorse#42";
const secret = b32(randomBytes(20));
const backup = "ABCDE-FGHIJ";
const id = randomUUID();

await sql.query(
  `insert into admin_user (id,email,name,password_hash,totp_secret,backup_codes)
   values ($1,$2,$3,$4,$5,$6)`,
  [id, email, "Auth Test", await hashPassword(password), secret, JSON.stringify([hashBackupCode(backup)])],
);

let pass = 0, fail = 0;
const t = async (label, fn, expected) => {
  const r = await fn();
  const got = r.ok ? "allow" : `deny:${r.reason}`;
  const ok = got === expected;
  if (ok) pass += 1; else fail += 1;
  console.log(`  ${ok ? "✓" : "✗"} ${label.padEnd(44)} ${got}${ok ? "" : `  (expected ${expected})`}`);
};

const v = (over = {}) => verifyAdminCredentials({ email, password, token: totp(secret), ...over });

await t("correct password + correct TOTP", () => v(), "allow");
await t("correct password + wrong TOTP", () => v({ token: "000000" }), "deny:invalid");
await t("correct password + empty TOTP", () => v({ token: "" }), "deny:invalid");
await t("wrong password + correct TOTP", () => v({ password: "nope" }), "deny:invalid");
await t("unknown admin email", () => v({ email: "ghost@navio.test" }), "deny:invalid");
await t("TOTP from 10 steps ago", () => v({ token: totp(secret, Date.now() - 300000) }), "deny:invalid");
await t("backup code accepted", () => v({ token: backup }), "allow");
await t("same backup code reused", () => v({ token: backup }), "deny:invalid");

// lockout: 5 неудач подряд
await sql.query("update admin_user set failed_attempts=0, locked_until=null where id=$1", [id]);
for (let i = 0; i < 5; i++) await v({ password: "wrong" });
await t("locked after 5 failures", () => v(), "deny:locked");

// после снятия блокировки снова пускает
await sql.query("update admin_user set failed_attempts=0, locked_until=null where id=$1", [id]);
await t("works again once unlocked", () => v(), "allow");

// таймингом нельзя отличить «нет админа» от «неверный пароль»
const bench = async (fn) => { const s=process.hrtime.bigint(); await fn(); return Number(process.hrtime.bigint()-s)/1e6; };
const tUnknown = await bench(() => v({ email: "ghost2@navio.test" }));
const tWrongPw = await bench(() => v({ password: "wrong" }));
const ratio = Math.max(tUnknown, tWrongPw) / Math.min(tUnknown, tWrongPw);
console.log(`  ${ratio < 3 ? "✓" : "✗"} timing: unknown-user ${tUnknown.toFixed(0)}ms vs wrong-password ${tWrongPw.toFixed(0)}ms (ratio ${ratio.toFixed(2)})`);
if (ratio >= 3) fail += 1; else pass += 1;

await sql.query("delete from admin_user where id=$1", [id]);
console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
