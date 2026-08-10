import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { getAdminSession, logoutAdmin } from "@/lib/server/admin-auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function signOut() {
  "use server";
  await logoutAdmin();
  redirect("/admin/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  /* Единственная точка проверки доступа. Страница входа лежит ВНЕ этой группы
     маршрутов (src/app/admin/login), поэтому редирект сюда не возвращается —
     цикла «нет сессии → логин → снова проверка» не возникает. */
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="lg:w-56 lg:shrink-0 lg:min-h-screen bg-slate-900 text-slate-100 lg:sticky lg:top-0 flex flex-col">
        <div className="px-4 py-4">
          <Link href="/admin" className="font-bold tracking-tight text-[15px]">
            Navio <span className="text-slate-400 font-medium">admin</span>
          </Link>
        </div>
        <AdminNav />
        <div className="px-4 py-4 mt-auto border-t border-slate-800 space-y-2">
          <p className="text-[11px] text-slate-500 truncate" title={admin.email}>{admin.email}</p>
          <div className="flex items-center gap-3">
            <Link href="/az" className="text-[11px] text-slate-400 hover:text-white transition-colors">
              ← Site
            </Link>
            <form action={signOut}>
              <button type="submit"
                className="text-[11px] text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1">
                <LogOut size={11} /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
