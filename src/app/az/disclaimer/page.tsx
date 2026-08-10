import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";

const sections = [
  {
    title: "Navio bank deyil",
    content:
      "Navio Azərbaycan Respublikasının Mərkəzi Bankı tərəfindən lisenziyalaşdırılmış bank, kredit təşkilatı və ya maliyyə vasitəçisi deyildir.",
  },
  {
    title: "Nəticə məlumat xarakterindədir",
    content:
      "Navio-da göstərilən kredit profili, bal, borc yükü və tövsiyələr yalnız məlumat xarakteri daşıyır. Bu nəticələr hər hansı bankın qərarını əvəz etmir.",
  },
  {
    title: "Kredit qərarını bank qəbul edir",
    content:
      "Kredit vermək ya verməmək qərarını yalnız müvafiq bank qəbul edir. Navio-nun müsbət nəticəsi kredit alacağınıza zəmanət deyil.",
  },
  {
    title: "Hesablamalar fərqlənə bilər",
    content:
      "Navio-da aparılan hesablamalar standart düsturlara əsaslanır. Faktiki bank şərtləri, komissiyalar, sığorta və qaydalar fərqli ola bilər.",
  },
  {
    title: "Qaydalar dəyişə bilər",
    content:
      "Azərbaycan maliyyə sektoru qaydaları, kredit şərtləri və bank tələbləri dəyişə bilər. Navio platformasını bu dəyişikliklərə uyğun yeniləməyə çalışır, lakin bütün hallarda aktual ola bilməz.",
  },
  {
    title: "Zəmanət yoxdur",
    content:
      "Navio heç bir şəkildə kredit alınmasına zəmanət vermir. «Kredit şansı», «100% təsdiq» kimi ifadələr bu platformada istifadə edilmir.",
  },
];

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">

        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">İmtina bəyanatı</h1>

        <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <AlertTriangle size={19} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
          <p className="text-sm leading-relaxed text-amber-900">
            Navio bank deyil, kredit brokeri deyil və heç bir kredit vermir. Bu platforma yalnız məlumat xarakteri
            daşıyır.
          </p>
        </div>

        <Card className="mt-4">
          <div className="divide-y divide-gray-200">
            {sections.map((s) => (
              <section key={s.title} className="py-5 first:pt-0 last:pb-0">
                <h2 className="mb-2 text-base font-bold text-ink">{s.title}</h2>
                <p className="text-sm leading-relaxed text-gray-600">{s.content}</p>
              </section>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
