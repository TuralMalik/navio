import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb, schema } from "@/db";
import { sendVerificationEmail, sendResetPasswordEmail } from "./server/mailer";

export const APP_URL =
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/* Google подключаем только когда креды реально выданы: до этого момента
   провайдер просто не регистрируется, и кнопка «Google ilə davam et» скрыта,
   вместо того чтобы падать на рантайме. */
const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
export const googleEnabled = Boolean(googleId && googleSecret);

export const auth = betterAuth({
  appName: "Navio",
  baseURL: APP_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(getDb(), { provider: "pg", schema }),

  emailAndPassword: {
    enabled: true,
    // Подтверждение почты пока НЕ обязательно: письмо уходит, но вход не блокируется.
    // Чтобы сделать обязательным — поставить true (и предупредить в UI регистрации).
    requireEmailVerification: false,
    minPasswordLength: 8,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, url);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },

  ...(googleEnabled
    ? { socialProviders: { google: { clientId: googleId!, clientSecret: googleSecret! } } }
    : {}),

  user: { modelName: "user" },
  session: {
    // Сессия живёт 30 дней, продлевается раз в сутки при активности
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },

  // Должен идти последним: выставляет куки в Next.js server actions/route handlers
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
