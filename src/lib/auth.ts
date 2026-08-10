import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb, schema } from "@/db";
import { sendVerificationEmail, sendResetPasswordEmail, emailEnabled } from "./server/mailer";
import { getGoogleCredentials } from "./server/google-credentials";

export { emailEnabled };

export const APP_URL =
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/* Google подключаем только когда креды выданы И проходят проверку формы.
   Проверка обязательна: перепутанные ID/secret приводят к утечке secret
   в URL авторизации (см. server/google-credentials.ts). */
const googleCredentials = getGoogleCredentials();
export const googleEnabled = googleCredentials !== null;

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
    // Без настроенной почты не пытаемся отправлять вовсе
    sendOnSignUp: emailEnabled,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },

  ...(googleCredentials
    ? { socialProviders: { google: googleCredentials } }
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
