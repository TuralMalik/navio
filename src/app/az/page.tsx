"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Calculator,
  BookOpen,
  Info,
  Shield,
  Zap,
  CreditCard,
  CheckCircle,
  ChevronRight,
  BarChart2,
  Lock,
  Banknote,
  House,
  Car,
} from "lucide-react";

const faqs = [
  { q: "Navio kredit verir?", a: "Xeyr. Biz sadəcə məlumat platformasıyıq. Kredit qərarını yalnız bank qəbul edir." },
  { q: "Kredit tarixçəm pisdirsə, nə edə bilərəm?", a: "Cari gecikməni bağlamaq profilinizi yaxşılaşdırır. Navio bu fərqi sizə göstərir." },
  { q: "Nəticə bank qərarını əvəz edirmi?", a: "Xeyr. Nəticə ilkin qiymətləndirmə xarakterindədir. Yekun qərarı bank verir." },
  { q: "İlkin yoxlama üçün sənəd lazımdır?", a: "Heç bir sənəd tələb olunmur. Yalnız əsas maliyyə məlumatlarınızı daxil etmək kifayətdir." },
  { q: "Borc yükü necə hesablanır?", a: "Borc yükü = aylıq kredit ödənişləri / aylıq gəlir × 100. Banklar adətən 70%-dən yuxarı qəbul etmir." },
];

