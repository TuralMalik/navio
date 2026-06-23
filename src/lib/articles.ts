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
  {
    slug: "borc-yuku-nedir",
    title: "Borc yükü nədir və necə hesablanır?",
    summary: "Borc yükü aylıq gəlirinizin kredit ödənişlərinə yönəldilən faizi göstərir. Banklar bu göstəriciyə əsaslanır.",
    category: "Borc yükü",
    readingTime: 3,
    content: `Borc yükü (DTI — Debt-to-Income) aylıq xalis gəlirinizin hansı faizinin kredit ödənişlərinə getdiyini göstərir.

**Hesablama düsturu:**

Borc yükü = (Aylıq kredit ödənişləri / Aylıq xalis gəlir) × 100

**Nümunə:**

Aylıq gəliriniz 1500 ₼, kredit ödənişləriniz 450 ₼ olarsa:
Borc yükü = (450 / 1500) × 100 = 30%

**Hansı faiz yaxşı sayılır?**

- 0–30%: Aşağı, ideal
- 31–50%: Orta, qəbul edilə bilər
- 51–70%: Yüksək, risk var
- 70%+: Banklar adətən kredit vermir

**Niyə vacibdir?**

Banklar kredit verərkən yeni kreditdən sonra borc yükünüzün 70%-i keçməməsinə baxır. Əgər keçirsə, müraciəti rədd edə bilərlər.`,
    warning: "Hər bankın öz limitləri var. 70% ümumi bir məhdudiyyət olsa da, bəzi banklar daha aşağı hədd tətbiq edə bilər.",
    relatedTool: { label: "Kredit yoxlamasını başladın", href: "/az/credit-check" },
  },
  {
    slug: "kredit-tarixcesi-nedir",
    title: "Kredit tarixçəsi nədir?",
    summary: "Kredit tarixçəniz əvvəlki kreditlərinizdə gecikmə olub-olmadığını, borcları vaxtında ödəyib-ödəmədiyinizi göstərir.",
    category: "Kredit tarixçəsi",
    readingTime: 3,
    content: `Kredit tarixçəsi əvvəlki kredit davranışınızın qeydidir. Banklar bu məlumatı Azərbaycan Kredit Bürosu vasitəsilə yoxlayır.

**Kredit tarixçəsinə nə daxildir?**

- Əvvəlki kreditlər və onların ödəniş tarixi
- Gecikmiş ödənişlər (gün sayı ilə)
- Bağlanmış və açıq kreditlər
- Kredit limiti məlumatları

**Gecikmənin təsiri:**

- 1–30 gün gecikmə: Orta risk
- 31–90 gün: Yüksək risk
- 90+ gün: Çox yüksək risk, bəzi banklar müraciəti rədd edə bilər

**Yaxşı kredit tarixçəsi üçün:**

Ödənişləri vaxtında edin. Kiçik gecikmələr belə kredit profilinizə mənfi təsir göstərir.`,
    warning: "Kredit bürosu məlumatları banklar tərəfindən yoxlanılır. Navio bu məlumatlara birbaşa çıxış əldə etmir.",
    relatedTool: { label: "Kredit profilinizi yoxlayın", href: "/az/credit-check" },
  },
  {
    slug: "bank-niye-redd-ede-biler",
    title: "Bank niyə kreditdən imtina edə bilər?",
    summary: "Banklar kredit müraciətini bir neçə əsas səbəbə görə rədd edə bilər. Bu səbəbləri bilmək müraciətdən əvvəl faydalıdır.",
    category: "Bank tələbləri",
    readingTime: 4,
    content: `Banklar kredit verərkən bir sıra şərtləri yoxlayır. Bu şərtlərdən biri ödənilmədikdə müraciəti rədd edə bilərlər.

**Ən çox rast gəlinən rədd səbəbləri:**

**1. Yüksək borc yükü**
Yeni kreditdən sonra borc yükü 70%-i keçirsə, banklar adətən müraciəti qəbul etmir.

**2. Qısa iş stajı**
Cari iş yerindəki stajın 6 aydan az olması risk faktoru sayılır. Əksər banklar minimum 6 ay tələb edir.

**3. Gecikmiş ödənişlər**
Kredit tarixçəsindəki gecikmələr kredit profilinizi zəiflədər.

**4. Yaş məhdudiyyəti**
18 yaşdan aşağı müraciətçilər kreditə uyğun deyil. Bəzi banklar üst yaş həddi də tətbiq edir.

**5. Gəlirin sənədləşdirilməsi**
Gəliri sənədlə təsdiqləyə bilməmək bankın riskini artırır.

**Ne etmək olar?**

Müraciətdən əvvəl bu amilləri nəzərə alın. Borc yükünüzü azaldın, gecikmiş ödənişləri bağlayın.`,
    warning: "Kredit qərarını bank qəbul edir. Navio-nun nəticəsi ilkin qiymətləndirmədir.",
    relatedTool: { label: "İlkin yoxlamanı başladın", href: "/az/credit-check" },
  },
  {
    slug: "erken-odenis-muddet-yoxsa-odenis",
    title: "Erkən ödəniş: müddəti azaltmaq, yoxsa aylıq ödənişi?",
    summary: "Əlavə məbləğ ödədikdə müddəti qısaltmaq faiz xərclərini daha çox azaldır. Aylıq ödənişi azaltmaq isə daha çevik büdcə yaradır.",
    category: "Erkən ödəniş",
    readingTime: 4,
    content: `Erkən ödəniş etdikdə iki strategiya seçə bilərsiniz:

**1. Müddəti azalt**
Eyni aylıq ödənişlə daha az ay ödəyirsiniz. Bu üsul ümumi faiz xərclərini daha çox azaldır.

**2. Aylıq ödənişi azalt**
Eyni müddətlə daha az aylıq ödəyirsiniz. Büdcənizi rahatladır, lakin ümumi faiz qənaəti az olur.

**Nümunə:**
10 000 ₼ kredit, 18% faiz, 36 ay müddət. 12-ci ayda 2000 ₼ erkən ödəniş:

- Müddəti azalt: Təxminən 6 ay qısalır, ~400 ₼ qənaət
- Aylıq ödənişi azalt: Aylıq ödəniş ~80 ₼ azalır, ~200 ₼ qənaət

**Hansı seçim daha yaxşı?**

Əgər gəliriniz sabitdirsə — müddəti azaltmaq daha sərfəlidir.
Əgər büdcəniz gərgindirsə — aylıq ödənişi azaltmaq daha rahatdır.`,
    relatedTool: { label: "Erkən ödənişi hesablayın", href: "/az/calculators/consumer-loan" },
  },
  {
    slug: "istehlak-kreditinde-muddet",
    title: "İstehlak kreditində müddət niyə vacibdir?",
    summary: "Kredit müddəti aylıq ödənişi azaldır, lakin ümumi faiz xərcini artırır. Düzgün müddət seçmək vacibdir.",
    category: "Borc yükü",
    readingTime: 3,
    content: `Kredit müddəti seçimi aylıq ödənişinizi və ümumi xərclərinizi birbaşa təsir edir.

**Uzun müddətin üstünlükləri:**
- Aylıq ödəniş aşağı olur
- Büdcəyə daha az təzyiq edir

**Uzun müddətin çatışmazlıqları:**
- Ümumi faiz xərci çox olur
- Daha uzun müddət borc altında qalırsınız

**Nümunə — 10 000 ₼, 18% faiz:**

| Müddət | Aylıq ödəniş | Ümumi faiz |
|--------|-------------|------------|
| 12 ay  | 917 ₼       | 1 004 ₼    |
| 24 ay  | 499 ₼       | 1 976 ₼    |
| 36 ay  | 361 ₼       | 2 996 ₼    |

**Tövsiyə:**
Aylıq ödənişin gəlirinizin 30%-indən çox olmamasına çalışın.`,
    relatedTool: { label: "Kalkulyatorda hesablayın", href: "/az/calculators/consumer-loan" },
  },
  {
    slug: "ipoteka-ilkin-odenis",
    title: "İpoteka üçün ilkin ödəniş necə hesablanır?",
    summary: "İlkin ödəniş əmlak dəyərinin faizi olaraq hesablanır. Bu nisbət LTV-yə təsir edir.",
    category: "İpoteka",
    readingTime: 3,
    content: `İlkin ödəniş əmlakın qiymətinin müəyyən faizini ödəmək deməkdir. Qalan hissəni bank kredit kimi verir.

**LTV — Loan-to-Value:**
LTV = Kredit məbləği / Əmlak dəyəri × 100

**Nümunə:**
Əmlak: 100 000 ₼, İlkin ödəniş: 20 000 ₼
LTV = 80 000 / 100 000 × 100 = 80%

**LTV banklar üçün niyə vacibdir?**
- Aşağı LTV (≤70%) — daha aşağı risk, daha yaxşı şərtlər
- LTV 80% — standart hədd
- LTV >80% — banklar əlavə tələblər qoya bilər

**Minimum ilkin ödəniş:**
Azərbaycanda banklar adətən 20–30% ilkin ödəniş tələb edir.`,
    relatedTool: { label: "İpoteka kalkulyatoruna keçin", href: "/az/calculators/mortgage" },
  },
  {
    slug: "avtokredit-ilkin-odenis",
    title: "Avtokreditdə ilkin ödəniş nədən asılıdır?",
    summary: "Avtomobilin yaşı, tipi və bankın siyasəti ilkin ödəniş tələbini müəyyən edir.",
    category: "Avtokredit",
    readingTime: 3,
    content: `Avtokredit üçün ilkin ödəniş avtomobilin qiymətinin bir hissəsini özünüzün ödəməsi deməkdir.

**İlkin ödənişi təsir edən amillər:**

**Avtomobilin yaşı:**
Yeni avtomobilər üçün ilkin ödəniş aşağı (10–20%) ola bilər.
İşlənmiş, köhnə avtomobillər üçün banklar daha yüksək ilkin ödəniş tələb edir.

**Avtomobilin tipi:**
Kommersiya nəqliyyatı üçün tələblər fərqli ola bilər.

**LTV avtokreditdə:**
LTV 80% keçdikdə banklar əlavə girov və ya sığorta tələb edə bilər.

**Tövsiyə:**
20–30% ilkin ödəniş aylıq ödənişinizi azaldır və kredit profilinizi gücləndirir.`,
    relatedTool: { label: "Avtokredit kalkulyatoruna keçin", href: "/az/calculators/auto-loan" },
  },
  {
    slug: "kredit-ucun-senetler",
    title: "Kreditə müraciətdən əvvəl hansı sənədlər lazım ola bilər?",
    summary: "Banklar adətən şəxsiyyət, gəlir sənədi və iş yeri arayışı tələb edir. Lazımlı sənədlər öncədən hazırlamaq prosesi sürətləndirir.",
    category: "Bank tələbləri",
    readingTime: 3,
    content: `Banklar kredit müraciəti üçün bir sıra sənədlər tələb edir. Bunları öncədən hazırlamaq prosesi sürətləndirir.

**Ümumi tələb olunan sənədlər:**

**Şəxsiyyətin təsdiqi:**
- Şəxsiyyət vəsiqəsi (FIN)

**Gəlir sənədləri:**
- İş yeri arayışı (aylıq əmək haqqı göstərilməklə)
- Bank çıxarışı (son 3–6 ay)
- Fərdi sahibkarlar üçün vergi bəyannaməsi

**Əlavə sənədlər (kreditin növündən asılı):**
- İpoteka üçün: Əmlak sənədləri, qiymətləndirmə aktı
- Avtokredit üçün: Avtomobil sənədləri

**Navio nə tələb edir?**
Navio-nun ilkin yoxlaması üçün heç bir sənəd tələb olunmur. Yalnız əsas maliyyə məlumatlarınızı daxil etmək kifayətdir.`,
    warning: "Bu yalnız ümumi məlumatdır. Hər bankın öz sənəd tələbləri ola bilər.",
    relatedTool: { label: "Sənədsiz ilkin yoxlama", href: "/az/credit-check" },
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export const categories = [
  "Hamısı",
  "Kredit tarixçəsi",
  "Borc yükü",
  "Erkən ödəniş",
  "İpoteka",
  "Avtokredit",
  "Bank tələbləri",
];
