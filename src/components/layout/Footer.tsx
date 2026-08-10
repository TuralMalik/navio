import Link from "next/link";

/* Контраст в подвале был ниже нормы: gray-500 по gray-900 даёт около 4:1,
   а для основного текста нужно 4.5:1. Мелкий серый текст на тёмном — самая
   частая причина того, что дисклеймер физически невозможно прочитать, а он
   здесь юридически значимый. Поднято до gray-400 (примерно 7:1). */

const services = [
  { href: "/az/kredit-yoxlama", label: "Kredit yoxlaması" },
  { href: "/az/calculators/consumer-loan", label: "İstehlak krediti kalkulyatoru" },
  { href: "/az/calculators/mortgage", label: "İpoteka kalkulyatoru" },
  { href: "/az/calculators/auto-loan", label: "Avtokredit kalkulyatoru" },
  { href: "/az/financial-assistant", label: "Maliyyə köməkçisi" },
];

const company = [
  { href: "/az/about", label: "Haqqımızda" },
  { href: "/az/privacy", label: "Məxfilik siyasəti" },
  { href: "/az/disclaimer", label: "İmtina bəyanatı" },
];

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold text-white">{title}</h2>
      <ul className="space-y-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-block rounded py-1.5 text-sm text-gray-400 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="text-lg font-extrabold tracking-tight text-white">Navio</span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
              Navio kredit profilinizi ilkin qiymətləndirməyə, ödənişləri hesablamağa və maliyyə
              mövzularını anlamağa kömək edən məlumat platformasıdır.
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-400">
              Navio bank deyil. Heç bir kredit vermir və banka müraciətin nəticəsinə zəmanət vermir.
            </p>
          </div>

          <Column title="Xidmətlər" links={services} />
          <Column title="Şirkət" links={company} />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-800 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Navio. Bütün hüquqlar qorunur.
          </p>
          <p className="text-xs text-gray-400">Bu platforma yalnız məlumat xarakteri daşıyır.</p>
        </div>
      </div>
    </footer>
  );
}
