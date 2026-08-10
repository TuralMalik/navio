/* Тестовые векторы RFC 6238, приложение B. Секрет — ASCII "12345678901234567890"
   (для SHA-256/512 RFC использует удлинённые варианты того же паттерна). */
import { totp, verifyTotp, base32Encode, base32Decode } from "../src/lib/server/totp.ts";

const s1 = base32Encode(Buffer.from("12345678901234567890", "ascii"));
const s256 = base32Encode(Buffer.from("12345678901234567890123456789012", "ascii"));
const s512 = base32Encode(Buffer.from("1234567890123456789012345678901234567890123456789012345678901234", "ascii"));

const VECTORS = [
  [59,          "94287082", s1,   "sha1"],
  [1111111109,  "07081804", s1,   "sha1"],
  [1111111111,  "14050471", s1,   "sha1"],
  [1234567890,  "89005924", s1,   "sha1"],
  [2000000000,  "69279037", s1,   "sha1"],
  [20000000000, "65353130", s1,   "sha1"],
  [59,          "46119246", s256, "sha256"],
  [1111111109,  "68084774", s256, "sha256"],
  [20000000000, "77737706", s256, "sha256"],
  [59,          "90693936", s512, "sha512"],
  [1111111109,  "25091201", s512, "sha512"],
  [20000000000, "47863826", s512, "sha512"],
];

let pass = 0, fail = 0;
for (const [t, expected, secret, algorithm] of VECTORS) {
  const got = totp(secret, t * 1000, { digits: 8, algorithm });
  const ok = got === expected;
  if (ok) pass += 1; else fail += 1;
  if (!ok) console.log(`  FAIL T=${t} ${algorithm}: expected ${expected}, got ${got}`);
}
console.log(`RFC 6238 vectors: ${pass} passed, ${fail} failed`);

// base32 round-trip
const rt = base32Decode(base32Encode(Buffer.from("hello world!", "ascii"))).toString("ascii");
console.log("base32 round-trip:", rt === "hello world!" ? "ok" : `BROKEN (${rt})`);

// verifyTotp: правильный код, дрейф, мусор
const now = 1111111109 * 1000;
const code = totp(s1, now);
console.log("verify current code:", verifyTotp(s1, code, { at: now }) ? "ok" : "BROKEN");
console.log("verify code from previous step:", verifyTotp(s1, totp(s1, now - 30000), { at: now }) ? "ok (within window)" : "BROKEN");
console.log("verify code 5 steps old:", verifyTotp(s1, totp(s1, now - 150000), { at: now }) ? "BROKEN (should reject)" : "ok (rejected)");
console.log("verify wrong code:", verifyTotp(s1, "000000", { at: now }) ? "BROKEN" : "ok (rejected)");
console.log("verify malformed:", verifyTotp(s1, "abc", { at: now }) ? "BROKEN" : "ok (rejected)");
process.exit(fail > 0 ? 1 : 0);
