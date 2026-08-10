import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/* Ленивая инициализация: neon() бросает, если DATABASE_URL не задан, а Next
   выполняет модули верхнего уровня на этапе сборки. Без этого падает next build
   до того, как env-переменные появятся.

   Никаких Proxy-обёрток — Better Auth инспектирует объект адаптера, и Proxy
   ломает цепочку запросов без внятной ошибки. */
function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return drizzle(neon(url), { schema });
}

let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

export { schema };
