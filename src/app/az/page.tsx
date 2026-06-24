"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  FileSearch,
  Calculator,
  BookOpen,
  ArrowRight,
  Shield,
  Clock,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const faqs = [
  {
    q: "Navio kredit verir?",
    a: "Xeyr. Biz sadəcə məlumat platformasıyıq. Kredit qərarını yalnız bank qəbul edir. Bizim nəticə ilkin yoxlama xarakter daşıyır.",
  },
  {
    q: "Hansı sənədlər lazımdır?",
    a: "Heç bir sənəd tələb olunmur. Yalnız əsas maliyyə məlumatlarınızı daxil etmək kifayətdir.",
  },
  {
    q: "Borc yükü nədir?",
    a: "Borc yükü gəlirinizin neçə faizinin kredit ödənişlərinə getdiyini göstərir. Banklar adətən 70%-dən yuxarı borc yükü qəbul etmir.",
  },
  {
    q: "Kredit tarixçəm pisdirsə nə olur?",
    a: "Gecikmələr skoru aşağı salır. Cari gecikməni bağlamaq profilinizi yaxşılaşdırır. Navio bu fərqi sizə göstərir.",
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="bg-white">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1f3d] via-[#1a3460] to-[#1e4db7]">
        {/* subtle grid */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm40 0h1v40h-1zM0 0v1h40V0zm0 40v1h40v-1z'/%3E%3C/g%3E%3C/svg%3E\")"}} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-100 mb-6">
            <Shield size={14} />
            Sənəd tələb olunmur · Pulsuzdur · 2 dəqiqə
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
            Banka getməzdən əvvəl<br />
            <span className="text-blue-300">cavabı bil</span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl mx-auto leading-relaxed">
            Kredit alıb-almayacağını, aylıq ödənişin nə qədər olacağını və hansı risklərin olduğunu əvvəlcədən öyrən.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/az/credit-check"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-blue-900 bg-white hover:bg-blue-50 transition-all shadow-xl text-base"
            >
              İlkin yoxlamanı başla
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/az/calculators/consumer-loan"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white border border-white/30 hover:bg-white/10 transition-all text-base"
            >
              Ödənişi hesabla
            </Link>
          </div>

          {/* Mini score preview */}
          <div className="mt-14 flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 w-full max-w-sm text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">Nümunə nəticə</span>
                <span className="text-xs bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-400/30">Yaxşı profil</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                    <circle cx="28" cy="28" r="22" fill="none" stroke="#60a5fa" strokeWidth="6"
                      strokeDasharray={`${(72 / 100) * 138} 138`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">72</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">72 <span className="text-sm text-blue-300 font-normal">/ 95</span></p>
                  <p className="text-xs text-blue-300">Kredit skoru</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: "Borc yükü", val: "Orta", ok: false },
                  { label: "İş stajı", val: "Yaxşı", ok: true },
                  { label: "Kredit tarixçəsi", val: "Yaxşı", ok: true },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between text-xs">
                    <span className="text-blue-200">{f.label}</span>
                    <span className={f.ok ? "text-emerald-300 font-semibold" : "text-amber-300 font-semibold"}>{f.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — N26 style */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4">Necə işləyir?</p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-16 max-w-xl leading-tight">
            3 addımda kredit profilini öyrən
          </h2>

          <div className="space-y-0">
            {[
              {
                num: "01",
                title: "Məlumatlarını daxil et",
                desc: "Gəlirini, mövcud ödənişlərini və bir neçə əsas məlumatı qeyd et. Sənəd lazım deyil, FIN tələb edilmir.",
              },
              {
                num: "02",
                title: "Nəticəni dərhal gör",
                desc: "Kredit skoru, borc yükü və əsas risk faktorları saniyələr içində hesablanır.",
              },
              {
                num: "03",
                title: "Nə etməli olduğunu bil",
                desc: "Profili gücləndirib bankda şansını artırmaq üçün konkret tövsiyələr alırsan.",
              },
            ].map((s, i) => (
              <div key={s.num} className={`flex flex-col md:flex-row gap-8 md:gap-16 items-start py-12 ${i < 2 ? "border-b border-gray-100" : ""}`}>
                <span className="text-7xl md:text-8xl font-black text-gray-100 leading-none shrink-0 select-none md:w-36 text-center">
                  {s.num}
                </span>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-lg text-gray-500 leading-relaxed max-w-lg">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/az/credit-check"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors text-base"
            >
              İndi yoxla — pulsuzdur
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3 TOOLS */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Navio-da nə var?</h2>
            <p className="text-gray-500">Kredit qərarından əvvəl lazım olan hər şey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FileSearch size={26} className="text-blue-600" />,
                title: "Kredit yoxlaması",
                desc: "Kredit alıb-almayacağını, borc yükünü və risk faktorlarını əvvəlcədən gör.",
                cta: "Yoxlamağa başla",
                href: "/az/credit-check",
                badge: "Ən populyar",
              },
              {
                icon: <Calculator size={26} className="text-blue-600" />,
                title: "Kredit kalkulyatoru",
                desc: "Aylıq ödənişi, ümumi xərci və erkən ödənişin nə qədər qənaət etdirəcəyini hesabla.",
                cta: "Hesabla",
                href: "/az/calculators",
                badge: null,
              },
              {
                icon: <BookOpen size={26} className="text-blue-600" />,
                title: "Maliyyə köməkçisi",
                desc: "Borc yükü, kredit tarixçəsi, bank tələbləri haqqında sadə dildə izahatlar.",
                cta: "Oxu",
                href: "/az/financial-assistant",
                badge: null,
              },
            ].map((card) => (
              <div key={card.title} className="relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all flex flex-col gap-4">
                {card.badge && (
                  <span className="absolute top-4 right-4 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold border border-blue-100">{card.badge}</span>
                )}
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
                <Link
                  href={card.href}
                  className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {card.cta}
                  <ChevronRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BANNER */}
      <section className="bg-blue-600 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-white">
            {[
              { icon: <Shield size={18} />, text: "Sənəd tələb olunmur" },
              { icon: <Clock size={18} />, text: "2 dəqiqədə nəticə" },
              { icon: <CheckCircle2 size={18} />, text: "FIN tələb edilmir" },
              { icon: <CheckCircle2 size={18} />, text: "Tamamilə pulsuzdur" },
            ].map((t) => (
              <div key={t.text} className="flex items-center gap-2 font-medium">
                <span className="text-blue-200">{t.icon}</span>
                {t.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tez-tez soruşulanlar</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-gray-800 text-sm">{f.q}</span>
                  <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-white py-14 border-t border-gray-100">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Hazırsan?
          </h2>
          <p className="text-gray-500 mb-6">Banka getməzdən əvvəl 2 dəqiqə vaxt ayır.</p>
          <Link
            href="/az/credit-check"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg text-base"
          >
            İlkin yoxlamanı başla
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </main>
  );
}
