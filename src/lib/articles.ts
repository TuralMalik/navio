export interface Article {
  slug: string;
  title: string;
  summary: string;
  category: string;
  readingTime: number;
  content: string;
  warning?: string;
  relatedTool?: { label: string; href: string };
}

export const articles: Article[] = [

  // ── 1. Kredit profili və kredit tarixçəsi ──────────────────────────────

  {
    slug: "kredit-tarixcesi-nedir",
    title: "Kredit tarixçəsi nədir?",
    summary: "Kredit tarixçəniz bankın keçmişdəki ödəniş davranışınızı gördüyü rəsmi qeyddir.",
    category: "Kredit tarixçəsi",
    readingTime: 1,
    content: `Kredit tarixçəsi əvvəlki kreditlər üzrə ödənişlərinizin, gecikmələrinizin və bağlanmış borcların qeydidir. Bank bu məlumatı Azərbaycan Kredit Bürosundan (AKB) avtomatik yoxlayır. 30 gündən çox gecikmə kredit profilinizi ciddi aşağı salır. Vaxtında ödəniş etmək ən sadə və effektiv yaxşılaşma üsuludur.`,
    relatedTool: { label: "Kredit profilinizi yoxlayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "kredit-profili-nedir",
    title: "Kredit profili nədir?",
    summary: "Kredit profili bankın kredit qərarında nəzərə aldığı bütün amillərin (gəlir, borc yükü, tarixçə, yaş) ümumi mənzərəsidir.",
    category: "Kredit tarixçəsi",
    readingTime: 1,
    content: `Kredit profili yalnız kredit tarixçəsindən ibarət deyil — gəlir, borc yükü, iş stajı, yaş və kredit tarixçəsini birləşdirən ümumi mənzərədir. Bank kredit qərarı verərkən bu amillərin hamısını birlikdə qiymətləndirir. Navio bu profilin ilkin qiymətləndirməsini pulsuz verir — siz müraciətdən əvvəl güclü və zəif tərəflərinizi bilirsiniz.`,
    relatedTool: { label: "Profilinizi yoxlayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "kredit-tarixcesi-ile-profil-ferqi",
    title: "Kredit tarixçəsi ilə kredit profili arasında fərq nədir?",
    summary: "Tarixçə keçmişinizi, profil isə hazırkı tam maliyyə vəziyyətinizi əks etdirir.",
    category: "Kredit tarixçəsi",
    readingTime: 1,
    content: `Kredit tarixçəsi keçmiş ödəniş davranışınızdır — kredit bürosunda saxlanılır. Kredit profili isə daha genişdir: tarixçəyə əlavə olaraq gəlir, borc yükü, yaş və iş stajınızı da əhatə edir. Bank hər ikisini birlikdə nəzərə alır. İki şəxsin tarixçəsi eyni olsa belə, fərqli gəlir və borc yükü profili fərqli kredit qərarına yol aça bilər.`,
  },

  {
    slug: "kredit-tarixcesini-haradan-yoxlamaq",
    title: "Kredit tarixçəmi haradan yoxlaya bilərəm?",
    summary: "Azərbaycan Kredit Bürosunun (AKB) rəsmi portalından öz hesabatınızı ala bilərsiniz.",
    category: "Kredit tarixçəsi",
    readingTime: 1,
    content: `Kredit tarixçənizi Azərbaycan Kredit Bürosunun (AKB) rəsmi saytından yoxlaya bilərsiniz — şəxsiyyət məlumatlarınızla qeydiyyat keçmək kifayətdir. Hesabatda aktiv kreditlər, bağlanmış kreditlər və gecikmiş günlər göstərilir. Kredit müraciətindən əvvəl bu hesabatı almaq tövsiyə olunur.`,
    warning: "Üçüncü tərəf saytlardan kredit bürosu xidməti almayın — yalnız rəsmi AKB portalından istifadə edin.",
  },

  {
    slug: "kredit-skoru-nedir",
    title: "Kredit skoru nədir və necə formalaşır?",
    summary: "Kredit skoru bankın qərarını asanlaşdırmaq üçün hesablanmış rəqəmsal qiymətdir.",
    category: "Kredit tarixçəsi",
    readingTime: 1,
    content: `Kredit skoru ödəniş tarixi, borc yükü, kredit tarixçəsinin uzunluğu və yeni müraciətlər kimi amillər əsasında formalaşır. Gecikmiş ödəniş skoru ən çox aşağı salan faktordu. Navio 0–100 arası ilkin qiymətləndirmə verir — bu rəsmi kredit skoru deyil, lakin müraciətdən əvvəl hazırlıq üçün faydalıdır.`,
    relatedTool: { label: "Skor hesablamasını yoxlayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "kredit-tarixcesi-olmayan-kredit-ala-bilermi",
    title: "Kredit tarixçəsi olmayan şəxs kredit ala bilər?",
    summary: "Bəli, mümkündür — lakin bank əlavə tələblər qoya bilər.",
    category: "Kredit tarixçəsi",
    readingTime: 1,
    content: `Tarixçəsiz şəxslər kredit ala bilər, lakin bank bu halda gəlir sabitliyinə, iş stajına və rəsmi gəlirə daha çox diqqət yetirir. Maaş kartı olan bankdan müraciət etmək prosesi asanlaşdırır. Kiçik məbləğli kredit götürüb vaxtında bağlamaq tarixçə qurmağın ən sürətli yoludur.`,
  },

  {
    slug: "pis-kredit-tarixcesi-necə-duzəlir",
    title: "Pis kredit tarixçəsi necə düzəlir?",
    summary: "Birbaşa silmək olmur — lakin vaxtında ödənişlər zamanla mənfi qeydin təsirini azaldır.",
    category: "Kredit tarixçəsi",
    readingTime: 1,
    content: `Kredit tarixçəsini silmək mümkün deyil. Düzəliş üçün ilk addım aktiv gecikmiş borcu bağlamaqdır. Sonra yeni kreditlər üzrə vaxtında ödənişlər etmək lazımdır — 12–24 ay nizamlı ödəniş profili ciddi yaxşılaşdırır.`,
    warning: "Kredit tarixçəsini düzəltmək vəd edən kənar xidmətlərə inanmayın — bu texniki olaraq mümkün deyil.",
  },

  {
    slug: "kredit-tarixcesinde-sehv-melumat",
    title: "Kredit tarixçəsində səhv məlumat varsa, nə etməliyəm?",
    summary: "AKB-yə yazılı müraciət edib düzəldilməsini tələb edə bilərsiniz.",
    category: "Kredit tarixçəsi",
    readingTime: 1,
    content: `Kredit bürosundan hesabat alın, səhv məlumatı müəyyənləşdirin və ödəniş çeki ya bank arayışı kimi sübutla AKB-yə yazılı müraciət edin. Büro adətən 30 iş günü ərzində araşdırıb cavab verir.`,
  },

  {
    slug: "gecikme-kredit-tarixcesine-tesiri",
    title: "Gecikmə kredit tarixçəsinə necə təsir edir?",
    summary: "Gecikmə nə qədər uzun olsa, mənfi təsiri bir o qədər ciddi olur.",
    category: "Kredit tarixçəsi",
    readingTime: 1,
    content: `1–30 günlük gecikmə orta risk, 31–90 gün yüksək risk, 90+ gün isə kritik risk kimi qiymətləndirilir. Gecikməni bağlasanız aktiv qeyd sona çatır, lakin tarixçədəki iz silinmir. Banklar xüsusilə son 6 aydakı gecikməyə diqqət yetirir.`,
    relatedTool: { label: "Kredit profilinizi yoxlayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "bank-kredit-tarixceni-raziligsiz-gore-bilermi",
    title: "Bank kredit tarixçəmi mənim razılığım olmadan görə bilər?",
    summary: "Xeyr. Müraciət formasını imzalayana qədər bank kredit bürosuna sorğu göndərə bilməz.",
    category: "Kredit tarixçəsi",
    readingTime: 1,
    content: `Bank kredit tarixçənizi yalnız sizin yazılı razılığınızdan sonra yoxlaya bilər — bu adətən müraciət formasını imzaladığınız anda olur. Qısa müddətdə bir neçə bankda eyni vaxtda müraciət etmək "hard sorğuların" sayını artırır və kredit profilinizə kiçik mənfi təsir göstərə bilər.`,
  },

  // ── 2. Bank kreditdən niyə imtina edə bilər? ──────────────────────────

  {
    slug: "bank-niye-redd-ede-biler",
    title: "Bank niyə kreditdən imtina edə bilər?",
    summary: "Yüksək borc yükü, qısa staj, gecikmiş ödənişlər, yaş məhdudiyyəti və ya gəlirin sənədləndirilməməsi ən çox rast gəlinən səbəblərdir.",
    category: "Bank tələbləri",
    readingTime: 1,
    content: `Banklar borc yükü 70%-i keçdikdə, iş stajı 6 aydan az olduqda, kredit tarixçəsində ciddi gecikmə olduqda və ya gəlir sənədləndirilmədikdə müraciəti rədd edir. Kredit müddətinin sonunda yaşın 73-ü keçməsi də bloklaşdırıcı şərtdir. Müraciətdən əvvəl Navio ilə bu amilləri yoxlamaq imtina riskini azaldır.`,
    relatedTool: { label: "Profilinizi yoxlayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "maasim-var-niye-kredit-vermirler",
    title: "Maaşım var, niyə kredit vermirlər?",
    summary: "Maaş tək başına kifayət deyil — borc yükü, staj, tarixçə və kredit kartı limiti də vacibdir.",
    category: "Bank tələbləri",
    readingTime: 1,
    content: `Maaşınız olsa belə, aktiv kreditlər borc yükünü 70%-dən yuxarı çıxarırsa bank rədd edir. Qısa iş stajı, pis kredit tarixçəsi və ya çox yüksək kredit kartı limiti də rədd səbəbi ola bilər. Navio kalkulyatoru ilə hansı amil problem yaratdığını dəqiq görə bilərsiniz.`,
    relatedTool: { label: "Profilinizi yoxlayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "resmi-gelir-yoxdur-kredit-ala-bilerem",
    title: "Rəsmi gəlirim yoxdur, kredit ala bilərəm?",
    summary: "Çətin, lakin bəzi seçimlər var — əmanət giovu, zamin və ya NBKO.",
    category: "Bank tələbləri",
    readingTime: 1,
    content: `Rəsmi gəlir olmadan bank kreditləri demək olar ki, əlçatmazdır. Bankdakı əmanətinizi giov kimi göstərməklə gəlir tələbi aradan qalxır. Zamin göstərmək də variantdır. Kiçik məbləğlər (≤500 AZN) üçün NBKO-lar gəlir sənədi tələb etmir — lakin faiz çox yüksəkdir.`,
    relatedTool: { label: "NBKO seçimini yoxlayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "gecikmeyim-yoxdur-niye-redd",
    title: "Gecikməm yoxdur, amma niyə imtina aldım?",
    summary: "Gecikməsiz tarixçə zəruri, lakin kifayət deyil — borc yükü, staj və gəlir sənədi də yoxlanılır.",
    category: "Bank tələbləri",
    readingTime: 1,
    content: `Gecikməsiz kredit tarixçəsi kreditin şərtlərindən yalnız biridir. Borc yükünüz 70%-i keçibsə, iş stajınız qısadırsa, ya da gəlirinizi rəsmi sənədlə göstərə bilmirsinizsə — bank rədd edə bilər. Kredit kartı limitinin gəlirin 5 mislindən çox olması da bloklaşdırıcı amildir.`,
    relatedTool: { label: "Problemi müəyyən edin", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "redd-sonra-ne-vaxt-yeniden-muraciet",
    title: "Kredit müraciəti rədd ediləndən sonra nə vaxt yenidən müraciət etmək olar?",
    summary: "Rədd səbəbini aradan qaldırdıqdan sonra — adətən 3–6 ay gözləmək tövsiyə olunur.",
    category: "Bank tələbləri",
    readingTime: 1,
    content: `Dərhal yenidən müraciət etməyin — hər sorğu kredit tarixçənizə "hard sorğu" kimi düşür. Rədd səbəbini (borc yükü, staj, gecikmə) aradan qaldırdıqdan sonra 3–6 ay sonra müraciət edin. Bir bankın rəddi bütün bankların rədd edəcəyi anlamına gəlmir — kredit siyasəti bankdan banka fərqlənir.`,
  },

  {
    slug: "bank-imtina-sebebini-demelidiirmi",
    title: "Bank imtina səbəbini deməlidirmi?",
    summary: "Azərbaycanda banklar səbəbi açıqlamağa hüquqi məcburiyyəti yoxdur.",
    category: "Bank tələbləri",
    readingTime: 1,
    content: `Banklar kredit rəddinin səbəbini bildirməyə məcbur deyil, lakin bəziləri könüllü izahat verir. AKB-dən öz kredit hesabatınızı istəyərək problemi özünüz analiz edə bilərsiniz. Navio kalkulyatoru da borc yükü, staj, yaş kimi amilləri avtomatik yoxlayır.`,
    relatedTool: { label: "Profilinizi özünüz yoxlayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "kredit-ucun-minimum-maas",
    title: "Kredit almaq üçün minimum maaş nə qədər olmalıdır?",
    summary: "Konkret minimum məbləğ yoxdur — əsas şərt borc yükünün 70%-dən aşağı olmasıdır.",
    category: "Bank tələbləri",
    readingTime: 1,
    content: `Banklar minimum maaş həddi müəyyən etmir — əsas götürülən göstərici borc yüküdür. Qayda sadədir: yeni kreditin aylıq ödənişi + mövcud ödənişlər ≤ gəlirin 70%-i. Məsələn, 5000 AZN, 24 ay kredit üçün aylıq ödəniş ≈255 AZN, bu kredit üçün minimum gəlir ≈365 AZN.`,
    relatedTool: { label: "Öz hesablamanızı edin", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "bank-kredit-qerarinda-hansi-melumatlar",
    title: "Bank kredit qərarı verərkən hansı məlumatlara baxır?",
    summary: "Borc yükü, kredit tarixçəsi, gəlir növü, iş stajı, yaş, kredit məbləği və müddəti.",
    category: "Bank tələbləri",
    readingTime: 1,
    content: `Bank kredit qərarında borc yükü (BGN), kredit tarixçəsi, gəlirin növü və həcmi, iş stajı, yaş, kredit məbləği, müddəti və zamin/girov varlığını nəzərə alır. Bu amillərin hamısı birlikdə qiymətləndirilir — biri problematikdirə qərar mənfi ola bilər.`,
    relatedTool: { label: "Bu amilləri özünüz analiz edin", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "aktiv-kreditler-yeni-kreditə-tesiri",
    title: "Aktiv kreditlər yeni kredit almağa necə təsir edir?",
    summary: "Aktiv kreditlər borc yükünü artırır — bu yeni kredit üçün qalan limiti azaldır.",
    category: "Bank tələbləri",
    readingTime: 1,
    content: `Bank yeni kredit müraciətini qiymətləndirərkən aktiv kredit ödənişlərini mövcud yükə daxil edir. Yeni kreditin aylıq ödənişini əlavə etdikdən sonra BGN 70%-i keçirsə — rədd. Yeni kredit götürməzdən əvvəl kiçik aktiv borcları bağlamaq BGN-i aşağı salır.`,
    relatedTool: { label: "BGN-inizi hesablayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "is-staji-kredit-qerarina-tesiri",
    title: "İş stajı kredit qərarına necə təsir edir?",
    summary: "İş stajı gəlirin sabitliyini göstərir. Çox banklar cari iş yerindəki minimum 6 ay staj tələb edir.",
    category: "Bank tələbləri",
    readingTime: 1,
    content: `İş stajı bankın gəlirin davamlı olacağından əmin olmaq üçün baxdığı amildir. 12+ ay əla, 6–11 ay qəbul edilən, 3 aydan az isə kredit riskini artıran kateqoriya hesab olunur. FŞ (VÖEN) sahibləri üçün minimum staj adətən 12 aydır. Yeni işə başlayıbsınızsa — 6–12 ay gözlədikdən sonra müraciət etmək daha sərfəlidir.`,
  },

  // ── 3. Borc yükü və gəlir ──────────────────────────────────────────────

  {
    slug: "borc-yuku-nedir",
    title: "Borc yükü nədir?",
    summary: "Borc yükü aylıq gəlirinizin kredit ödənişlərinə yönəldilən faizini göstərir.",
    category: "Borc yükü",
    readingTime: 1,
    content: `Borc yükü (BGN) = Aylıq kredit ödənişləri ÷ Aylıq xalis gəlir × 100. Məsələn, gəlir 1500 AZN, ödənişlər 450 AZN olarsa — BGN 30%. Banklar bu göstəricinin 70%-dən aşağı olmasını tələb edir. 30%-dən aşağı ideal, 30–45% qəbul edilən, 45–70% yüksək risk sayılır.`,
    relatedTool: { label: "BGN kalkulyatoru", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "bgn-nedir",
    title: "BGN nədir?",
    summary: "BGN — Borc-Gəlir Nisbəti. Bankın kredit qərarında istifadə etdiyi əsas göstəricidir.",
    category: "Borc yükü",
    readingTime: 1,
    content: `BGN (Borc-Gəlir Nisbəti) = bütün aylıq kredit ödənişlərinin aylıq xalis gəlirə nisbətidir. Azərbaycanda banklar 70% həddini tətbiq edir — bu həddi keçdikdə müraciət rədd olunur. Yeni kredit üçün mövcud ödənişlərə yeni kreditin annuitet ödənişi əlavə edilib yenidən hesablanır.`,
    relatedTool: { label: "BGN-inizi hesablayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "borc-yuku-necə-hesablanir",
    title: "Borc yükü necə hesablanır?",
    summary: "Bütün kredit ödənişlərini toplayın, aylıq xalis gəlirinizə bölün, 100-ə vurun.",
    category: "Borc yükü",
    readingTime: 1,
    content: `BGN = (Mövcud aylıq ödənişlər + Yeni kreditin aylıq ödənişi) ÷ Aylıq xalis gəlir × 100. Yeni kreditin aylıq ödənişi annuitet formulası ilə hesablanır. Nümunə: gəlir 1000 AZN, mövcud ödəniş 150 AZN, yeni kredit ödənişi 255 AZN → BGN = (150+255)/1000×100 = 40.5%.`,
    relatedTool: { label: "Kalkulyatorda hesablayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "borc-yuku-nece-faiz-olmali",
    title: "Borc yükü neçə faiz olsa yaxşıdır?",
    summary: "30%-dən aşağı ideal, 70% isə bankların tətbiq etdiyi hədddir.",
    category: "Borc yükü",
    readingTime: 1,
    content: `Borc yükü 30%-dən aşağıdırsa — ideal; 30–45% — yaxşı, adətən kredit verilir; 45–60% — risk var, bəzi banklar şərtə baxar; 60–70% — kredit çətin; 70%+ — banklar kredit vermir. Kredit götürməzdən əvvəl BGN-in 45%-dən aşağı olmasına çalışın.`,
    relatedTool: { label: "BGN-inizi yoxlayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "yeni-kredit-borc-yukunu-necə-dəyişir",
    title: "Yeni kredit borc yükümü necə dəyişir?",
    summary: "Yeni kreditin aylıq ödənişi mövcud ödənişlərə əlavə olunur — BGN artır.",
    category: "Borc yükü",
    readingTime: 1,
    content: `Yeni kredit götürdükdə onun aylıq ödənişi mövcud ödənişlərə əlavə olunaraq yeni BGN hesablanır. Müddəti uzatmaq aylıq ödənişi azaldır (BGN aşağı düşür), lakin ümumi faiz xərci artır. Məbləği azaltmaq isə həm BGN-i, həm də ümumi xərci azaldır.`,
    relatedTool: { label: "Yeni BGN-i hesablayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "maasin-nece-faizi-kreditə-gedə-biler",
    title: "Maaşımın neçə faizi kreditə gedə bilər?",
    summary: "Banklar maksimum 70% icazə verir. Tövsiyə olunan hədd 30–45%-dir.",
    category: "Borc yükü",
    readingTime: 1,
    content: `Azərbaycanda banklar maaşın maksimum 70%-ni kredit ödənişinə yönəltməyə icazə verir. Lakin 30–45% daha sağlam maliyyə profili üçün tövsiyə olunan hədddir — bu sizə gözlənilməz xərcləri qarşılamaq üçün ehtiyat buraxır. 70%-ə yaxın BGN hər hansı gəlir itkisini böhrana çevirə bilər.`,
  },

  {
    slug: "borc-yuku-yuksekdirse-ne-etmeli",
    title: "Borc yükü yüksəkdirsə, nə etməliyəm?",
    summary: "Kiçik kreditləri bağlayın, kart limitini azaldın, kredit məbləğini ya da müddəti dəyişin.",
    category: "Borc yükü",
    readingTime: 1,
    content: `BGN-i azaltmaq üçün: 1) kiçik aktiv kreditləri bağlayın — bu birbaşa BGN-i aşağı salır; 2) istifadəsiz kredit kartı limitlərini azaldın; 3) götürmək istədiyiniz kreditin müddətini uzadın — aylıq ödəniş azalır; 4) məbləği azaldın. Əmanət giovu varsa, BGN tələbi tamamilə aradan qalxır.`,
    relatedTool: { label: "Yeni BGN-i hesablayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "movcud-kredit-odenisleri-yeni-kreditə-tesiri",
    title: "Mövcud kredit ödənişləri yeni kreditə necə təsir edir?",
    summary: "Mövcud ödənişlər BGN hesablamasına daxil edilir — yeni kredit üçün qalan yer azalır.",
    category: "Borc yükü",
    readingTime: 1,
    content: `Bank yeni kredit üçün "yer" hesablayarkən mövcud ödənişlərə baxır. Gəlir 1000 AZN, 70% hədd 700 AZN, mövcud ödəniş 400 AZN isə — yeni kredit üçün cəmi 300 AZN/ay yer qalır. Mövcud borcları azaltmaq yeni kredit götürmək üçün ən effektiv yoldur.`,
  },

  {
    slug: "kredit-karti-limiti-borc-yukune-tesiri",
    title: "Kredit kartı limiti borc yükünə təsir edir?",
    summary: "Bəli — bəzi banklar aktiv kartın limitini istifadəsindən asılı olmayaraq BGN-ə daxil edir.",
    category: "Borc yükü",
    readingTime: 1,
    content: `Bəzi banklar kredit kartının limitini istifadə etməsəniz belə potensial borc kimi hesablayır. Kartın limiti gəlirin 5 mislini keçibsə — kredit verilmir. İstifadə etmədiyiniz kartların limitini azaltmaq və ya kartı bağlamaq yeni kredit müraciəti üçün BGN-i yaxşılaşdırır.`,
    relatedTool: { label: "BGN hesablamasını yoxlayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "borc-yuku-70-den-yuxari-ne-bas-verir",
    title: "Borc yükü 70%-dən yuxarıdırsa, nə baş verir?",
    summary: "Banklar müraciəti rədd edir. NBKO, əmanət giovu və ya kiçik məbləğ seçimləri mövcuddur.",
    category: "Borc yükü",
    readingTime: 1,
    content: `BGN 70%+ olduqda banklar kredit vermir. Seçimlər: daha kiçik məbləğ götürmək (BGN düşər), aktiv borcları bağlamaq, əmanəti giov kimi göstərmək (BGN tələbi tətbiq edilmir) və ya NBKO-ya müraciət etmək. NBKO-da BGN həddi yoxdur, lakin faiz çox yüksəkdir.`,
    relatedTool: { label: "NBKO seçimini yoxlayın", href: "/az/kredit-yoxlama" },
  },

  // ── 4. Gecikmə və problemli kreditlər ────────────────────────────────

  {
    slug: "kredit-gecikme-ne-vaxt-problem",
    title: "Kredit gecikməsi nə vaxt problem yaradır?",
    summary: "30 gün hədd sayılır — bu həddən sonra bank ciddi risk kimi qiymətləndirir.",
    category: "Gecikmə",
    readingTime: 1,
    content: `Texniki olaraq gecikmiş ilk gündən kredit bürosuna qeyd edilə bilər. Lakin banklar üçün ciddi hədd 30 gündür — bu həddən sonra kredit tarixçənizə mühüm mənfi qeyd düşür. 90+ gün isə kreditin "problemli" statusuna keçdiyi hədddir — hüquqi addımlar başlaya bilər.`,
    relatedTool: { label: "Kredit profilinizi yoxlayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "bir-gunluk-gecikme-kredit-tarixcesine-dusur",
    title: "1 günlük gecikmə kredit tarixçəsinə düşür?",
    summary: "Texniki olaraq mümkündür, lakin banklar üçün ciddi hədd adətən 30 gündür.",
    category: "Gecikmə",
    readingTime: 1,
    content: `1–5 günlük kiçik gecikmə texniki olaraq qeydə alına bilər, lakin banklar kredit müraciətini qiymətləndirərkən buna böyük əhəmiyyət vermir. 30 günlük hədd ciddi sayılır. Bununla belə, ödəniş tarixini izləmək və gecikməni mümkün qədər tez bağlamaq tövsiyə olunur.`,
  },

  {
    slug: "gecikme-baglanim-kredit-tarixce-duzələcekmi",
    title: "Gecikməni bağlasam, kredit tarixçəm düzələcək?",
    summary: "Aktiv gecikmə sona çatır — amma tarixçədəki iz qalır. Yeni vaxtında ödənişlər zamanla fərq yaradır.",
    category: "Gecikmə",
    readingTime: 1,
    content: `Gecikməni bağlamaq mühüm addımdır: aktiv qeyd sona çatır, cərimə artımı dayanır. Lakin kredit bürosundakı gecikmə qeydi silinmir. Bağlandıqdan sonra 12–24 ay vaxtında ödəniş etmək mənfi qeydin təsirini tədricən azaldır.`,
  },

  {
    slug: "cari-gecikme-kredit-almaq-mumkundurmu",
    title: "Cari gecikmə varsa, kredit almaq mümkündür?",
    summary: "Xeyr — aktiv gecikməsi olan şəxslərə banklar kredit vermir.",
    category: "Gecikmə",
    readingTime: 1,
    content: `Aktiv gecikməsi olan şəxslərə banklar demək olar ki, heç vaxt kredit vermir — bu mövcud ödəniş çətinliyi olduğunu göstərir. Yeganə istisna: əmanəti giov kimi göstərməklə bank kreditinə müraciət. İlk addım aktiv gecikməni bağlamaqdır, sonra 3–6 ay gözləyib yenidən müraciət etmək daha effektivdir.`,
  },

  {
    slug: "son-6-ayda-gecikme-kreditə-tesiri",
    title: "Son 6 ayda gecikmə kreditə necə təsir edir?",
    summary: "Son 6 ay bankın ən çox diqqət etdiyi dövrdür — bu müddətdəki gecikmə müraciəti ciddi zəiflətir.",
    category: "Gecikmə",
    readingTime: 1,
    content: `Bank hazırkı maliyyə vəziyyətinizin göstəricisi kimi son 6 aydakı ödəniş davranışına xüsusi diqqət yetirir. Navio qiymətləndirməsində son 6 ayda gecikmə yoxdursa 10 bal, varsa 0 bal verilir. Kredit müraciətindən 6 ay əvvəl bütün ödənişləri vaxtında etmək profili ciddi yaxşılaşdırır.`,
  },

  {
    slug: "30-gunluk-gecikme-nedir",
    title: "30 gündən çox gecikmə nə deməkdir?",
    summary: "30 gün bank üçün ciddi hədddir — bu andan mənfi qeyd kredit tarixçəsinə daxil olur.",
    category: "Gecikmə",
    readingTime: 1,
    content: `30 günlük gecikmə kredit sənayesinin qəbul etdiyi ciddi hədddir: kredit bürosuna mühüm mənfi qeyd düşür, cərimə faizi artmağa davam edir, bank hüquqi tədbirlərə hazırlana bilər. Bu həddə çatmadan gecikməni bağlamaq zərəri xeyli azaldır.`,
  },

  {
    slug: "90-gunluk-gecikme-ciddi-risk",
    title: "90 gündən çox gecikmə niyə ciddi risk sayılır?",
    summary: "90+ gün kreditin 'problemli' statusuna keçdiyi hədddir — uzunmüddətli kredit tarixçəsi ziyanına yol açır.",
    category: "Gecikmə",
    readingTime: 1,
    content: `90+ gün gecikmiş kredit beynəlxalq standartlara görə NPL (işlənməyən kredit) sayılır. Bank maksimum cərimə tətbiq edir, hüquqi icraat başlana bilər, borcun tahsil şirkətinə verilmə riski yaranır. 90 günə çatmadan bankla restrukturizasiya müzakirəsi ən effektiv önləyici addımdır.`,
  },

  {
    slug: "kredit-gecikme-cerime-hesablanmasi",
    title: "Kredit gecikməsinə görə cərimə necə hesablanır?",
    summary: "Gecikmiş məbləğin gündəlik faizi olaraq hesablanır — müqavilədə göstərilir.",
    category: "Gecikmə",
    readingTime: 1,
    content: `Cərimə = Gecikmiş məbləğ × Günlük cərimə faizi × Gecikmə günü. Məsələn: 200 AZN gecikmiş ödəniş, 0.1% gündəlik cərimə, 15 gün = 3 AZN cərimə. Bu məbləğ hər gün artmağa davam edir, buna görə gecikməni mümkün qədər tez bağlamaq lazımdır.`,
  },

  {
    slug: "gecikmiş-kredit-restrukturizasiya",
    title: "Gecikmiş kredit restrukturizasiya edilə bilər?",
    summary: "Bəli — banklar bəzən müddəti uzadır, ödəniş güzəşti verir. Erkən müraciət vacibdir.",
    category: "Gecikmə",
    readingTime: 1,
    content: `Restrukturizasiya bankla ödəniş şərtlərinin yenidən razılaşdırılmasıdır: müddətin uzadılması, ödəniş güzəşti ya kredit tətili. Gecikməyə düşməzdən əvvəl (işini itirmə, xəstəlik kimi hallarda) bankla əlaqə qurmaq ən sərfəli seçimdir. Bank tamamilə ödəyə bilməyən müştəriyə restrukturizasiya məsləhət verir.`,
  },

  {
    slug: "problemli-kredit-yeni-kredit-almaga-tesiri",
    title: "Problemli kredit yeni kredit almağa necə təsir edir?",
    summary: "Aktiv problemli kredit varsa, banklar yeni kredit vermir. Bağlandıqdan sonra da effekt 1–3 il davam edə bilər.",
    category: "Gecikmə",
    readingTime: 1,
    content: `Aktiv problemli (NPL) kredit olduqda banklar yeni kredit vermir — əmanət giovu yeganə real seçimdir. Bağlandıqdan sonra belə kredit tarixçəsindəki iz silinmir və banklar 1–3 il bu şəxsi yüksək risk kimi görə bilər. Bərpa üçün: borcu bağla, 6–12 ay nizamlı ödəniş et, kiçik kredit götür və vaxtında bağla.`,
  },

  // ── 5. Kredit kartı və kredit xətti ──────────────────────────────────

  {
    slug: "kredit-karti-limiti-necə-hesablanir",
    title: "Kredit kartı limiti necə hesablanır?",
    summary: "Adətən aylıq gəlirin 1–3 misli həcmindədir. Kredit tarixçəsi yaxşıdırsa daha yüksək olur.",
    category: "Kredit kartı",
    readingTime: 1,
    content: `Kredit kartı limiti = Aylıq xalis gəlir × K əmsalı (adətən 1–3). Kredit tarixçəsi yaxşı olduqca əmsal artır. Limiti gəlirin 5 mislindən çox olan müştərilərə bir çox bank yeni kredit vermir. İlk kartda aşağı limit verilir, vaxtında ödənişlər sonradan limiti artırmağa imkan yaradır.`,
    relatedTool: { label: "BGN hesablamasını yoxlayın", href: "/az/kredit-yoxlama" },
  },

  {
    slug: "kredit-xetti-nedir",
    title: "Kredit xətti nədir?",
    summary: "Müəyyən hədd çərçivəsində istədiğiniz vaxt götürüb qaytara biləcəyiniz çevik kredit formasıdır.",
    category: "Kredit kartı",
    readingTime: 1,
    content: `Kredit xətti müəyyən limit çərçivəsində istənilən vaxt istifadə edilib, qaytarılıb yenidən istifadə edilə bilən kreditdir. Kredit kartı da əslində kredit xəttinin bir formasıdır. İstifadə etdiyiniz məbləğ üzrə faiz ödəyirsiniz, qaytardıqda isə limit yenidən açılır.`,
  },

  {
    slug: "kredit-karti-ile-istehlak-kreditinin-ferqi",
    title: "Kredit kartı ilə istehlak krediti arasında fərq nədir?",
    summary: "İstehlak krediti sabit aylıq ödənişli bir dəfəlik məbləğdir. Kredit kartı isə dönüşlü limitdir.",
    category: "Kredit kartı",
    readingTime: 1,
    content: `İstehlak krediti bir dəfə götürülür, sabit aylıq ödənişlə qaytarılır, adətən daha aşağı faizlidir. Kredit kartı dönüşlüdür — istifadə edib qaytarıb yenidən istifadə edirsiniz; lakin ödəniş gecikdirildikdə faiz çox yüksəkdir (30–50%+). Böyük alışlar üçün istehlak krediti, gündəlik xərclər üçün (vaxtında ödənmək şərtiylə) kart daha sərfəlidir.`,
  },

  {
    slug: "kredit-karti-limiti-maasa-gore",
    title: "Kredit kartı limiti maaşa görə necə dəyişir?",
    summary: "Limit ümumiyyətlə maaşın 1–3 mislidir. Yaxşı kredit tarixçəsi daha yüksək əmsal verir.",
    category: "Kredit kartı",
    readingTime: 1,
    content: `Tarixçəsiz müştəriyə gəlir × 1, orta tarixçəyə gəlir × 1.5–2, yaxşı tarixçəyə gəlir × 2–3 limit verilir. Rəsmi gəliri olan müştərilərə daha yüksək limit, qeyri-rəsmi gəlirlilərə isə aşağı limit verilir. Limit gəlirin 5 mislini keçdikdə yeni kredit almaq çətinləşir.`,
  },

  {
    slug: "aktiv-kredit-xetti-limiti",
    title: "Aktiv kredit xətti limiti nə deməkdir?",
    summary: "İstifadə edilsə də, edilməsə də açıq qalan kredit limiti — BGN hesablamasına daxil edilə bilər.",
    category: "Kredit kartı",
    readingTime: 1,
    content: `Aktiv kredit xətti limiti bankın sizə ayırdığı, istifadə etməsəniz belə açıq qalan kreditdir. Bəzi banklar bunu potensial borc kimi hesab edir. İstifadə edilməyən kredit xəttlərinin limitini azaltmaq ya bağlamaq yeni kredit müraciəti üçün BGN-i yaxşılaşdırır.`,
  },

  {
    slug: "istifade-edilmeyen-kart-limiti-tesiri",
    title: "İstifadə edilməyən kredit kartı limiti kredit müraciətinə təsir edir?",
    summary: "Bəli — bəzi banklar bu limiti BGN hesablamasına daxil edir.",
    category: "Kredit kartı",
    readingTime: 1,
    content: `İstifadə etmədiyiniz kredit kartının limiti görünmədən kredit profilinizə mənfi təsir göstərə bilər. Limit gəlirin 5 mislini keçibsə — bu bir çox bankda bloklaşdırıcı şərtdir. Yeni kredit müraciətindən əvvəl istifadəsiz kartların limitini azaldın və ya kartı bağlayın.`,
  },

  {
    slug: "kredit-karti-borcu-borc-yukune-daxil",
    title: "Kredit kartı borcu borc yükünə necə daxil edilir?",
    summary: "Kartdakı aktual borcun minimum ödənişi (≈5%) aylıq ödəniş kimi BGN-ə daxil edilir.",
    category: "Kredit kartı",
    readingTime: 1,
    content: `Bank kredit kartı borcunu BGN hesablamasına daxil edərkən adətən kartdakı borcun 5%-ini (minimum ödəniş) aylıq öhdəlik kimi qəbul edir. Məsələn: kart borcu 1000 AZN → 50 AZN aylıq BGN-ə daxildir. Kart borcunu sıfırlamaq BGN-i aşağı salır.`,
  },

  {
    slug: "kredit-karti-limitini-azaltmaq-faydalidirmi",
    title: "Kredit kartı limitini azaltmaq faydalıdırmı?",
    summary: "Bəli, yeni kredit götürmək planlaşdırırsınızsa — limiti azaltmaq BGN-i yaxşılaşdırır.",
    category: "Kredit kartı",
    readingTime: 1,
    content: `Yeni kredit müraciətindən əvvəl istifadə etmədiyiniz kredit kartlarının limitini azaltmaq BGN-i aşağı salır. Bankın müştəri xidmətinə müraciət edərək limiti azaltmaq asandır. Aktiv istifadə etdiyiniz kartların limitini azaltmamağa çalışın — gündəlik xərclər üçün kifayət etməlidir.`,
  },

  // ── 6. Kredit məhsulları və ödənişlər ────────────────────────────────

  {
    slug: "istehlak-krediti-nedir",
    title: "İstehlak krediti nədir?",
    summary: "Şəxsi ehtiyaclar üçün müəyyən məbləğin bankdan alınıb müddət ərzində faizlə qaytarılmasıdır.",
    category: "Kredit məhsulları",
    readingTime: 1,
    content: `İstehlak krediti şəxsi xərclər üçün bankdan müəyyən məbləğ götürüb müddət ərzində faizlə qaytarmaqdır. Azərbaycanda nağd kredit, mal krediti və kredit kartı şəklində mövcuddur. Adətən girov tələb olunmur, müddət 60 aya qədər, faiz isə 15–36% arasındadır.`,
    relatedTool: { label: "Ödənişi hesablayın", href: "/az/calculators/consumer-loan" },
  },

  {
    slug: "istehlak-krediti-necə-hesablanir",
    title: "İstehlak krediti necə hesablanır?",
    summary: "Annuitet formulası ilə: məbləğ, müddət və faiz əsasında sabit aylıq ödəniş müəyyənləşdirilir.",
    category: "Kredit məhsulları",
    readingTime: 1,
    content: `Aylıq ödəniş = P × [r(1+r)ⁿ] / [(1+r)ⁿ - 1], burada P = kredit məbləği, r = aylıq faiz (illik÷12), n = ay sayı. Nümunə: 5000 AZN, 24 ay, 24% illik → aylıq ≈255 AZN, ümumi 6120 AZN, faiz xərci ≈1120 AZN. Komissiya və sığorta bu məbləğə əlavədir.`,
    relatedTool: { label: "Kalkulyatorda hesablayın", href: "/az/calculators/consumer-loan" },
  },

  {
    slug: "faiz-komissiya-sigorta-umumii-xerce-tesiri",
    title: "Kreditdə faiz, komissiya və sığorta ümumi xərcə necə təsir edir?",
    summary: "Nominal faiz deyil, İllik Effektiv Faiz (AEF) bütün xərcləri göstərir — həmişə AEF-i müqayisə edin.",
    category: "Kredit məhsulları",
    readingTime: 1,
    content: `Kredit xərci yalnız nominal faizdən ibarət deyil — hesab açılış komissiyası, aylıq xidmət haqqı və sığorta da əlavə olunur. İllik Effektiv Faiz (AEF) bütün bu xərcləri birləşdirir. Banklar AEF-i müqavilədə göstərməlidir — müxtəlif bankları müqayisə edərkən həmişə AEF-ə baxın.`,
  },

  {
    slug: "kredit-muddeti-artanda-umumi-xerc",
    title: "Kredit müddəti artanda ümumi xərc niyə artır?",
    summary: "Uzun müddət aylıq ödənişi azaldır, lakin daha çox müddət faiz hesablandığından ümumi xərc artır.",
    category: "Kredit məhsulları",
    readingTime: 1,
    content: `Müddət artdıqca hər ay daha uzun müddət əsas borca faiz hesablanır — ümumi faiz xərci artır. 10 000 AZN, 24% faizlə: 12 ay = ≈1352 AZN faiz; 24 ay = ≈2672 AZN faiz; 48 ay = ≈5456 AZN faiz. Büdcəniz imkan versə — qısa müddət seçin, aylıq ödəniş çox olsa da ümumi xərc xeyli az olur.`,
    relatedTool: { label: "Müddətlər üzrə hesablayın", href: "/az/calculators/consumer-loan" },
  },

  {
    slug: "erken-odenis-nedir",
    title: "Erkən ödəniş nədir?",
    summary: "Müddət bitməmiş əsas borca əlavə məbləğ ödəmək — faiz xərclərini azaldır.",
    category: "Erkən ödəniş",
    readingTime: 1,
    content: `Erkən ödəniş aylıq məcburi ödənişdən əlavə, əsas borca qarşı əlavə məbləğ ödəmək deməkdir. Bu ümumi faiz xərcini azaldır, kreditdən daha tez xilas olursunuz. Bəzi banklar erkən ödəniş cəriməsi tətbiq edir — müraciətdən əvvəl müqavilənizi yoxlayın.`,
    relatedTool: { label: "Erkən ödənişi hesablayın", href: "/az/calculators/consumer-loan" },
  },

  {
    slug: "erken-odenis-muddet-yoxsa-odenis",
    title: "Erkən ödəniş edəndə müddəti azaltmaq yaxşıdır, yoxsa aylıq ödənişi?",
    summary: "Müddəti azaltmaq daha çox faiz qənaəti verir. Aylıq ödənişi azaltmaq büdcəni rahatladır.",
    category: "Erkən ödəniş",
    readingTime: 1,
    content: `Müddəti azaltmaq — eyni aylıq ödənişlə daha az ay, faiz qənaəti daha çox. Aylıq ödənişi azaltmaq — eyni müddətlə daha az aylıq, büdcəni rahatladır, lakin faiz qənaəti az olur. Gəliriniz stabil isə — müddəti azaltmaq daha sərfəlidir. Büdcəniz gərgindirsə — aylıq ödənişi azaltmaq daha rahatdır.`,
    relatedTool: { label: "Erkən ödənişi hesablayın", href: "/az/calculators/consumer-loan" },
  },

  {
    slug: "krediti-vaxtindan-evvel-baglamaq-serfəlidirmi",
    title: "Krediti vaxtından əvvəl bağlamaq sərfəlidirmi?",
    summary: "Erkən ödəniş cəriməsi yoxdursa — bəli. Qalan faiz xərclərindən qurtulursunuz.",
    category: "Erkən ödəniş",
    readingTime: 1,
    content: `Annuitet kreditini vaxtından əvvəl bağlamaq qalan faiz xərclərini azaldır — nə qədər tez bağlasanız, faiz qənaəti bir o qədər çox olur. Lakin bəzi banklar erkən bağlama üçün qalan borcun 1–2%-i qədər cərimə tətbiq edir. Müqaviləni oxuyun — cərimə qənaəti keçirsə, əvvəlcədən bağlamaq sərfəlidir.`,
    relatedTool: { label: "Erkən ödənişi kalkulyatorda yoxlayın", href: "/az/calculators/consumer-loan" },
  },

  {
    slug: "ipoteka-ucun-ilkin-odenis",
    title: "İpoteka üçün ilkin ödəniş necə hesablanır?",
    summary: "İlkin ödəniş əmlak dəyərinin faizini ödəmək deməkdir. Azərbaycanda adətən 20–30% tələb olunur.",
    category: "İpoteka",
    readingTime: 1,
    content: `LTV (Loan-to-Value) = Kredit məbləği ÷ Əmlak dəyəri × 100. Məsələn: əmlak 100 000 AZN, ilkin ödəniş 20 000 AZN → LTV = 80%. Aşağı LTV (≤70%) daha yaxşı şərtlər deməkdir. Azərbaycanda banklar adətən 20–30% ilkin ödəniş tələb edir.`,
    relatedTool: { label: "İpoteka kalkulyatoruna keçin", href: "/az/calculators/mortgage" },
  },

  {
    slug: "ipotekada-ltv-nedir",
    title: "İpotekada LTV nədir?",
    summary: "LTV — kredit məbləğinin əmlak dəyərinə nisbəti. Bank bu göstərici ilə riskini ölçür.",
    category: "İpoteka",
    readingTime: 1,
    content: `LTV = Kredit məbləği ÷ Əmlak qiymətləndirilmə dəyəri × 100. LTV ≤70% — aşağı risk, ən yaxşı şərtlər; 71–80% — standart; 80%+ — əlavə tələblər ola bilər. Dövlət ipoteka kreditləri üçün LTV adətən 70–80% həddindədir.`,
    relatedTool: { label: "İpoteka kalkulyatoru", href: "/az/calculators/mortgage" },
  },

  {
    slug: "avtokredit-ilkin-odenis",
    title: "Avtokredit üçün ilkin ödəniş nədən asılıdır?",
    summary: "Avtomobilin yaşı, tipi və bankın siyasəti ilkin ödəniş tələbini müəyyən edir.",
    category: "Avtokredit",
    readingTime: 1,
    content: `Yeni avtomobillər üçün ilkin ödəniş 10–20%, işlənmiş avtomobillər üçün isə 20–40% ola bilər. LTV 80%-i keçdikdə banklar əlavə girov ya sığorta tələb edir. 20–30% ilkin ödəniş aylıq ödənişi azaldır və kredit profilinizi gücləndirir.`,
    relatedTool: { label: "Avtokredit kalkulyatoruna keçin", href: "/az/calculators/auto-loan" },
  },

  {
    slug: "islenmis-avtomobile-kredit",
    title: "İşlənmiş avtomobilə kredit almaq mümkündür?",
    summary: "Bəli, lakin şərtlər daha sərtdir — ilkin ödəniş daha yüksək, yaş limiti var.",
    category: "Avtokredit",
    readingTime: 1,
    content: `İşlənmiş avtomobil üçün kredit mümkündür, lakin ilkin ödəniş daha yüksək (20–40%), faiz isə daha yüksək ola bilər. Əksər banklar 10 ildən köhnə avtomobillərə kredit vermir. Müraciətdən əvvəl avtomobili rəsmi qiymətləndiricidən keçirmək tövsiyə olunur.`,
    relatedTool: { label: "Avtokredit kalkulyatoru", href: "/az/calculators/auto-loan" },
  },

  {
    slug: "kredit-götürmeden-evvel-ne-yoxlamaq",
    title: "Kredit götürməzdən əvvəl nəyi yoxlamaq lazımdır?",
    summary: "Borc yükü, kredit tarixçəsi, AEF faizi, müqavilə şərtləri və erkən ödəniş qaydalarını yoxlayın.",
    category: "Kredit məhsulları",
    readingTime: 1,
    content: `Yoxlama siyahısı: 1) BGN-inizi hesablayın — 70%-i keçirmi? 2) AKB-dən kredit tarixçənizi alın — aktiv gecikmə varmı? 3) AEF-i (İllik Effektiv Faiz) müqayisə edin — nominal faiz deyil. 4) Müqavilədə erkən ödəniş cəriməsi varmı? 5) Aylıq ödəniş büdcənizin 30%-ini keçirmi?`,
    relatedTool: { label: "Profilinizi yoxlayın", href: "/az/kredit-yoxlama" },
  },

];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export const categories = [
  "Hamısı",
  "Kredit tarixçəsi",
  "Borc yükü",
  "Bank tələbləri",
  "Gecikmə",
  "Kredit kartı",
  "Erkən ödəniş",
  "Kredit məhsulları",
  "İpoteka",
  "Avtokredit",
];
