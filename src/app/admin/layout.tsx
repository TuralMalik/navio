import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/server/admin";

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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-slate-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Link href="/admin" className="font-bold tracking-tight">
              Navio <span className="text-slate-400 font-medium">admin</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin" className="text-slate-300 hover:text-white transition-colors">Analitika</Link>
              <Link href="/az" className="text-slate-300 hover:text-white transition-colors">Sayta qayıt</Link>
            </nav>
          </div>
          <span className="text-xs text-slate-400 truncate max-w-[200px]">{admin.email}</span>
        </div>
      </header>
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
