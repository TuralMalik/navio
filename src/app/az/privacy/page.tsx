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
              content: `Xeyr. Navio FIN kodu, pasport nömrəsi, ünvan və ya telefon nömrəsi tələb etmir. Hesablamanı qeydiyyatdan keçmədən apara bilərsiniz.`,
            },
            {
              title: "Məlumatlar necə istifadə edilir?",
              content: `Hesablama Navio serverində aparılır: daxil etdiyiniz məlumatlar nəticəni hesablamaq üçün serverə göndərilir və hesablama nəticəsi ilə birlikdə saxlanılır. Bu, «Ətraflı analiz» səhifəsini açmağa və hesabınızda hesablama tarixçəsini görməyə imkan verir.

• Hesablamalar serverimizdə saxlanılır — həm qeydiyyatsız, həm də hesabla aparılanlar.
• Hesabınız varsa, hesablamalar tarixçənizdə görünür.
• Hesablamalarınızın və ya hesabınızın silinməsini istəyirsinizsə, info@navio.az ünvanına yazın.
• IP ünvanınız açıq şəkildə saxlanılmır — yalnız sui-istifadədən qorunmaq (sorğu limiti) üçün geri qaytarıla bilməyən şəkildə şifrələnmiş formada istifadə olunur.`,
            },
            {
              title: "Hesab yaratdıqda hansı məlumatlar saxlanılır?",
              content: `Qeydiyyatdan keçsəniz: adınız, e-poçt ünvanınız və şifrənizin geri qaytarıla bilməyən formada şifrələnmiş (hash) variantı. Google ilə daxil olsanız, Google-un bizə ötürdüyü ad, e-poçt və profil şəkli. Şifrənizi heç vaxt açıq şəkildə saxlamırıq.

Hesabınızı və bütün əlaqəli hesablamaları silmək üçün info@navio.az ünvanına yaza bilərsiniz.`,
            },
            {
              title: "Məlumatlar üçüncü tərəflərə verilirmi?",
              content: `Xeyr. Navio istifadəçi məlumatlarını satmır, paylaşmır və ya üçüncü tərəflərə ötürmür.`,
            },
            {
              title: "Cookie və analitika",
              content: `Platformanı yaxşılaşdırmaq üçün saytdan necə istifadə olunduğunu öz serverimizdə qeyd edirik. Bu məlumatlar üçüncü tərəf analitika şirkətlərinə göndərilmir.

Nə qeyd olunur:
• Açdığınız səhifələr və hər səhifədə keçirdiyiniz vaxt
• Kliklədiyiniz düymələr və linklər (düymənin adı — məsələn «Hesabla»)
• Formanın göndərilməsi (hansı sahələrin dolduğu — dəyərləri deyil)
• Brauzer növü, təxmini ölkə və saytımıza hansı keçiddən gəldiyiniz

Nə qeyd OLUNMUR:
• Formalara yazdığınız dəyərlər — gəliriniz, borcunuz, gecikmə günləriniz və yaşınız analitikaya heç vaxt düşmür. Bu məlumatlar yalnız hesablamanın özündə saxlanılır (yuxarıdakı bölməyə baxın).
• Şifrələr və e-poçt ünvanının məzmunu
• Açıq IP ünvanı — yalnız şifrələnmiş (hash) formada

Brauzerinizdə saytın işləməsi üçün lazım olan texniki identifikator saxlanılır (cookie və localStorage). O, təkrar ziyarətləri saymağa imkan verir və şəxsiyyətinizi müəyyən etmir. Brauzerin məlumatlarını təmizləməklə onu hər zaman sıfırlaya bilərsiniz.`,
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
