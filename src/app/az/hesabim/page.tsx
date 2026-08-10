import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, MailCheck, AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/server/session";
import { listUserCalculations } from "@/lib/server/calculations";
import { formatPercent } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Tag } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const dynamic = "force-dynamic";

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
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Breadcrumbs trail={[{ href: "/az", label: "Ana səhifə" }]} current="Hesabım" />

        <Card className="mb-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{user.name || "Hesabım"}</h1>
          <p className="mt-1 text-sm text-gray-600">{user.email}</p>

          {/* Нет смысла просить подтвердить почту, если письма не отправляются */}
          {!user.emailVerified && Boolean(process.env.RESEND_API_KEY) && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
              <MailCheck size={16} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
              <p className="text-sm leading-relaxed text-amber-900">
                E-poçtunuz hələ təsdiqlənməyib. Təsdiq məcburi deyil, amma hesabınızın təhlükəsizliyi üçün tövsiyə
                olunur. Göndərdiyimiz məktubdakı keçidə daxil olun.
              </p>
            </div>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4">Hesablama tarixçəsi</CardTitle>

          {calculations.length === 0 ? (
            /* Пустое состояние называет следующее действие, а не констатирует
               пустоту. «Hələ hesablama yoxdur» само по себе бесполезно. */
            <div className="py-10 text-center">
              <FileText size={26} className="mx-auto mb-3 text-gray-300" aria-hidden />
              <p className="text-[15px] font-semibold text-ink">Hələ hesablama yoxdur</p>
              <p className="mx-auto mt-1.5 mb-5 max-w-xs text-sm text-gray-600">
                İlk kredit yoxlamanızı edin, nəticə avtomatik burada saxlanacaq.
              </p>
              <LinkButton href="/az/kredit-yoxlama" icon={<ArrowRight size={15} />}>
                İlkin yoxlamaya başla
              </LinkButton>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {calculations.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {c.blocked ? (
                        <Badge tone="high" icon={<AlertTriangle size={12} />}>
                          Uyğun deyil
                        </Badge>
                      ) : (
                        <span className="text-[15px] font-bold tabular-nums text-ink">{c.score} / 100</span>
                      )}
                      <Tag>{c.mode === "bank" ? "Bank" : "BOKT"}</Tag>
                    </div>
                    <p className="mt-1 text-[12.5px] tabular-nums text-gray-500">
                      {formatDate(c.createdAt)}
                      {c.bgn != null && ` · Borc yükü ${formatPercent(c.bgn)}`}
                    </p>
                  </div>

                  {c.mode === "bank" && (
                    <Link
                      href={`/az/kredit-yoxlama/analiz?id=${c.id}`}
                      className="inline-flex shrink-0 items-center gap-1.5 text-[13.5px] font-semibold text-brand-700 hover:text-brand-800"
                    >
                      Ətraflı <ArrowRight size={14} aria-hidden />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </main>
  );
}
