import { pgTable, text, timestamp, boolean, integer, real, jsonb, index, bigserial } from "drizzle-orm/pg-core";

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

/* ─── Аналитика: просмотры страниц ───
   Одна строка на навигацию. Вовлечённое время накапливается В ЭТОЙ ЖЕ строке
   (durationMs обновляется хартбитом), чтобы один визит не разрастался в сотни
   строк-пингов.

   Идентичность — три оси:
   • sessionId — ключ группировки, живёт в localStorage, 30 мин простоя → новая
   • clientId  — случайный UUID на установку браузера («то же устройство»)
   • userId    — если вошёл; при удалении аккаунта обнуляется, строка остаётся

   Приватность: сырой IP не храним никогда, только солёный хеш (как в скоринге).
   Значения полей форм здесь не появляются — там доход, долги, просрочки. */
export const pageView = pgTable(
  "page_view",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),

    sessionId: text("session_id").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    clientId: text("client_id"),

    /** Путь без локали: /kredit-yoxlama, а не /az/kredit-yoxlama. */
    path: text("path").notNull(),

    /** Вовлечённое время: видимая + активная вкладка, не астрономическое. */
    durationMs: integer("duration_ms").notNull().default(0),
    lastHeartbeatAt: timestamp("last_heartbeat_at"),

    /** Либо внутренний путь, либо внешний хост — никогда полный внешний URL. */
    referrerPath: text("referrer_path"),
    externalReferrerHost: text("external_referrer_host"),

    /** direct | external_referrer | campaign */
    visitType: text("visit_type"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmContent: text("utm_content"),
    utmTerm: text("utm_term"),
    /** Идентификаторы кликов: Google Ads и Meta — остальное пока не нужно. */
    gclid: text("gclid"),
    fbclid: text("fbclid"),

    /** Ботов не выбрасываем, а помечаем: агрегаты фильтруют, но их видно по запросу. */
    isBot: boolean("is_bot").notNull().default(false),
    isFirstInSession: boolean("is_first_in_session").notNull().default(false),
    isNewVisitor: boolean("is_new_visitor").notNull().default(false),

    /** web | pwa */
    clientSource: text("client_source"),
    userAgent: text("user_agent"),
    /** SHA-256(ip + SCORING_IP_SALT). Сырой IP не хранится. */
    ipHash: text("ip_hash"),
    /** ISO 3166-1 alpha-2 из заголовка x-vercel-ip-country. */
    country: text("country"),
  },
  (t) => [
    index("page_view_created_idx").on(t.createdAt),
    // Хартбит ищет последнюю строку по (session, path)
    index("page_view_session_path_idx").on(t.sessionId, t.path, t.createdAt),
    index("page_view_path_created_idx").on(t.path, t.createdAt),
    index("page_view_client_created_idx").on(t.clientId, t.createdAt),
    index("page_view_user_created_idx").on(t.userId, t.createdAt),
  ],
);

/* ─── Аналитика: события ───
   Одна строка на клик / отправку формы / инструментированное действие.
   Джойнится с page_view по sessionId.

   props — свободный JSON, у каждого eventName своя форма. Значения полей ввода
   в него не попадают: см. src/lib/tracking/auto-capture.ts. */
export const trackingEvent = pgTable(
  "tracking_event",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),

    sessionId: text("session_id").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    clientId: text("client_id"),

    /** Стабильное имя через точку: ui.click, form.submit, scoring.calculated. */
    eventName: text("event_name").notNull(),
    path: text("path"),
    props: jsonb("props"),

    clientSource: text("client_source"),
    ipHash: text("ip_hash"),
  },
  (t) => [
    index("tracking_event_created_idx").on(t.createdAt),
    index("tracking_event_name_created_idx").on(t.eventName, t.createdAt),
    index("tracking_event_session_idx").on(t.sessionId, t.createdAt),
    index("tracking_event_user_created_idx").on(t.userId, t.createdAt),
  ],
);

/* ─── Администраторы ───
   Отдельная сущность, НЕ пользователь сайта. Причины:
   • админов заводим заранее скриптом, без регистрации и без писем
   • они не должны появляться в списке пользователей и не имеют входа на сайт
   • компрометация публичного входа не даёт доступа в админку

   MFA обязательна: без подтверждённого TOTP сессия админа не создаётся. */
export const adminUser = pgTable("admin_user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  /** scrypt: N=16384, r=8, p=1. Формат: scrypt$<salt-b64>$<hash-b64> */
  passwordHash: text("password_hash").notNull(),
  /** base32-секрет TOTP. Задаётся при засеве, в интерфейсе не показывается. */
  totpSecret: text("totp_secret").notNull(),
  /** Пока false — вход требует подтверждения привязки приложения. */
  totpConfirmedAt: timestamp("totp_confirmed_at"),
  /** Одноразовые коды на случай потери телефона; хранятся как хеши. */
  backupCodes: jsonb("backup_codes").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  /** Счётчик неудач и блокировка — защита от подбора пароля и кода. */
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
});

/* Сессии админов. Отдельно от session (той владеет Better Auth).
   Храним хеш токена, а не токен: утечка таблицы не даёт войти. */
export const adminSession = pgTable(
  "admin_session",
  {
    id: text("id").primaryKey(),
    adminId: text("admin_id").notNull().references(() => adminUser.id, { onDelete: "cascade" }),
    /** SHA-256 от токена из cookie. */
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
  },
  (t) => [
    index("admin_session_token_idx").on(t.tokenHash),
    index("admin_session_admin_idx").on(t.adminId),
  ],
);

export const schema = {
  user, session, account, verification, scoringCalculation, pageView, trackingEvent,
  adminUser, adminSession,
};