const factors = [
  { label: "Ödəniş davranışı", score: 85, max: 100, rating: "Yaxşı", color: "bg-emerald-500", textColor: "text-emerald-600" },
  { label: "Kredit tarix uzunluğu", score: 70, max: 100, rating: "Orta", color: "bg-blue-500", textColor: "text-blue-600" },
  { label: "Kredit istifadə nisbəti", score: 65, max: 100, rating: "Orta", color: "bg-blue-500", textColor: "text-blue-600" },
  { label: "Yeni kredit sorğuları", score: 90, max: 100, rating: "Yaxşı", color: "bg-emerald-500", textColor: "text-emerald-600" },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="bg-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden bg-white py-16 md:py-24">
        {/* Decorative blobs — soft, no hard edges */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full" style={{ background: "radial-gradient(circle at 70% 30%, #dbeafe 0%, transparent 60%)", opacity: 0.6 }} />
          <div className="absolute bottom-0 right-20 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle at 60% 60%, #ede9fe 0%, transparent 55%)", opacity: 0.5 }} />
          <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, #bfdbfe 0%, transparent 65%)", opacity: 0.3 }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5" style={{ color: "#0f1f3d" }}>
                Kredit almaq <span style={{ color: "#2563eb" }}>şansınızı</span> yoxlayın
              </h1>

              <p className="text-base text-gray-500 mb-8 leading-relaxed max-w-md">
                Banka müraciət etməzdən əvvəl kredit almaq ehtimalınızı yoxlayın.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/az/kredit-yoxlama"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg"
                  style={{ background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)" }}
                >
                  İlkin yoxlamaya başla
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <Link
                  href="/az/calculators"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-700 transition-all"
                >
                  <Calculator size={16} />
                  Kalkulyatorlara keç
                </Link>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Zap size={16} className="text-blue-500" />, title: "3 dəqiqə", sub: "Nəticə vaxtı" },
                  { icon: <CheckCircle size={16} className="text-blue-500" />, title: "Sənədsiz", sub: "Sadə yoxlama" },
                  { icon: <Shield size={16} className="text-blue-500" />, title: "Pulsuz", sub: "Heç bir ödəniş yoxdur" },
                ].map((b) => (
                  <div key={b.title} className="flex flex-col items-center gap-1.5 border border-gray-100 rounded-2xl px-3 py-3 bg-white shadow-sm">
                    {b.icon}
                    <span className="text-xs font-bold text-gray-800">{b.title}</span>
                    <span className="text-xs text-gray-400 text-center leading-tight">{b.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — credit profile card */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100">
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">Kredit profili</span>
                    <Info size={13} className="text-gray-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-400">Nümunə nəticə</span>
                </div>

                <div className="flex flex-col items-center px-6 pb-3">
                  <div className="relative">
                    <svg viewBox="0 0 180 100" className="w-44">
                      <path d="M 15 90 A 75 75 0 0 1 165 90" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
                      <path d="M 15 90 A 75 75 0 0 1 165 90" fill="none" stroke="url(#gh)" strokeWidth="14" strokeLinecap="round" strokeDasharray="175 240" />
                      <defs>
                        <linearGradient id="gh" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                      <span className="text-3xl font-extrabold text-gray-900 leading-none">
                        72 <span className="text-lg text-gray-400 font-normal">/ 100</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">Yaxşı nəticə</p>
                </div>

                <div className="grid grid-cols-3 gap-0 border-t border-gray-100">
                  {[
                    { icon: <BarChart2 size={14} className="text-blue-500" />, label: "Borc yükü", value: "34%", tag: "Normal", tagColor: "text-emerald-600" },
                    { icon: <Calculator size={14} className="text-blue-500" />, label: "Aylıq ödəniş", value: "280 ₼", tag: "Kafi", tagColor: "text-blue-600" },
                    { icon: <BarChart2 size={14} className="text-blue-500" />, label: "Risk göstəricisi", value: "Aşağı", tag: "Təhlükəsiz", tagColor: "text-emerald-600" },
                  ].map((m, i) => (
                    <div key={m.label} className={`flex flex-col items-center py-3 px-2 ${i < 2 ? "border-r border-gray-100" : ""}`}>
                      <span className="mb-1">{m.icon}</span>
                      <span className="text-xs text-gray-400 mb-0.5 text-center leading-tight">{m.label}</span>
                      <span className="text-sm font-bold text-gray-900">{m.value}</span>
                      <span className={`text-xs font-medium ${m.tagColor}`}>{m.tag}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 px-5 py-3">
                  <Link href="/az/kredit-yoxlama" className="flex items-center justify-between text-xs text-gray-500 hover:text-blue-600 transition-colors group">
                    <span className="flex items-center gap-1.5">
                      <Shield size={12} className="text-blue-400" />
                      Profilinizi yaxşılaşdırmaq üçün tövsiyələri görün.
                    </span>
                    <ChevronRight size={13} className="text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Necə işləyir?</h2>
            <div className="w-10 h-1 bg-blue-600 rounded mx-auto" />
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200" />
            {[
              { num: "1", icon: <CreditCard size={24} className="text-blue-600" />, bg: "bg-blue-50 border-blue-100", title: "Məlumatları daxil edin", desc: "Sadə formu doldurun, şəxsi sənəd tələb olunmur." },
              { num: "2", icon: <BarChart2 size={24} className="text-purple-600" />, bg: "bg-purple-50 border-purple-100", title: "Analiz edirik", desc: "Sistem kredit profilinizi avtomatik hesablayır." },
              { num: "3", icon: <BookOpen size={24} className="text-emerald-600" />, bg: "bg-emerald-50 border-emerald-100", title: "Nəticəni alın", desc: "Nəticəni görün, tövsiyələrlə profilinizi yaxşılaşdırın." },
            ].map((s) => (
              <div key={s.num} className="group flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className={`w-20 h-20 rounded-2xl ${s.bg} border-2 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    {s.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow">
                    {s.num}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Navio sizə necə kömək edir?</h2>
            <div className="w-10 h-1 bg-blue-600 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <CreditCard size={24} className="text-white" />, gradient: "from-blue-500 to-blue-700", title: "Kredit yoxlaması", desc: "Cəmi 3 dəqiqəyə kredit profilinizi öyrənin və imkanlarınızı görün.", cta: "Yoxlamaya başla", href: "/az/kredit-yoxlama" },
              { icon: <Calculator size={24} className="text-white" />, gradient: "from-emerald-500 to-teal-600", title: "Kredit kalkulyatorları", desc: "İstehlak, ipoteka və avtokredit üçün ödənişləri hesablayın.", cta: "Kalkulyatorları aç", href: "/az/calculators" },
              { icon: <BookOpen size={24} className="text-white" />, gradient: "from-purple-500 to-indigo-600", title: "Maliyyə köməkçisi", desc: "Maliyyə vəziyyətinizi yaxşılaşdırmaq üçün tövsiyələr alın.", cta: "Köməkçidən istifadə et", href: "/az/financial-assistant" },
            ].map((c) => (
              <div key={c.title} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  {c.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{c.desc}</p>
                <Link href={c.href} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all duration-200">
                  {c.cta} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOAN TYPES ── */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Hansı kreditlər üçün?</h2>
            <div className="w-10 h-1 bg-blue-600 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Banknote size={24} className="text-white" />, gradient: "from-blue-500 to-blue-700", title: "İstehlak krediti", desc: "Nağd pul ehtiyaclarınız üçün kredit imkanlarını hesablayın.", href: "/az/calculators/consumer-loan" },
              { icon: <House size={24} className="text-white" />, gradient: "from-emerald-500 to-teal-600", title: "İpoteka krediti", desc: "Ev almaq üçün ipoteka şərtlərini hesablayın.", href: "/az/calculators/mortgage" },
              { icon: <Car size={24} className="text-white" />, gradient: "from-purple-500 to-indigo-600", title: "Avtokredit", desc: "Avtomobil almaq üçün kredit şərtlərini hesablayın.", href: "/az/calculators/auto-loan" },
            ].map((c) => (
              <div key={c.title} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center">
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

      {/* ── FAQ ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Populyar suallar</h2>
            <div className="w-10 h-1 bg-blue-600 rounded mx-auto" />
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

      {/* ── CTA BANNER ── */}
      <section className="py-14" style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)" }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Hazırsınız?</h2>
          <p className="text-blue-100 text-sm mb-7">Kredit müraciətindən əvvəl bir neçə dəqiqə vaxtınızı ayırın.</p>
          <Link
            href="/az/kredit-yoxlama"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-blue-700 bg-white hover:bg-blue-50 shadow-lg transition-all"
          >
            Pulsuz yoxlamanı başla
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </section>

      {/* ── DISCLAIMER ── */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3 border border-blue-100 rounded-2xl p-5 bg-blue-50">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Navio bank deyil.</strong> Heç bir kredit vermir və banka müraciətin nəticəsinə zəmanət vermir. Nəticələr ilkin qiymətləndirmə xarakterindədir.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}
