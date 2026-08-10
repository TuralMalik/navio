import { pgTable, text, timestamp, boolean, integer, real, jsonb, index } from "drizzle-orm/pg-core";

/* ─── Better Auth core tables ───
   Имена моделей и полей заданы самим Better Auth (см. @better-auth/core/db/schema).
   Ключи в JS должны совпадать с его field names; имена колонок в БД — наши. */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    /** Хеш пароля (scrypt) — только для email/password входа. */
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/* ─── Расчёты скоринга ───
   Хранят ввод формы, потому что /analiz строится из него на сервере.
   Приватность:
   • IP не хранится в открытом виде — только соль+SHA-256 (для рейт-лимита).
   • Расчёты хранятся бессрочно, автоудаления нет — удаление по запросу пользователя.
   Это НЕ анонимные данные: там доход, возраст, долги. Политика конфиденциальности
   должна это отражать — см. /az/privacy. */
export const scoringCalculation = pgTable(
  "scoring_calculation",
  {
    id: text("id").primaryKey(),
    /** null — расчёт сделан без входа. */
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    mode: text("mode").notNull(), // "bank" | "bokt"
    /** Ввод формы (BankForm | BoktForm). Нужен, чтобы пересобрать отчёт на сервере. */
    input: jsonb("input").notNull(),
    score: integer("score").notNull(),
    bgn: real("bgn"),
    blocked: boolean("blocked").notNull().default(false),
    /** SHA-256(ip + SCORING_IP_SALT). Для рейт-лимита, обратно не разворачивается. */
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    /** НЕ ИСПОЛЬЗУЕТСЯ. Осталось от прежней схемы с автоудалением через 7 дней.
       Ничего её не пишет и не читает; снятие колонки требует миграции. */
    expiresAt: timestamp("expires_at"),
  },
  (t) => [
    // Рейт-лимит: считаем недавние расчёты с одного ip_hash
    index("scoring_calculation_ip_created_idx").on(t.ipHash, t.createdAt),
    // История пользователя
    index("scoring_calculation_user_created_idx").on(t.userId, t.createdAt),
    // Уборка просроченных анонимных расчётов
    index("scoring_calculation_expires_idx").on(t.expiresAt),
  ],
);

export const schema = { user, session, account, verification, scoringCalculation };
