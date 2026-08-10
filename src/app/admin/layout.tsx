import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/server/admin";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // notFound(), а не redirect: посторонний не должен даже узнать, что раздел есть
  const admin = await getAdminUser();
  if (!admin) notFound();

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="lg:w-56 lg:shrink-0 lg:min-h-screen bg-slate-900 text-slate-100 lg:sticky lg:top-0">
        <div className="px-4 py-4 flex items-center justify-between lg:block">
          <Link href="/admin" className="font-bold tracking-tight text-[15px]">
            Navio <span className="text-slate-400 font-medium">admin</span>
          </Link>
        </div>
        <AdminNav />
        <div className="px-4 py-4 mt-auto border-t border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-500 truncate" title={admin.email}>{admin.email}</p>
          <Link href="/az" className="text-[11px] text-slate-400 hover:text-white transition-colors">
            ← Sayta qayıt
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0 px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
