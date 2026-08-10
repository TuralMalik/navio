/* Условия закрытия первичной настройки. Проверяем именно отказы: страница,
   которая делает администратора, обязана быть закрыта во всех случаях кроме
   одного. */
import { neon } from "@neondatabase/serverless";
import { bootstrapState, createFirstAdmin, countAdmins } from "../src/lib/server/admin-bootstrap.ts";

const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);
const TOKEN = "this-is-a-long-enough-token-value";

let pass = 0, fail = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (ok) pass += 1; else fail += 1;
  console.log(`  ${ok ? "✓" : "✗"} ${label.padEnd(52)} ${actual}${ok ? "" : `  (expected ${expected})`}`);
};

const existing = await sql.query("select email from admin_user");
if (existing.length) {
  await sql.query("delete from admin_user");
  console.log(`  (cleared ${existing.length} existing admin(s) for the test)`);
}

// 1. Токен не задан — закрыто, даже при пустой таблице
delete process.env.ADMIN_BOOTSTRAP_TOKEN;
let s = await bootstrapState(TOKEN);
check("no token configured -> closed", s.available ? "open" : s.reason, "no-token-configured");

// 2. Слишком короткий токен не считается настроенным
process.env.ADMIN_BOOTSTRAP_TOKEN = "short";
s = await bootstrapState("short");
check("token shorter than 16 chars -> closed", s.available ? "open" : s.reason, "no-token-configured");

// 3. Токен задан, но передан неверный
process.env.ADMIN_BOOTSTRAP_TOKEN = TOKEN;
s = await bootstrapState("wrong-token-of-similar-length----");
check("wrong token -> closed", s.available ? "open" : s.reason, "bad-token");

// 4. Пустой токен в запросе
s = await bootstrapState(undefined);
check("missing token in request -> closed", s.available ? "open" : s.reason, "bad-token");

// 5. Всё сходится — открыто
s = await bootstrapState(TOKEN);
check("correct token + empty table -> open", s.available ? "open" : s.reason, "open");

// 6. Слабый пароль отклоняется
let r = await createFirstAdmin({ token: TOKEN, email: "a@navio.test", name: "A", password: "short" });
check("password under 12 chars rejected", r.ok ? "created" : r.reason, "weak-password");

// 7. Невалидный email
r = await createFirstAdmin({ token: TOKEN, email: "not-an-email", name: "A", password: "longenoughpassword" });
check("invalid email rejected", r.ok ? "created" : r.reason, "bad-email");

// 8. Создание проходит
r = await createFirstAdmin({ token: TOKEN, email: "first@navio.test", name: "First", password: "longenoughpassword" });
check("valid input creates the admin", r.ok ? "created" : r.reason, "created");
check("returns a TOTP secret", r.ok && r.result.totpSecret.length >= 32 ? "yes" : "no", "yes");
check("returns 8 backup codes", r.ok ? String(r.result.backupCodes.length) : "-", "8");

// 9. Сразу после этого закрыто навсегда
s = await bootstrapState(TOKEN);
check("after first admin -> closed", s.available ? "open" : s.reason, "already-initialised");

// 10. И вторая попытка не проходит даже с верным токеном
r = await createFirstAdmin({ token: TOKEN, email: "second@navio.test", name: "Second", password: "longenoughpassword" });
check("second admin refused", r.ok ? "created" : r.reason, "already-initialised");
check("still exactly one admin", String(await countAdmins()), "1");

await sql.query("delete from admin_user");
console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
