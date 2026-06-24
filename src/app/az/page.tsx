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
      <section className="relative py-16 md:py-24 overflow-hidden" style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #1e40af 100%)" }}>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold mb-7 border border-white/20">
                <Zap size={12} />
                Pulsuz · Sanadsız · 3 dəqiqə
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
                Banka getmədən əvvəl kredit profilinizi bilin
              </h1>

              <p className="text-base text-blue-100 mb-8 leading-relaxed max-w-md">
                Aylıq ödənişinizi, borc yükünüzü və risk faktorlarınızı əvvəlcədən görün.
                Doğru qərar verin, daha sərfəli şərtlərlə kredit əldə edin.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/az/kredit-yoxlama"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-blue-700 bg-white hover:bg-blue-50 transition-all shadow-lg"
                >
                  Kredit yoxlaması başla
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <Link
                  href="/az/calculators"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white border border-white/40 hover:bg-white/10 transition-all"
                >
                  <Calculator size={16} />
                  Kalkulyatorlar
                </Link>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <Shield size={14} />, title: "100%", sub: "Təhlükəsiz" },
                  { icon: <Zap size={14} />, title: "3 dəqiqə", sub: "Nəticə vaxtı" },
                  { icon: <CheckCircle size={14} />, title: "Sanadsız", sub: "Sadə yoxlama" },
                  { icon: <Lock size={14} />, title: "Məlumatınız", sub: "mühafizə olunur" },
                ].map((b) => (
                  <div key={b.title} className="flex flex-col items-center gap-1 bg-white/10 rounded-xl px-3 py-2.5 border border-white/15">
                    <span className="text-blue-200">{b.icon}</span>
                    <span className="text-white text-xs font-bold">{b.title}</span>
                    <span className="text-blue-200 text-xs">{b.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — detailed credit profile card */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                {/* Card header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">Kredit profili</span>
                    <Info size={13} className="text-gray-400" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <CheckCircle size={11} /> Yaxşı
                  </span>
                </div>

                {/* Gauge */}
                <div className="flex flex-col items-center px-6 pb-3">
                  <div className="relative">
                    <svg viewBox="0 0 180 100" className="w-44">
                      <path d="M 15 90 A 75 75 0 0 1 165 90" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
                      <path d="M 15 90 A 75 75 0 0 1 165 90" fill="none" stroke="url(#g1)" strokeWidth="14" strokeLinecap="round"
                        strokeDasharray="175 240" />
                      <defs>
                        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                      <span className="text-3xl font-extrabold text-gray-900 leading-none">
                        72 <span className="text-lg text-gray-400 font-normal">/ 95</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">Yaxşı nəticə</p>
                  <p className="text-xs text-gray-400 mt-0.5">Mövcud tarix: 27 May 2025</p>
                </div>

                {/* Metric row */}
                <div className="grid grid-cols-3 gap-0 border-t border-gray-100 mx-0">
                  {[
                    { icon: <BarChart2 size={14} className="text-blue-500" />, label: "Borc yükü", value: "34%", tag: "Yaxşı", tagColor: "text-emerald-600" },
                    { icon: <Calculator size={14} className="text-blue-500" />, label: "Aylıq ödəniş", value: "280 ₼", tag: "İdarəolunan", tagColor: "text-blue-600" },
                    { icon: <BarChart2 size={14} className="text-blue-500" />, label: "Risk faktoru", value: "Aşağı", tag: "Təhlükəsiz", tagColor: "text-emerald-600" },
                  ].map((m, i) => (
                    <div key={m.label} className={`flex flex-col items-center py-3 px-2 ${i < 2 ? "border-r border-gray-100" : ""}`}>
                      <span className="mb-1">{m.icon}</span>
                      <span className="text-xs text-gray-400 mb-0.5 text-center leading-tight">{m.label}</span>
                      <span className="text-sm font-bold text-gray-900">{m.value}</span>
                      <span className={`text-xs font-medium ${m.tagColor}`}>{m.tag}</span>
                    </div>
                  ))}
                </div>

                {/* Factors */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-700 mb-3">Faktorlar</p>
                  <div className="space-y-2.5">
                    {factors.map((f) => (
                      <div key={f.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">{f.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400">{f.score}/{f.max}</span>
                            <span className={`text-xs font-semibold ${f.textColor}`}>{f.rating}</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${f.color} rounded-full`} style={{ width: `${f.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer link */}
                <div className="border-t border-gray-100 px-6 py-3">
                  <Link href="/az/kredit-yoxlama" className="flex items-center justify-between text-xs text-gray-500 hover:text-blue-600 transition-colors group">
                    <span className="flex items-center gap-1.5">
                      <Shield size={12} className="text-blue-400" />
                      Profilinizi yaxşılaşdırmaq üçün fərdiləşdirilmiş tövsiyələr əldə edin.
                    </span>
                    <ChevronRight size={13} className="text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <CreditCard size={24} className="text-blue-600" />,
                iconBg: "bg-blue-50",
                title: "Sürətli kredit yoxlaması",
                desc: "Cəmi 3 dəqiqəyə kredit profilinizi öyrənin və imkanlarınızı görün.",
                href: "/az/kredit-yoxlama",
              },
              {
                icon: <Calculator size={24} className="text-purple-600" />,
                iconBg: "bg-purple-50",
                title: "Dəqiq kalkulyatorlar",
                desc: "Aylıq ödəniş, faiz dərəcəsi və ümumi məsrəfləri əvvəlcədən hesablayın.",
                href: "/az/calculators",
              },
              {
                icon: <BookOpen size={24} className="text-emerald-600" />,
                iconBg: "bg-emerald-50",
                title: "Ağıllı maliyyə köməkçisi",
                desc: "Xərclərini izləyin, büdcənizi idarə edin və daha sağlam maliyyə planı qurun.",
                href: "/az/financial-assistant",
              },
            ].map((c) => (
              <Link
                key={c.title}
                href={c.href}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-14 h-14 rounded-2xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                  {c.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm mb-1">{c.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
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
