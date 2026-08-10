import Link from "next/link";
import { ArrowRight, Banknote, House, Car } from "lucide-react";
import { calcAnnuityPayment } from "@/lib/calculators/annuity";
import { formatNumber, formatPercent } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

/* Раньше здесь были три одинаковые карточки с иконкой в градиентном квадрате
   (синий, изумрудный и фиолетовый), которые ещё и подпрыгивали с поворотом
   при наведении. Это ровно тот набор, по которому страница опознаётся как
   сгенерированная, и он ничего не сообщал о самих калькуляторах.

   Вместо украшений — реальный пример расчёта для каждого: видно, о каких
   суммах и сроках вообще идёт речь. Числа считает та же функция, что и сами
   калькуляторы, поэтому пример не может разойтись с продуктом. */
const calculators = [
  {
    icon: <Banknote size={20} />,
    title: "İstehlak krediti",
    desc: "Nağd pul ehtiyaclarınız üçün aylıq ödənişi və faiz xərcini hesablayın.",
    href: "/az/calculators/consumer-loan",
    amount: 20000,
    months: 36,
    rate: 18,
  },
  {
    icon: <House size={20} />,
    title: "İpoteka krediti",
    desc: "İlkin ödəniş və müddətə görə ev kreditinin şərtlərini hesablayın.",
    href: "/az/calculators/mortgage",
    amount: 120000,
    months: 240,
    rate: 12,
  },
  {
    icon: <Car size={20} />,
    title: "Avtokredit",
    desc: "Avtomobilin dəyəri və ilkin ödənişə görə kredit şərtlərini hesablayın.",
    href: "/az/calculators/auto-loan",
    amount: 24000,
    months: 60,
    rate: 15,
  },
];

export default function CalculatorsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Breadcrumbs trail={[{ href: "/az", label: "Ana səhifə" }]} current="Kredit kalkulyatoru" />

        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Kredit kalkulyatorları</h1>
        <p className="mt-2 max-w-xl text-base text-gray-600">
          İstehlak krediti, ipoteka və avtokredit üçün aylıq ödənişinizi və faiz xərclərinizi hesablayın.
        </p>

        <ul className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {calculators.map((c) => {
            const payment = calcAnnuityPayment(c.amount, c.rate, c.months);
            const term = c.months >= 24 ? `${c.months / 12} il` : `${c.months} ay`;
            return (
              <li key={c.href} className="border-b border-gray-200 last:border-0">
                <Link
                  href={c.href}
                  className="flex flex-wrap items-center gap-x-5 gap-y-3 p-5 transition-colors hover:bg-gray-50"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gray-200 text-gray-500">
                    {c.icon}
                  </span>

                  <div className="min-w-[200px] flex-1">
                    <h2 className="text-base font-bold text-ink">{c.title}</h2>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-gray-600">{c.desc}</p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5">
                    <p className="text-[11px] text-gray-500 tabular-nums">
                      {formatNumber(c.amount)} ₼, {term}, {formatPercent(c.rate, 0)}
                    </p>
                    <p className="mt-0.5 text-sm font-extrabold tabular-nums text-ink">
                      {formatNumber(Math.round(payment))} ₼
                      <span className="text-xs font-semibold text-gray-500"> / ay</span>
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-brand-700">
                    Hesabla <ArrowRight size={14} aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-xs text-gray-500">
          Nümunələr göstərilən faizlə hesablanıb. Real faiz və şərtlər bankdan asılı olaraq dəyişir.
        </p>
      </div>
    </main>
  );
}
