/* Применяет миграции БД на деплое.
   Запускается из `vercel-build` перед `next build`, чтобы схема появлялась
   автоматически и никому не требовался терминал.

   Используем мигратор drizzle-orm (обычная зависимость), а не drizzle-kit
   (devDependency): при установке с NODE_ENV=production devDependencies
   не ставятся, и сборка падала бы на пустом месте. */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!url) {
  // Форк или превью без подключённой БД: собраться дадим, но предупредим громко.
  console.warn("[migrate] DATABASE_URL yoxdur — miqrasiya ötürüldü. Bu deploy-da baza işləməyəcək.");
  process.exit(0);
}

try {
  await migrate(drizzle(neon(url)), { migrationsFolder: "./drizzle" });
  console.log("[migrate] miqrasiyalar tətbiq olundu");
} catch (err) {
  // Падаем громко: лучше сломанная сборка, чем деплой на несуществующую схему.
  console.error("[migrate] miqrasiya alınmadı:", err);
  process.exit(1);
}
