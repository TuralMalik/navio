import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
          <ChevronRight size={14} />
          <span className="text-gray-600">Məxfilik siyasəti</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Məxfilik siyasəti</h1>

          {[
            {
              title: "Hansı məlumatlar daxil edilir?",
              content: `Navio-nun ilkin yoxlama funksiyası üçün siz yalnız aşağıdakı maliyyə məlumatlarını daxil edirsiniz:
• Aylıq xalis gəlir
• İş statusu və stajı
• Mövcud kredit ödənişləri
• Gecikmə məlumatları (gün sayı)
• İstədiyin kredit parametrləri
• Yaş və ailə vəziyyəti

Bu məlumatlar hesablama məqsədi ilə istifadə edilir.`,
            },
            {
              title: "Şəxsiyyət sənədi tələb edilirmi?",
              content: `Xeyr. Navio-nun əsas MVP (ilkin versiya) funksionallığı FIN kodu, pasport nömrəsi, ünvan və ya telefon nömrəsi tələb etmir. Siz tamamilə anonim şəkildə hesablama apara bilərsiniz.`,
            },
            {
              title: "Məlumatlar necə istifadə edilir?",
              content: `Daxil etdiyiniz məlumatlar yalnız brauzerdə (client-side) hesablama aparmaq üçün istifadə edilir. Hazırkı mərhələdə bu məlumatlar serverimizə göndərilmir və saxlanılmır.`,
            },
            {
              title: "Məlumatlar üçüncü tərəflərə verilirmi?",
              content: `Xeyr. Navio istifadəçi məlumatlarını satmır, paylaşmır və ya üçüncü tərəflərə ötürmür.`,
            },
            {
              title: "Cookie və analitika",
              content: `Platforma əsas performans analitikası üçün anonim istifadəçi məlumatlarından istifadə edə bilər. Heç bir şəxsi məlumat analitika sistemlərinə ötürülmür.`,
            },
          ].map((section) => (
            <div key={section.title} className="mb-6 last:mb-0">
              <h2 className="font-bold text-gray-900 mb-2 text-base">{section.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
