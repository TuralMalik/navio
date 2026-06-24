"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  FileSearch,
  Calculator,
  BookOpen,
  TrendingUp,
  Calendar,
  Lightbulb,
  Home,
  Car,
  CreditCard,
  Info,
} from "lucide-react";

const faqs = [
  { q: "Navio kredit verir?", a: "Xeyr. Biz sadəcə məlumat platformasıyıq. Kredit qərarını yalnız bank qəbul edir." },
  { q: "Kredit tarixçəm pisdirsə, nə edə bilərəm?", a: "Cari gecikməni bağlamaq profilinizi yaxşılaşdırır. Navio bu fərqi sizə göstərir." },
  { q: "Nəticə bank qərarını əvəz edirmi?", a: "Xeyr. Nəticə ilkin qiymətləndirmə xarakterindədir. Yekun qərarı bank verir." },
  { q: "İlkin yoxlama üçün sənəd lazımdır?", a: "Heç bir sənəd tələb olunmur. Yalnız əsas maliyyə məlumatlarınızı daxil etmək kifayətdir." },
  { q: "Borc yükü necə hesablanır?", a: "Borc yükü = aylıq kredit ödənişləri / aylıq gəlir × 100. Banklar adətən 70%-dən yuxarı qəbul etmir." },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="bg-white">

      {/* HERO */}
      <section className="py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Banka müraciət etməzdən əvvəl kredit profilinizi yoxlayın
              </h1>
              <p className="text-lg text-gray-500 mb-6 leading-relaxed">
                Kredit profilinizi, aylıq ödənişi və əsas risk faktorlarını əvvəlcədən qiymətləndirin. Daha məlumatlı qərar qəbul edin.
              </p>

              <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-500">
                {[
                  { icon: "💳", text: "Pulsuz ilkin yoxlama" },
                  { icon: "🪪", text: "Şəxsi sənəd tələb olunmur" },
                  { icon: "⚡", text: "Bir neçə dəqiqədə nəticə" },
                ].map((t) => (
                  <div key={t.text} className="flex items-center gap-2">
                    <span>{t.icon}</span>
                    <span>{t.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/az/credit-check"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
                >
                  Kredit yoxlaması başla
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/az/calculators"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Kalkulyatorlardan istifadə et
                </Link>
              </div>
            </div>

            {/* Right — score card */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 w-full max-w-sm">
                {/* Gauge */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-40 h-24 mb-2">
                    <svg viewBox="0 0 160 90" className="w-40 h-24">
                      <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
                      <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round"
                        strokeDasharray="175 220" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                      <span className="text-3xl font-bold text-gray-900">72<span className="text-lg text-gray-400 font-normal"> / 95</span></span>
                      <span className="text-xs text-gray-400">Kredit profili</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-gray-400">0</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full" />
                    <span className="text-xs font-medium text-gray-400">95</span>
                  </div>
                  <span className="mt-3 px-4 py-1 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-full border border-emerald-100">Yaxşı</span>
                </div>
                <p className="text-sm text-gray-500 text-center leading-relaxed">
                  Bank müraciətinə daha hazırlıqlı olmaq üçün profilinizi və risk faktorlarınızı görün.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">Necə işləyir?</h2>
          <div className="w-10 h-1 bg-blue-600 rounded mx-auto mb-12" />

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* connecting line */}
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-gray-100" style={{left:"16.7%", right:"16.7%"}} />

            {[
              { num: "1", icon: <FileSearch size={22} className="text-blue-600" />, title: "Məlumatları daxil edin", desc: "Sadə formu doldurun və maliyyə məlumatlarınızı paylaşın." },
              { num: "2", icon: <TrendingUp size={22} className="text-green-600" />, title: "Analiz edirik", desc: "Sistem məlumatlarınızı analiz edərək kredit profilinizi hesablayır." },
              { num: "3", icon: <Lightbulb size={22} className="text-purple-600" />, title: "Nəticəni alın və təkmilləşdirin", desc: "Nəticəni görün və kredit profilinizi yaxşılaşdırmaq üçün tövsiyələr alın." },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
                    {s.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{s.num}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW NAVIO HELPS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">Navio sizə necə kömək edir?</h2>
          <div className="w-10 h-1 bg-blue-600 rounded mx-auto mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FileSearch size={22} className="text-white" />,
                bg: "bg-blue-600",
                title: "Kredit yoxlaması",
                desc: "Kredit profilinizi və əsas risk faktorlarınızı yoxlayın.",
                cta: "Yoxlamaya başla",
                href: "/az/credit-check",
              },
              {
                icon: <Calculator size={22} className="text-white" />,
                bg: "bg-emerald-500",
                title: "Kredit kalkulyatorları",
                desc: "İstehlak, ipoteka və avtokredit üçün ödənişləri hesablayın.",
                cta: "Kalkulyatorları aç",
                href: "/az/calculators",
              },
              {
                icon: <BookOpen size={22} className="text-white" />,
                bg: "bg-purple-500",
                title: "Maliyyə köməkçisi",
                desc: "Maliyyə vəziyyətinizi yaxşılaşdırmaq üçün tövsiyələr alın.",
                cta: "Köməkçidən istifadə et",
                href: "/az/financial-assistant",
              },
            ].map((c) => (
              <div key={c.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                  {c.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{c.desc}</p>
                <Link href={c.href} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  {c.cta} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU'LL SEE */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">Nəticədə nə görəcəksiniz?</h2>
          <div className="w-10 h-1 bg-blue-600 rounded mx-auto mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <TrendingUp size={22} className="text-blue-500" />, bg: "bg-blue-50", title: "Kredit profili", desc: "Ümumi vəziyyəti 0–95 arası ilkin qiymətləndirmə ilə görün." },
              { icon: <Calendar size={22} className="text-emerald-500" />, bg: "bg-emerald-50", title: "Borc yükü", desc: "Yeni kreditdən sonra aylıq ödənişin gəlirə təsirini anlayın." },
              { icon: <Lightbulb size={22} className="text-amber-500" />, bg: "bg-amber-50", title: "Tövsiyələr", desc: "Profilinizi yaxşılaşdırmaq üçün praktik addımları görün." },
            ].map((t) => (
              <div key={t.title} className="flex gap-4 items-start p-5 rounded-2xl border border-gray-100">
                <div className={`w-12 h-12 rounded-xl ${t.bg} flex items-center justify-center shrink-0`}>
                  {t.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{t.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOAN TYPES */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">Hansı kreditlər üçün istifadə edə bilərsiniz?</h2>
          <div className="w-10 h-1 bg-blue-600 rounded mx-auto mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <CreditCard size={22} className="text-blue-500" />, bg: "bg-blue-50", title: "İstehlak krediti", desc: "Nağd pul ehtiyaclarınız üçün kredit imkanlarını hesablayın.", href: "/az/calculators/consumer-loan" },
              { icon: <Home size={22} className="text-emerald-500" />, bg: "bg-emerald-50", title: "İpoteka krediti", desc: "Ev almaq üçün ipoteka kreditlərinin şərtlərini hesablayın.", href: "/az/calculators/mortgage" },
              { icon: <Car size={22} className="text-purple-500" />, bg: "bg-purple-50", title: "Avtokredit", desc: "Avtomobil almaq üçün kredit şərtlərini hesablayın.", href: "/az/calculators/auto-loan" },
            ].map((c) => (
              <div key={c.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                  {c.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{c.desc}</p>
                <Link href={c.href} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Hesabla <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">Populyar suallar</h2>
          <div className="w-10 h-1 bg-blue-600 rounded mx-auto mb-10" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {faqs.map((f, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-gray-800 text-sm">{f.q}</span>
                  <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3 border border-blue-200 rounded-2xl p-5 bg-blue-50">
            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 leading-relaxed">
              <strong>Navio bank deyil.</strong> Heç bir kredit vermir və banka müraciətin nəticəsinə zəmanət vermir. Nəticələr ilkin qiymətləndirmə xarakterindədir.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}
