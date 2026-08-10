import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/** Текущая сессия или null. Безопасно вызывать из route handlers и server components. */
export async function getSession() {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
}

export async function getUserId(): Promise<string | null> {
  const s = await getSession();
  return s?.user?.id ?? null;
}
