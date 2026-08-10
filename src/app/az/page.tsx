"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Banknote, House, Car } from "lucide-react";
import { calcAnnuityPayment } from "@/lib/calculators/annuity";
import { formatNumber, formatPercent } from "@/lib/utils";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Accordion";
import { ScoreDial } from "@/components/score/ScoreDial";
import { Reveal } from "@/components/home/Reveal";
import { CreditCheckScene, CalculatorScene, AssistantScene } from "@/components/home/illustrations";

const faqs = [
  { q: "Navio kredit verir?", a: "Xeyr. Biz sadəcə məlumat platformasıyıq. Kredit qərarını yalnız bank qəbul edir." },
  { q: "Kredit tarixçəm pisdirsə, nə edə bilərəm?", a: "Cari gecikməni bağlamaq profilinizi yaxşılaşdırır. Navio bu fərqi sizə göstərir." },
  { q: "Nəticə bank qərarını əvəz edirmi?", a: "Xeyr. Nəticə ilkin qiymətləndirmə xarakterindədir. Yekun qərarı bank verir." },
  { q: "İlkin yoxlama üçün sənəd lazımdır?", a: "Heç bir sənəd tələb olunmur. Yalnız əsas maliyyə məlumatlarınızı daxil etmək kifayətdir." },
  { q: "Borc yükü necə hesablanır?", a: "Borc yükü = aylıq kredit ödənişləri / aylıq gəlir × 100. Banklar adətən 70%-dən yuxarı qəbul etmir." },
];

const loanTypes = [
  { icon: <Banknote size={17} />, title: "İstehlak krediti", amount: 10000, months: 24, rate: 18, href: "/az/calculators/consumer-loan" },
  { icon: <House size={17} />, title: "İpoteka", amount: 100000, months: 240, rate: 8, href: "/az/calculators/mortgage" },
  { icon: <Car size={17} />, title: "Avtokredit", amount: 30000, months: 60, rate: 14, href: "/az/calculators/auto-loan" },
];

/* Общая оболочка плитки бенто.

   ring вместо border и заметный подъём на hover — язык плиток у Mənzil.
   .no-scale отключает глобальное scale(1.03): на плитке такого размера
   это читается как рывок, у неё свой подъём. */
const TILE =
  "no-scale group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-gray-200 " +
  "transition duration-300 ease-out hover:-translate-y-1 hover:ring-gray-300 " +
  "hover:shadow-[0_24px_64px_-24px_rgba(15,31,61,0.25)] active:translate-y-0";

