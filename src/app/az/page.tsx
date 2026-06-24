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
  Shield,
  Zap,
  CheckCircle2,
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
    <main className="bg-white overflow-x-hidden">

      {/* HERO — gradient background */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold mb-6 border border-white/20">
                <Zap size={12} />
                Pulsuz · Sənədsiz · 3 dəqiqə
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
                Banka getməzdən əvvəl kredit profilinizi bilin
              </h1>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                Aylıq ödənişinizi, borc yükünüzü və risk faktorlarınızı əvvəlcədən görün. Reddən qaçının.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/az/credit-check"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-bold text-blue-700 bg-white hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200"
                >
                  Kredit yoxlaması başla
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <Link
                  href="/az/calculators"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-white border border-white/40 hover:bg-white/10 transition-all duration-200"
                >
                  Kalkulyatorlar
                </Link>
              </div>

              <div className="flex flex-wrap gap-5 mt-8">
                {[
                  { icon: <CheckCircle2 size={15} />, text: "Pulsuz" },
                  { icon: <Shield size={15} />, text: "Şəxsi sənəd tələb olunmur" },
                  { icon: <Zap size={15} />, text: "Dərhal nəticə" },
                ].map((t) => (
                  <div key={t.text} className="flex items-center gap-1.5 text-sm text-blue-100">
                    <span className="text-blue-300">{t.icon}</span>
                    {t.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — score card */}
            <div className="flex justify-center lg:justify-end">
              <div className="group bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm hover:shadow-blue-300/40 hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col items-center mb-5">
                  <div className="relative w-44 h-26 mb-3">
                    <svg viewBox="0 0 160 90" className="w-44 h-auto">
                      <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#e5e7eb" strokeWidth="13" strokeLinecap="round" />
                      <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="url(#gaugeGrad)" strokeWidth="13" strokeLinecap="round"
                        strokeDasharray="175 220" />
                      <defs>
                        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                      <span className="text-4xl font-extrabold text-gray-900">72<span className="text-xl text-gray-400 font-normal"> / 95</span></span>
                      <span className="text-xs text-gray-400 mt-0.5">Kredit profili</span>
                    </div>
                  </div>
                  <span className="mt-1 px-5 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-full border border-emerald-100">
                    ✓ Yaxşı
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {[
                    { label: "Borc yükü", value: "34%", color: "text-emerald-600" },
                    { label: "Aylıq ödəniş", value: "280 ₼", color: "text-blue-600" },
                    { label: "Risk faktoru", value: "Aşağı", color: "text-green-600" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{row.label}</span>
                      <span className={`font-bold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Necə işləyir?</h2>
            <div className="w-12 h-1 bg-blue-600 rounded mx-auto" />
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200" />

            {[
              { num: "1", icon: <FileSearch size={24} className="text-blue-600" />, bg: "bg-blue-50 border-blue-100", title: "Məlumatları daxil edin", desc: "Sadə formu doldurun, şəxsi sənəd tələb olunmur." },
              { num: "2", icon: <TrendingUp size={24} className="text-purple-600" />, bg: "bg-purple-50 border-purple-100", title: "Analiz edirik", desc: "Sistem kredit profilinizi avtomatik hesablayır." },
              { num: "3", icon: <Lightbulb size={24} className="text-emerald-600" />, bg: "bg-emerald-50 border-emerald-100", title: "Nəticəni alın", desc: "Nəticəni görün, tövsiyələrlə profilinizi yaxşılaşdırın." },
            ].map((s) => (
              <div key={s.num} className="group flex flex-col items-center text-center cursor-default">
                <div className="relative mb-5">
                  <div className={`w-20 h-20 rounded-2xl ${s.bg} border-2 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    {s.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow">
                    {s.num}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW NAVIO HELPS */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Navio sizə necə kömək edir?</h2>
            <div className="w-12 h-1 bg-blue-600 rounded mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FileSearch size={24} className="text-white" />,
                gradient: "from-blue-500 to-blue-700",
                title: "Kredit yoxlaması",
                desc: "Kredit profilinizi və əsas risk faktorlarınızı yoxlayın.",
                cta: "Yoxlamaya başla",
                href: "/az/credit-check",
              },
              {
                icon: <Calculator size={24} className="text-white" />,
                gradient: "from-emerald-500 to-teal-600",
                title: "Kredit kalkulyatorları",
                desc: "İstehlak, ipoteka və avtokredit üçün ödənişləri hesablayın.",
                cta: "Kalkulyatorları aç",
                href: "/az/calculators",
              },
              {
                icon: <BookOpen size={24} className="text-white" />,
                gradient: "from-purple-500 to-indigo-600",
                title: "Maliyyə köməkçisi",
                desc: "Maliyyə vəziyyətinizi yaxşılaşdırmaq üçün tövsiyələr alın.",
                cta: "Köməkçidən istifadə et",
                href: "/az/financial-assistant",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  {c.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{c.desc}</p>
                <Link href={c.href} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all duration-200">
                  {c.cta} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU'LL SEE */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Nəticədə nə görəcəksiniz?</h2>
            <div className="w-12 h-1 bg-blue-600 rounded mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <TrendingUp size={22} className="text-blue-600" />, bg: "bg-blue-50", border: "border-blue-100 hover:border-blue-300", title: "Kredit profili", desc: "0–95 arası ilkin qiymətləndirmə ilə ümumi vəziyyətinizi görün." },
              { icon: <Calendar size={22} className="text-emerald-600" />, bg: "bg-emerald-50", border: "border-emerald-100 hover:border-emerald-300", title: "Borc yükü", desc: "Yeni kreditdən sonra aylıq ödənişin gəlirə faiz nisbətini anlayın." },
              { icon: <Lightbulb size={22} className="text-amber-600" />, bg: "bg-amber-50", border: "border-amber-100 hover:border-amber-300", title: "Tövsiyələr", desc: "Profilinizi yaxşılaşdırmaq üçün konkret addımları görün." },
            ].map((t) => (
              <div key={t.title} className={`group flex gap-4 items-start p-6 rounded-2xl border-2 ${t.border} transition-all duration-200 hover:shadow-md cursor-default`}>
                <div className={`w-12 h-12 rounded-xl ${t.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}>
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
      <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Hansı kreditlər üçün?</h2>
            <div className="w-12 h-1 bg-blue-600 rounded mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <CreditCard size={24} className="text-white" />, gradient: "from-blue-500 to-blue-700", title: "İstehlak krediti", desc: "Nağd pul ehtiyaclarınız üçün kredit imkanlarını hesablayın.", href: "/az/calculators/consumer-loan" },
              { icon: <Home size={24} className="text-white" />, gradient: "from-emerald-500 to-teal-600", title: "İpoteka krediti", desc: "Ev almaq üçün ipoteka şərtlərini hesablayın.", href: "/az/calculators/mortgage" },
              { icon: <Car size={24} className="text-white" />, gradient: "from-purple-500 to-indigo-600", title: "Avtokredit", desc: "Avtomobil almaq üçün kredit şərtlərini hesablayın.", href: "/az/calculators/auto-loan" },
            ].map((c) => (
              <div
                key={c.title}
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-5 shadow group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                  {c.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{c.desc}</p>
                <Link href={c.href} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all duration-200">
                  Hesabla <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Populyar suallar</h2>
            <div className="w-12 h-1 bg-blue-600 rounded mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {faqs.map((f, i) => (
              <div key={i} className={`border-2 rounded-xl overflow-hidden transition-colors duration-200 ${openFaq === i ? "border-blue-300 bg-blue-50/40" : "border-gray-100 hover:border-blue-200"}`}>
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-gray-800 text-sm">{f.q}</span>
                  <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180 text-blue-500" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-blue-100 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Hazırsınız?</h2>
          <p className="text-blue-100 mb-8">Kredit müraciətindən əvvəl bir neçə dəqiqə vaxtınızı ayırın.</p>
          <Link
            href="/az/credit-check"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-blue-700 bg-white hover:bg-blue-50 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Pulsuz yoxlamanı başla
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="py-10 bg-white">
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
