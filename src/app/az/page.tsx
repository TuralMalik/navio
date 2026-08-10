"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronDown, Banknote, House, Car, Clock, ShieldCheck, Wallet } from "lucide-react";
import { calcAnnuityPayment } from "@/lib/calculators/annuity";
import { formatNumber, formatPercent } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScoreDial } from "@/components/score/ScoreDial";
import { Reveal } from "@/components/home/Reveal";

const faqs = [
  { q: "Navio kredit verir?", a: "Xeyr. Biz sadəcə məlumat platformasıyıq. Kredit qərarını yalnız bank qəbul edir." },
  { q: "Kredit tarixçəm pisdirsə, nə edə bilərəm?", a: "Cari gecikməni bağlamaq profilinizi yaxşılaşdırır. Navio bu fərqi sizə göstərir." },
  { q: "Nəticə bank qərarını əvəz edirmi?", a: "Xeyr. Nəticə ilkin qiymətləndirmə xarakterindədir. Yekun qərarı bank verir." },
  { q: "İlkin yoxlama üçün sənəd lazımdır?", a: "Heç bir sənəd tələb olunmur. Yalnız əsas maliyyə məlumatlarınızı daxil etmək kifayətdir." },
  { q: "Borc yükü necə hesablanır?", a: "Borc yükü = aylıq kredit ödənişləri / aylıq gəlir × 100. Banklar adətən 70%-dən yuxarı qəbul etmir." },
];

/* Примеры считаются той же аннуитетной формулой, что и калькуляторы, а не
   вписаны руками. На сайте про кредиты нельзя показывать красивое число,
   которое ничему не соответствует: если ставка изменится, пример изменится
   вместе с ней, а не останется врать. */
const loanTypes = [
  {
    icon: <Banknote size={20} />,
    title: "İstehlak krediti",
    tag: "Girovsuz, nağd ehtiyaclar üçün",
    amount: 10000,
    months: 24,
    rate: 18,
    href: "/az/calculators/consumer-loan",
  },
  {
    icon: <House size={20} />,
    title: "İpoteka krediti",
    tag: "İlkin ödəniş və müddət nəzərə alınmaqla",
    amount: 100000,
    months: 240,
    rate: 8,
    href: "/az/calculators/mortgage",
  },
  {
    icon: <Car size={20} />,
    title: "Avtokredit",
    tag: "Avtomobilin dəyəri əsasında",
    amount: 30000,
    months: 60,
    rate: 14,
    href: "/az/calculators/auto-loan",
  },
];

const steps = [
  {
    title: "Məlumatlarınızı daxil edin",
    text: "Gəliriniz, mövcud öhdəlikləriniz və istədiyiniz kredit məbləği. Sənəd tələb olunmur.",
  },
  {
    title: "Profiliniz hesablanır",
    text: "Borc yükü, gəlir və kredit risk faktorları üzrə qiymətləndirmə. Banklara sorğu göndərilmir.",
  },
  {
    title: "Nəticəni və addımları görün",
    text: "Balınız, ona təsir edən amillər və profili yaxşılaşdırmaq üçün konkret tövsiyələr.",
  },
];