function TileArrow() {
  return (
    <ArrowRight
      size={16}
      aria-hidden
      className="absolute right-5 top-5 text-gray-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-600"
    />
  );
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="bg-white">
      {/* ── Hero ── */}
      <section className="border-b border-gray-200">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div className="nv-enter">
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
              Sorğusuz ilkin qiymətləndirmə
            </span>

            <h1 className="mt-4 text-4xl font-extrabold leading-[1.06] tracking-tight text-ink sm:text-5xl">
              Kredit almaq şansınızı yoxlayın
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-gray-600">
              Banka müraciət etməzdən əvvəl nəticənizi öyrənin. Məlumatları yazdıqca hesablanır.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <LinkButton href="/az/kredit-yoxlama" size="lg" icon={<ArrowRight size={17} />}>
                İlkin yoxlamaya başla
              </LinkButton>
              <LinkButton href="/az/calculators" size="lg" variant="secondary">
                Kalkulyatorlar
              </LinkButton>
            </div>

            {/* Три преимущества шли столбцами с иконкой, заголовком и
                подписью каждый — три маленькие «карточки ни о чём» под
                кнопкой. Теперь это одна строка доверия: те же факты,
                одна десятая высоты и ноль декоративных иконок. */}
            <p className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-gray-500">
              <span>3 dəqiqə</span>
              <span aria-hidden className="text-gray-300">·</span>
              <span>Sənəd tələb olunmur</span>
              <span aria-hidden className="text-gray-300">·</span>
              <span>Kredit tarixçənizə təsir etmir</span>
              <span aria-hidden className="text-gray-300">·</span>
              <span>Pulsuz</span>
            </p>
          </div>

          {/* Превью результата: тот же ScoreDial, что и на настоящем экране. */}
          <div className="nv-float rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_24px_64px_-24px_rgba(15,31,61,0.25)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-ink">Kredit profili</span>
              <Badge>Nümunə</Badge>
            </div>

            <ScoreDial score={72} tone="normal" />

            <p className="mt-3 text-center text-base font-bold text-emerald-700">Yaxşı şans</p>
            <p className="mt-0.5 text-center text-[13px] text-gray-600">Bir çox bank təsdiqləyə bilər</p>

            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-200 pt-4">
              {[
                { k: "Aylıq ödəniş", v: "280 ₼" },
                { k: "Borc yükü", v: formatPercent(34, 0), good: true },
                { k: "Faiz", v: formatPercent(15, 0) },
              ].map((m) => (
                <div key={m.k}>
                  <dt className="text-[10px] font-semibold text-gray-400">{m.k}</dt>
                  <dd className={`text-base font-extrabold tabular-nums ${m.good ? "text-emerald-700" : "text-ink"}`}>
                    {m.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Что делает Navio: бенто с живыми мини-сценами ── */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Reveal>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Navio sizə necə kömək edir?
            </h2>
            <p className="mt-2 max-w-2xl text-base text-gray-600">
              Kredit almadan əvvəl hazır olun, ödənişləri planlaşdırın və qərarınızı aydın verin.
            </p>
          </Reveal>

          {/* Плитки намеренно разного размера: проверка профиля — главный
              продукт, и она занимает больше места. Три одинаковые карточки
              сообщали бы, что всё одинаково важно. */}
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <Link href="/az/kredit-yoxlama" className={`${TILE} sm:flex-row sm:items-center sm:gap-6`}>
                <TileArrow />
                <div className="mb-4 h-[190px] sm:mb-0 sm:w-1/2">
                  <CreditCheckScene />
                </div>
                <div className="sm:w-1/2">
                  <h3 className="text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-brand-700">
                    Kredit profilinizi yoxlayın
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    Kredit almaq ehtimalınızı, borc yükünüzü və nəticəyə təsir edən risk faktorlarını görün.
                  </p>
                </div>
              </Link>
            </Reveal>

            <Reveal className="lg:col-span-5">
              <Link href="/az/calculators" className={TILE}>
                <TileArrow />
                <div className="mb-4 h-[190px]">
                  <CalculatorScene />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-brand-700">
                  Ödənişi planlaşdırın
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  Ssenariləri müqayisə edin və erkən ödənişin nə qazandırdığını görün.
                </p>
              </Link>
            </Reveal>

            <Reveal className="lg:col-span-5">
              <Link href="/az/financial-assistant" className={TILE}>
                <TileArrow />
                <div className="mb-4 h-[190px]">
                  <AssistantScene />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-brand-700">
                  Sualınıza cavab tapın
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  Borc yükü, gecikmə və bank tələbləri haqqında aydın izahlar.
                </p>
              </Link>
            </Reveal>

            {/* Типы кредитов переехали в бенто отдельной плиткой: раньше это
                была целая секция ради трёх строк. */}
            <Reveal className="lg:col-span-7">
              <div className={`${TILE} justify-center`}>
                <h3 className="text-lg font-bold tracking-tight text-ink">Hansı kreditlər üçün?</h3>
                <ul className="mt-3 divide-y divide-gray-200">
                  {loanTypes.map((c) => {
                    const payment = calcAnnuityPayment(c.amount, c.rate, c.months);
                    const term = c.months >= 24 ? `${c.months / 12} il` : `${c.months} ay`;
                    return (
                      <li key={c.title}>
                        <Link
                          href={c.href}
                          className="no-scale -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-gray-50"
                        >
                          <span className="text-gray-400">{c.icon}</span>
                          <span className="flex-1 text-sm font-semibold text-ink">{c.title}</span>
                          <span className="hidden text-[11px] tabular-nums text-gray-500 sm:inline">
                            {formatNumber(c.amount)} ₼, {term}
                          </span>
                          <span className="text-sm font-extrabold tabular-nums text-ink">
                            {formatNumber(Math.round(payment))} ₼
                            <span className="text-[11px] font-semibold text-gray-500"> / ay</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 text-[11px] text-gray-500">
                  Nümunələr göstərilən faizlə hesablanıb. Real şərtlər bankdan asılıdır.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Populyar suallar</h2>

          <div className="mt-6 grid grid-cols-1 items-start gap-3 md:grid-cols-2 md:gap-x-5">
            {faqs.map((f, i) => (
              <div key={f.q} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <Accordion
                  id={`faq-${i}`}
                  question={f.q}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <p className="text-sm leading-relaxed text-gray-600">{f.a}</p>
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Финальный CTA ──
          Повторяет ту же строку доверия, что и герой, поэтому читается как
          закрывающая скобка страницы, а не как случайная тёмная плашка. */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="rounded-2xl bg-ink px-6 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Bir neçə dəqiqəyə nəticənizi görün
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-300">
              Kredit müraciətindən əvvəl harada dayandığınızı bilin.
            </p>
            <LinkButton href="/az/kredit-yoxlama" size="lg" className="mt-7" icon={<ArrowRight size={17} />}>
              Pulsuz yoxlamaya başla
            </LinkButton>
            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[13px] text-gray-400">
              <span>3 dəqiqə</span>
              <span aria-hidden className="text-gray-600">·</span>
              <span>Sənəd tələb olunmur</span>
              <span aria-hidden className="text-gray-600">·</span>
              <span>Kredit tarixçənizə təsir etmir</span>
            </p>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200 bg-gray-50 py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="mx-auto max-w-3xl text-center text-[13px] leading-relaxed text-gray-600">
            <b className="text-ink">Navio bank deyil.</b> Heç bir kredit verilmir və banka müraciətin nəticəsinə
            zəmanət verilmir. Nəticələr ilkin qiymətləndirmə xarakteri daşıyır.
          </p>
        </div>
      </div>
    </main>
  );
}
