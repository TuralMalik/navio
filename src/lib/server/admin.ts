import "server-only";
import { getSession } from "./session";

/* Доступ в админку по списку адресов в ADMIN_EMAILS (через запятую).

   Почему не роль в базе: роль потребовала бы миграцию, интерфейс управления
   админами и решения про то, кто может назначать роли. Для одного-двух человек
   это лишнее. Когда админов станет больше — переносить в таблицу.

   Пустой список = админки нет ни у кого. Это осознанный выбор: «не задано»
   должно означать «закрыто», а не «открыто всем». */

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminUser() {
  const allowed = adminEmails();
  if (allowed.length === 0) return null;

  const session = await getSession();
  const email = session?.user?.email?.toLowerCase();
  if (!email || !allowed.includes(email)) return null;

  return session!.user;
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}
