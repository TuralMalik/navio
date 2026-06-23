import Link from "next/link";
import { ChevronRight, AlertTriangle } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
          <ChevronRight size={14} />
          <span className="text-gray-600">İmtina bəyanatı</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex gap-3">
          <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 leading-relaxed">
            Navio bank deyil, kredit broker deyil və heç bir kredit vermir. Bu platforma yalnız
            məlumat xarakteri daşıyır.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">İmtina bəyanatı</h1>

          {[
            {
              title: "Navio bank deyil",
              content: "Navio Azərbaycan Respublikasının Mərkəzi Bankı tərəfindən lisenziyalaşdırılmış bank, kredit təşkilatı və ya maliyyə vasitəçisi deyildir.",
            },
            {
              title: "Nəticə məlumat xarakterindədir",
              content: "Navio-da göstərilən kredit profili, skor, borc yükü və tövsiyələr yalnız məlumat xarakteri daşıyır. Bu nəticələr hər hansı bankın qərarını əvəz etmir.",
            },
            {
              title: "Kredit qərarını bank qəbul edir",
              content: "Kredit vermək ya verməmək qərarını yalnız müvafiq bank qəbul edir. Navio-nun müsbət nəticəsi kredit alacağınıza zəmanət deyil.",
            },
            {
              title: "Hesablamalar fərqlənə bilər",
              content: "Navio-da aparılan hesablamalar standart düsturlara əsaslanır. Faktiki bank şərtləri, komissiyanlar, sığorta və qaydaları fərqli ola bilər.",
            },
            {
              title: "Qaydalar dəyişə bilər",
              content: "Azərbaycan maliyyə sektoru qaydaları, kredit şərtləri və bank tələbləri dəyişə bilər. Navio bu dəyişikliklərə əsasən platformasını yeniləməyə çalışır, lakin bütün hallarda aktual ola bilməz.",
            },
            {
              title: "Zəmanət yoxdur",
              content: "Navio heç bir şəkildə kredit alınmasına zəmanət vermir. \"Kredit şansı\", \"100% təsdiq\" kimi ifadələr bu platformada istifadə edilmir.",
            },
          ].map((section) => (
            <div key={section.title} className="mb-5 last:mb-0 pb-5 last:pb-0 border-b border-gray-50 last:border-0">
              <h2 className="font-bold text-gray-900 mb-2 text-base">{section.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
