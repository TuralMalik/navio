import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

/* Юридический текст. Формулировки НЕ меняются без согласования с владельцем:
   это публичный документ о том, что именно хранит сервис. Здесь поменяна
   только вёрстка и пунктуация (длинные тире на запятые и двоеточия). */

const sections = [
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

• Hesablamalar serverimizdə saxlanılır: həm qeydiyyatsız, həm də hesabla aparılanlar.
• Hesabınız varsa, hesablamalar tarixçənizdə görünür.
• Hesablamalarınızın və ya hesabınızın silinməsini istəyirsinizsə, info@navio.az ünvanına yazın.
• IP ünvanınız açıq şəkildə saxlanılmır. O, yalnız sui-istifadədən qorunmaq (sorğu limiti) üçün geri qaytarıla bilməyən şəkildə şifrələnmiş formada istifadə olunur.`,
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
• Kliklədiyiniz düymələr və linklər (düymənin adı, məsələn «Hesabla»)
• Formanın göndərilməsi (hansı sahələrin dolduğu, dəyərləri deyil)
• Brauzer növü, təxmini ölkə və saytımıza hansı keçiddən gəldiyiniz

Nə qeyd olunmur:
• Formalara yazdığınız dəyərlər. Gəliriniz, borcunuz, gecikmə günləriniz və yaşınız analitikaya heç vaxt düşmür. Bu məlumatlar yalnız hesablamanın özündə saxlanılır (yuxarıdakı bölməyə baxın).
• Şifrələr və e-poçt ünvanının məzmunu
• Açıq IP ünvanı, yalnız şifrələnmiş (hash) formada

Brauzerinizdə saytın işləməsi üçün lazım olan texniki identifikator saxlanılır (cookie və localStorage). O, təkrar ziyarətləri saymağa imkan verir və şəxsiyyətinizi müəyyən etmir. Brauzerin məlumatlarını təmizləməklə onu hər zaman sıfırlaya bilərsiniz.`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Breadcrumbs trail={[{ href: "/az", label: "Ana səhifə" }]} current="Məxfilik siyasəti" />

        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Məxfilik siyasəti</h1>

        <Card>
          <div className="divide-y divide-gray-200">
            {sections.map((s) => (
              <section key={s.title} className="py-5 first:pt-0 last:pb-0">
                <h2 className="mb-2 text-base font-bold text-ink">{s.title}</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{s.content}</p>
              </section>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
