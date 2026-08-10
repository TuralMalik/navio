import { Check, X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const does = [
  "Kredit profilinin ilkin qiymətləndirilməsi",
  "İstehlak krediti kalkulyatoru",
  "İpoteka kalkulyatoru",
  "Avtokredit kalkulyatoru",
  "Erkən ödəniş hesablamaları",
  "Sadə maliyyə izahları",
  "Praktik tövsiyələr",
];

const doesNot = [
  "Kredit vermirik",
  "Bank qərarını əvəz etmirik",
  "Təsdiqə zəmanət vermirik",
  "Şəxsi sənəd (FIN, pasport) tələb etmirik",
  "Bank adından çıxış etmirik",
  "Kredit bürosu ilə bağlantımız yoxdur",
  "Əldə etdiyiniz məlumatları satmırıq",
];

/* Два списка стоят рядом намеренно: «что мы делаем» без «чего мы не делаем»
   на кредитном сайте читается как реклама. Иконки здесь несут смысл (плюс
   и минус), поэтому они цветные, но подложек под ними нет. */
function List({ items, kind }: { items: string[]; kind: "yes" | "no" }) {
  const Icon = kind === "yes" ? Check : X;
  const color = kind === "yes" ? "text-emerald-600" : "text-rose-600";
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700">
          <Icon size={15} className={`mt-0.5 shrink-0 ${color}`} aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Breadcrumbs trail={[{ href: "/az", label: "Ana səhifə" }]} current="Haqqımızda" />

        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Navio nədir?</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
          Navio istifadəçilərə kredit ödənişlərini hesablamağa, kredit profilini ilkin qiymətləndirməyə və maliyyə
          mövzularını sadə dildə anlamağa kömək edən məlumat platformasıdır.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardTitle className="mb-4">Nə edirik?</CardTitle>
            <List items={does} kind="yes" />
          </Card>

          <Card>
            <CardTitle className="mb-4">Nə etmirik?</CardTitle>
            <List items={doesNot} kind="no" />
          </Card>
        </div>

        <Card className="mt-4">
          <CardTitle className="mb-3">Niyə Navio?</CardTitle>
          <p className="text-sm leading-relaxed text-gray-600">
            Bir çox adam banka müraciət etməzdən əvvəl kredit şərtlərini, borc yükünü və faiz xərclərini düzgün
            qiymətləndirmir. Navio məhz bu boşluğu doldurmaq üçün yaradılıb: sadə, şəffaf və sənədsiz platforma kimi.
          </p>
        </Card>

        <div className="mt-8">
          <LinkButton href="/az/kredit-yoxlama" size="lg">
            İlkin yoxlamaya başla
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
