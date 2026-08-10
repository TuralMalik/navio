import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* Первый заслон перед админкой (в Next 16 middleware называется Proxy).

   Это ОПТИМИСТИЧНАЯ проверка — ровно то, для чего Proxy предназначен по
   документации Next: «не полноценное решение для авторизации». Смотрим только
   наличие cookie сессии, без обращения к базе. Настоящая проверка живёт в
   requireAdmin() на каждой странице.

   Зачем вообще: запрос без cookie не должен доходить до рендера. Отдельно важно
   для RSC-запросов (заголовок RSC: 1) — редирект из layout их не останавливал,
   и страница успевала отрисоваться вместе с данными. */

const SESSION_COOKIE = "navio_admin_session";

/** Открытые части админки: вход и первичная настройка. */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/bootstrap"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Cookie есть — но действительна ли она, решает requireAdmin() на странице
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
