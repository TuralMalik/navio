export interface QAItem {
  id: string;
  question: string;
  answer: string;
  cta?: { label: string; href: string };
}

export interface QACategory {
  slug: string;
  name: string;
  emoji: string;
  color: string;
  soft: string;
  items: QAItem[];
}

export const categories: QACategory[] = [
  {
    slug: "kredit-alma",
    name: "Kredit alma",
    emoji: "💳",
    color: "#2447F0",
    soft: "#EBEFFE",
    items: [
      {
        id: "ne-qeder-kredit-dusur",
        question: "Mənə nə qədər kredit düşür?",
        answer:
          "Bu, əsasən aylıq gəlirinizdən və mövcud borc yükünüzdən (BGN) asılıdır. Banklar adətən yeni kreditin aylıq ödənişi ilə birlikdə ümumi borc yükünün gəlirin müəyyən faizini keçməməsini tələb edir. Dəqiq rəqəmi görmək üçün öz gəlir və borclarınızı daxil edərək ilkin qiymətləndirmə ala bilərsiniz.",
        cta: { label: "Kredit şansımı yoxla", href: "/az/kredit-yoxlama" },
      },
      {
        id: "niye-kredit-vermedirler",
        question: "Mənə niyə kredit vermədilər?",
        answer:
          "İmtinanın adətən bir neçə səbəbi olur: yüksək borc yükü, kredit tarixçəsində gecikmə, qeyri-sabit gəlir və ya bankın daxili qaydaları. Bank imtina səbəbini həmişə ətraflı açıqlamır. Naviodan istifadə edərək profilinizin zəif tərəflərini görüb, bir sonrakı müraciətdən əvvəl düzəldə bilərsiniz.",
        cta: { label: "Profilimi analiz et", href: "/az/kredit-yoxlama" },
      },
      {
        id: "maasim-azdir",
        question: "Maaşım azdır. Kredit ala bilərəm?",
        answer:
          "Bəli, mümkündür — amma kredit məbləği gəlirinizlə mütənasib olacaq. Aşağı gəlirlə adətən daha kiçik məbləğ və ya daha qısa müddət təklif olunur. Mövcud borclarınız yoxdursa, şansınız artır.",
        cta: { label: "Uyğun məbləği hesabla", href: "/az/calculators" },
      },
      {
        id: "resmi-gelirim-yoxdur",
        question: "Rəsmi gəlirim yoxdur. Mənə kredit düşür?",
        answer:
          "Rəsmi gəlir olmadan kredit almaq daha çətindir, çünki bank ödəmə qabiliyyətinizi təsdiqləyə bilmir. Bəzi banklar girov və ya zamin qarşılığında istisna edə bilər. Rəsmi gəlir mənbəyi (əmək müqaviləsi, VÖEN) əlavə etmək şansınızı əhəmiyyətli dərəcədə artırır.",
      },
      {
        id: "gecikmem-varsa-kredit-ala-bilerem",
        question: "Gecikməm varsa kredit ala bilərəm?",
        answer:
          "Kiçik və köhnə gecikmələr həmişə əngəl olmur, amma aktiv (davam edən) gecikmə çox banklar üçün çətinləşdirici amildir. Gecikməni bağlamaq və bir müddət təmiz tarixçə saxlamaq şansınızı yüksəldir.",
        cta: { label: "Kredit tarixçəmi yoxla", href: "/az/kredit-yoxlama" },
      },
      {
        id: "alave-gelir-nezere-alinacaq",
        question: "Rəsmi maaşım azdır, amma əlavə gəlirim var. Bank bunu nəzərə alacaq?",
        answer:
          "Sənədləşdirilə bilən əlavə gəlir (məsələn icarə haqqı, əlavə iş müqaviləsi) bəzi hallarda nəzərə alına bilər, amma bu bankdan banka dəyişir. Sənədsiz (\"əldən-ələ\") gəlir adətən rəsmi hesablamaya daxil edilmir.",
      },
    ],
  },
  {
    slug: "kredit-tarixcesi",
    name: "Kredit tarixçəsi",
    emoji: "📈",
    color: "#0BB07B",
    soft: "#E7F7F1",
    items: [
      {
        id: "ne-vaxt-temizlenecek",
        question: "Gecikməm var. Kredit tarixçəm nə vaxt təmizlənəcək?",
        answer:
          "Gecikmə bağlandıqdan sonra belə, məlumat müəyyən müddət kredit tarixçənizdə qalır. Dəqiq müddət gecikmənin növündən və müddətindən asılıdır. Vacib olan borcu tam bağlamaq və bundan sonra vaxtında ödəniş etməkdir — bu, tarixçənin təsirini tədricən azaldır.",
      },
      {
        id: "tarixce-yaxsilasdirmaq",
        question: "Kredit tarixçəmi necə yaxşılaşdıra bilərəm?",
        answer:
          "Ən effektiv yol: mövcud borcları vaxtında ödəmək, aktiv gecikmələri bağlamaq və yeni kreditlərə tez-tez müraciət etməmək. Kredit kartı limitini tam istifadə etməmək də profilinizə müsbət təsir edir.",
        cta: { label: "Profilimi izlə", href: "/az/kredit-yoxlama" },
      },
      {
        id: "tarixce-yoxlamaq",
        question: "Kredit tarixçəmi necə yoxlaya bilərəm?",
        answer:
          "Kredit tarixçənizi Azərbaycan Kredit Bürosunun (AKB) rəsmi portalından əldə edə bilərsiniz. Navio isə sizə bankın baxacağı əsas göstəriciləri (borc yükü, gecikmə statusu) ilkin olaraq göstərir.",
        cta: { label: "İlkin qiymətləndirməmi gör", href: "/az/kredit-yoxlama" },
      },
    ],
  },
  {
    slug: "gecikme-mehkeme",
    name: "Gecikmə və məhkəmə",
    emoji: "⚠️",
    color: "#D97706",
    soft: "#FEF3E2",
    items: [
      {
        id: "gecikmem-var-indi-ne-olacaq",
        question: "Gecikməm var. İndi nə olacaq?",
        answer:
          "Bank adətən əvvəlcə xatırlatma və bildirişlərlə əlaqə saxlayır. Gecikmə uzandıqca əlavə cərimə tətbiq oluna, kredit tarixçənizə mənfi qeyd düşə bilər. Ən doğru addım — bankla əlaqə saxlayıb ödəniş planı barədə danışmaqdır, gecikməni gizlətmək vəziyyəti pisləşdirir.",
      },
      {
        id: "gecikmeye-gore-hebs",
        question: "Gecikməyə görə məni həbs edə bilərlər?",
        answer:
          "Adi kredit gecikməsi özlüyündə həbslə nəticələnmir — bu, mülki-hüquqi məsələdir. Yalnız məhkəmə qərarından sonra icra prosedurları başlaya bilər. Konkret vəziyyətiniz üçün hüquqi məsləhət almağınız tövsiyə olunur.",
      },
      {
        id: "bank-evi-elimden-ala-biler",
        question: "Bank evimi və ya əmlakımı ala bilər?",
        answer:
          "Yalnız kredit girovla (məs. ipoteka) təmin olunubsa və məhkəmə qərarı varsa, girov əmlak icra vasitəsilə satıla bilər. Girovsuz adi kreditlərdə bu proses fərqlidir və birbaşa əmlakın alınması avtomatik baş vermir.",
      },
      {
        id: "maasdan-pul-tutula-biler",
        question: "Maaşımdan və ya kartımdan pul tuta bilərlər?",
        answer:
          "Bu, yalnız məhkəmə qərarı və icra icraatı çərçivəsində, qanunla müəyyən edilmiş həddə mümkündür. Bank özbaşına hesabınızdan pul çıxara bilməz — prosedur həmişə rəsmi icra orqanları vasitəsilə gedir.",
      },
    ],
  },
  {
    slug: "refinans",
    name: "Refinans",
    emoji: "🔄",
    color: "#7C3AED",
    soft: "#F1EBFE",
    items: [
      {
        id: "refinans-nedir",
        question: "Refinans nədir və mənə sərf edərmi?",
        answer:
          "Refinans — mövcud krediti daha əlverişli şərtlərlə (aşağı faiz, uzun müddət) yeni kreditlə əvəz etməkdir. Faiz dərəcələri düşübsə və ya aylıq ödənişiniz ağırdırsa, sərfəli ola bilər. Amma yeni kreditin komissiya və şərtlərini əvvəlkilərlə müqayisə etmək lazımdır.",
        cta: { label: "Yeni ödənişi hesabla", href: "/az/calculators" },
      },
      {
        id: "bir-nece-krediti-birlesdirmek",
        question: "Bir neçə krediti bir kreditdə birləşdirmək olar?",
        answer:
          "Bəli, bu bir növ konsolidasiya krediti adlanır — bir neçə borcunuzu tək aylıq ödənişə çevirir. Bu, borc idarəetməsini asanlaşdıra bilər, amma ümumi faiz xərcini diqqətlə hesablamaq vacibdir.",
      },
    ],
  },
  {
    slug: "ipoteka",
    name: "İpoteka",
    emoji: "🏠",
    color: "#0E9F6E",
    soft: "#E7F8F1",
    items: [
      {
        id: "ipoteka-ala-bilerem",
        question: "Mən ipoteka ala bilərəm?",
        answer:
          "İpoteka üçün sabit rəsmi gəlir, ilkin ödəniş imkanı (adətən əmlak dəyərinin bir hissəsi) və qənaətbəxş kredit tarixçəsi əsas amillərdir. Şərtlər bankdan banka fərqlənir.",
        cta: { label: "İpoteka şərtlərimi hesabla", href: "/az/calculators/mortgage" },
      },
      {
        id: "dovlet-ve-bank-ipoteka-ferqi",
        question: "Dövlət ipotekası ilə bank ipotekasının fərqi nədir?",
        answer:
          "Dövlət (güzəştli) ipoteka proqramları adətən daha aşağı faiz və xüsusi şərtlərlə təqdim olunur, amma müəyyən meyarlara (məs. gəlir həddi, ilk mənzil) uyğunluq tələb edir. Bank ipotekası isə bankın öz kommersiya şərtləri ilə verilir və tələblər daha çevik ola bilər.",
      },
      {
        id: "ipoteka-odeye-bilmesem",
        question: "İpoteka kreditini ödəyə bilməsəm, bank evi əlimdən ala bilər?",
        answer:
          "İpoteka girovlu kredit olduğu üçün uzun müddətli ciddi gecikmə halında bank qanuni prosedurla (məhkəmə/icra) girov əmlakın satışına başlaya bilər. Ödəniş çətinliyi yaranarsa, bankla əvvəlcədən əlaqə saxlayıb ödəniş planının dəyişdirilməsini müzakirə etmək ən doğru addımdır.",
      },
    ],
  },
  {
    slug: "avtokredit",
    name: "Avtokredit",
    emoji: "🚗",
    color: "#DB2777",
    soft: "#FCE7F3",
    items: [
      {
        id: "avtokredit-nece-isleyir",
        question: "Avtokredit necə işləyir?",
        answer:
          "Avtokreditdə avtomobil adətən kreditin girovu olur. Siz ilkin ödəniş edir, qalan məbləği isə aylıq ödənişlərlə banka qaytarırsınız. Şərtlər avtomobilin yeni/işlənmiş olmasından və dəyərindən asılı dəyişir.",
        cta: { label: "Avtokredit ödənişimi hesabla", href: "/az/calculators/auto-loan" },
      },
      {
        id: "avtokredit-odeye-bilmesem",
        question: "Avtokrediti ödəyə bilməsəm, bank maşını əlimdən ala bilər?",
        answer:
          "Avtomobil kreditin girovu olduğu üçün ciddi gecikmə halında bank qanuni prosedurla girovu (avtomobili) tələb edə bilər. Çətinlik yaranarsa, bankla ödəniş planının yenidən qurulmasını müzakirə etmək tövsiyə olunur.",
      },
    ],
  },
  {
    slug: "faydali-meslehetler",
    name: "Faydalı məsləhətlər",
    emoji: "💡",
    color: "#EA580C",
    soft: "#FFEDD5",
    items: [
      {
        id: "vaxtindan-evvel-baglamaq",
        question: "Krediti vaxtından əvvəl bağlamaq sərfəlidirmi?",
        answer:
          "Adətən bəli — çünki qalan faiz xərclərindən qənaət edirsiniz. Amma bəzi kreditlərdə erkən ödəniş üçün kiçik komissiya ola bilər, ona görə əvvəlcədən müqavilə şərtlərini yoxlamaq lazımdır.",
        cta: { label: "Qənaətimi hesabla", href: "/az/calculators/consumer-loan" },
      },
      {
        id: "muddet-ve-odenis-azaltmaq",
        question: "Müddəti azaltmaq sərfəlidir, yoxsa aylıq ödənişi azaltmaq?",
        answer:
          "Müddəti azaltmaq ümumi faiz xərcini daha çox aşağı salır, amma aylıq ödəniş bir müddət eyni qalır. Aylıq ödənişi azaltmaq isə gündəlik büdcəni rahatlaşdırır, lakin ümumi ödədiyiniz faiz məbləği bir qədər çox olur. Seçim maliyyə prioritetinizdən asılıdır.",
      },
    ],
  },
];

export const allQuestions = categories.flatMap((c) =>
  c.items.map((i) => ({ ...i, category: c.name, categorySlug: c.slug, emoji: c.emoji, color: c.color, soft: c.soft })),
);