function SectionHead({ title, lead, className = "" }: { title: string; lead?: string; className?: string }) {
  return (
    <div className={className}>
      <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">{title}</h2>
      {lead && <p className="mt-2 max-w-2xl text-base text-gray-600">{lead}</p>}
    </div>
  );
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="bg-white">
      {/* ── Hero ── */}
      <section className="border-b border-gray-200">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <div>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Kredit almaq şansınızı yoxlayın
            </h1>
            <p className="mt-5 max-w-md text-lg text-gray-600">
              Banka müraciət etməzdən əvvəl kredit almaq ehtimalınızı öyrənin.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/az/kredit-yoxlama" size="lg" icon={<ArrowRight size={17} />}>
                İlkin yoxlamaya başla
              </LinkButton>
              <LinkButton href="/az/calculators" size="lg" variant="secondary">
                Kalkulyatorlara keç
              </LinkButton>
            </div>

            <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {[
                { icon: <Clock size={18} />, title: "3 dəqiqəlik analiz", sub: "Sadə və sürətli yoxlama" },
                { icon: <ShieldCheck size={18} />, title: "Tarixçənizə təsir etmir", sub: "Rəsmi bank sorğusu göndərilmir" },
                { icon: <Wallet size={18} />, title: "Pulsuz", sub: "Gizli ödəniş yoxdur" },
              ].map((f) => (
                <li key={f.title}>
                  {/* Иконка не сидит в подкрашенном квадрате: цвет на странице
                      отдан данным, а не украшению вокруг пиктограммы. */}
                  <span className="text-gray-400" aria-hidden>{f.icon}</span>
                  <p className="mt-2 text-sm font-bold leading-snug text-ink">{f.title}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-gray-600">{f.sub}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Превью результата выглядит РОВНО так же, как настоящий экран
              результата: тот же ScoreDial, те же чипы. Иначе главная обещает
              одно, а продукт показывает другое. */}
          <Card aria-label="Nəticə nümunəsi">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-ink">Kredit profili</span>
              <Badge>Nümunə</Badge>
            </div>

            <ScoreDial score={72} tone="normal" />

            <p className="mt-3 text-center text-base font-bold text-emerald-700">Yaxşı şans</p>
            <p className="mt-0.5 text-center text-sm text-gray-600">Bir çox bank təsdiqləyə bilər</p>

            <Reveal className="nv-stagger mt-5 grid grid-cols-3 gap-2">
              {[
                { label: "Borc yükü", value: formatPercent(34, 0) },
                { label: "Aylıq ödəniş", value: "280 ₼" },
                { label: "Risk", value: "Aşağı" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-center">
                  <p className="text-[11px] font-medium text-gray-500">{m.label}</p>
                  <p className="mt-0.5 text-sm font-extrabold tabular-nums text-ink">{m.value}</p>
                </div>
              ))}
            </Reveal>

            <p className="mt-4 text-center text-xs text-gray-500">
              Nəticələr ilkin qiymətləndirmə xarakteri daşıyır.
            </p>
          </Card>
        </div>
      </section>

      {/* ── Как это работает ── */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHead
            title="Necə işləyir?"
            lead="Bir neçə dəqiqə ərzində ilkin nəticəni görün və profilinizi yaxşılaşdırmaq üçün tövsiyələr alın."
          />

          {/* Ни кружков с номерами, ни цветных квадратов под иконками:
              порядок читается сам, а подкрашенные плашки — тот самый
              шаблон, по которому лендинг узнаётся как сгенерированный. */}
          <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.title} className="border-t-2 border-gray-300 pt-4">
                <h3 className="text-base font-bold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Что делает Navio ── */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHead
            title="Navio sizə necə kömək edir?"
            lead="Kredit almadan əvvəl hazır olun, ödənişləri planlaşdırın və qərarınızı daha aydın verin."
          />

          {/* Асимметрия намеренная: проверка профиля — главный продукт, и
              карточка у неё крупнее. Три одинаковые карточки с иконкой
              сверху не сообщали бы, что важнее. */}
          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="flex flex-col lg:col-span-2">
              <h3 className="text-xl font-bold tracking-tight text-ink">Kredit profilinizi yoxlayın</h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-gray-600">
                Banka müraciət etməzdən əvvəl kredit almaq ehtimalınızı, borc yükünüzü və nəticəyə təsir edən
                əsas risk faktorlarını görün.
              </p>

              <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-200 pt-5">
                {[
                  { k: "Sənəd", v: "Tələb olunmur" },
                  { k: "Banka sorğu", v: "Göndərilmir" },
                  { k: "Qiymət", v: "Pulsuz" },
                ].map((x) => (
                  <div key={x.k}>
                    <dt className="text-[11px] font-medium text-gray-500">{x.k}</dt>
                    <dd className="mt-0.5 text-sm font-bold text-ink">{x.v}</dd>
                  </div>
                ))}
              </dl>

              <LinkButton href="/az/kredit-yoxlama" className="mt-6 self-start" icon={<ArrowRight size={15} />}>
                İlkin yoxlamaya başla
              </LinkButton>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Card className="flex flex-col">
                <h3 className="text-base font-bold text-ink">Ödənişi planlaşdırın</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600">
                  Fərqli ssenariləri müqayisə edin və aylıq ödənişə təsirini görün.
                </p>
                <Link
                  href="/az/calculators"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  Kalkulyatorlara keç <ArrowRight size={14} aria-hidden />
                </Link>
              </Card>

              <Card className="flex flex-col">
                <h3 className="text-base font-bold text-ink">Sualınıza cavab tapın</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600">
                  Borc yükü, kredit tarixçəsi, gecikmə və bank tələbləri haqqında aydın izahlar.
                </p>
                <Link
                  href="/az/financial-assistant"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  Bilik bazasına bax <ArrowRight size={14} aria-hidden />
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── Типы кредитов ── */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHead title="Hansı kreditlər üçün?" />

          <ul className="mt-8 border-t border-gray-200">
            {loanTypes.map((c) => {
              const payment = calcAnnuityPayment(c.amount, c.rate, c.months);
              const years = c.months / 12;
              const term = c.months >= 24 ? `${years} il` : `${c.months} ay`;
              return (
                <li key={c.title} className="border-b border-gray-200">
                  <Link
                    href={c.href}
                    className="grid grid-cols-[44px_1fr] items-center gap-x-5 gap-y-3 px-2 py-5 transition-colors hover:bg-white md:grid-cols-[44px_1fr_auto_auto]"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-gray-200 bg-white text-gray-500">
                      {c.icon}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-ink">{c.title}</h3>
                      <span className="mt-0.5 block text-[13px] text-gray-600">{c.tag}</span>
                    </div>
                    <div className="col-start-2 flex max-w-full flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm md:col-start-auto">
                      <span className="whitespace-nowrap tabular-nums text-gray-600">
                        {formatNumber(c.amount)} ₼, {term}, {formatPercent(c.rate, 0)}
                      </span>
                      <span className="whitespace-nowrap font-extrabold tabular-nums text-ink">
                        {formatNumber(Math.round(payment))} ₼
                        <span className="text-xs font-semibold text-gray-500"> / ay</span>
                      </span>
                    </div>
                    <span className="col-start-2 inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-brand-700 md:col-start-auto">
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
      </section>

      {/* ── FAQ ── */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHead title="Populyar suallar" />

          <div className="mt-8 grid grid-cols-1 items-start gap-3 md:grid-cols-2 md:gap-x-5">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <button
                    aria-expanded={open}
                    aria-controls={`faq-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-ink"
                    onClick={() => setOpenFaq(open ? null : i)}
                  >
                    {f.q}
                    <ChevronDown
                      size={16}
                      aria-hidden
                      className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && (
                    <p id={`faq-${i}`} className="px-5 pb-4 text-sm leading-relaxed text-gray-600">
                      {f.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Финальный CTA ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl bg-ink px-6 py-14 text-center sm:px-12">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Hazırsınız?</h2>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-300">
              Kredit müraciətindən əvvəl bir neçə dəqiqə vaxtınızı ayırın.
            </p>
            <LinkButton href="/az/kredit-yoxlama" size="lg" className="mt-7" icon={<ArrowRight size={17} />}>
              Pulsuz yoxlamaya başla
            </LinkButton>
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
