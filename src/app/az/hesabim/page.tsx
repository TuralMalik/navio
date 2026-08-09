import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, ArrowRight, FileText, MailCheck, AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/server/session";
import { listUserCalculations } from "@/lib/server/calculations";

export const dynamic = "force-dynamic";

const NAVY = "#0A1F44";
const MUTED = "#5B6577";
const LINE = "#E3E8F1";
const BLUE = "#2447F0";

function formatDate(d: Date) {
  // Детерминированный формат без Intl — как в остальном проекте (hydration)
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function AccountPage() {
  const session = await getSession();
  if (!session?.user) redirect("/az/login?next=/az/hesabim");

  const { user } = session;
  const calculations = await listUserCalculations(user.id);

  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
          <ChevronRight size={14} />
          <span className="text-gray-600">Hesabım</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
          <h1 className="text-2xl font-bold mb-1" style={{ color: NAVY }}>{user.name || "Hesabım"}</h1>
          <p className="text-sm" style={{ color: MUTED }}>{user.email}</p>

          {!user.emailVerified && (
            <div className="mt-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm">
              <MailCheck size={16} className="shrink-0 mt-0.5 text-amber-500" />
              <p className="text-amber-800">
                E-poçtunuz hələ təsdiqlənməyib. Təsdiq məcburi deyil, amma hesabınızın təhlükəsizliyi
                üçün tövsiyə olunur — göndərdiyimiz məktubdakı keçidə daxil olun.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-[17px] font-bold mb-4" style={{ color: NAVY }}>Hesablama tarixçəsi</h2>

          {calculations.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4" style={{ background: "#EBEFFE", color: BLUE }}>
                <FileText size={24} />
              </div>
              <p className="text-[15px] font-semibold mb-1.5" style={{ color: NAVY }}>Hələ hesablama yoxdur</p>
              <p className="text-[13.5px] mb-5" style={{ color: MUTED }}>
                İlk kredit yoxlamanızı edin — nəticə avtomatik burada saxlanacaq.
              </p>
              <Link href="/az/kredit-yoxlama"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] font-semibold text-white text-sm"
                style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.28)" }}>
                İlkin yoxlamaya başla <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: LINE }}>
              {calculations.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[15px] font-bold" style={{ color: NAVY }}>
                        {c.blocked ? "Uyğun deyil" : `${c.score} / 100`}
                      </span>
                      {c.blocked && <AlertTriangle size={14} className="text-red-500" />}
                      <span className="text-[12px] px-2 py-0.5 rounded-full bg-gray-100" style={{ color: MUTED }}>
                        {c.mode === "bank" ? "Bank" : "BOKT"}
                      </span>
                    </div>
                    <p className="text-[12.5px] mt-0.5" style={{ color: MUTED }}>
                      {formatDate(c.createdAt)}
                      {c.bgn != null && ` · BGN ${c.bgn.toFixed(1)}%`}
                    </p>
                  </div>
                  {c.mode === "bank" && (
                    <Link href={`/az/kredit-yoxlama/analiz?id=${c.id}`}
                      className="group inline-flex items-center gap-1.5 text-[13.5px] font-semibold shrink-0" style={{ color: BLUE }}>
                      Ətraflı <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
