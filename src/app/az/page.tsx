"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronRight,
  CheckCircle2,
  FileSearch,
  Calculator,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";

const slides = [
  {
    badge: "Kredit yoxlaması",
    title: "Kredit profilinizi əvvəlcədən qiymətləndirin",
    subtitle:
      "Banka müraciət etməzdən əvvəl borc yükünüzü, kredit tarixçənizi və əsas risk faktorlarını görün.",
    cta: { label: "İlkin yoxlama", href: "/az/credit-check" },
    perks: ["2 dəqiqəlik yoxlama", "Sənəd tələb olunmur", "Nəticə dərhal göstərilir"],
    preview: "credit",
  },
  {
    badge: "Kredit kalkulyatoru",
    title: "Kredit ödənişinizi əvvəlcədən hesablayın",
    subtitle: "İstehlak krediti, ipoteka və avtokredit üçün aylıq ödənişi, faiz xərclərini və erkən ödənişin təsirini görün.",
    cta: { label: "Kalkulyatora keç", href: "/az/calculators" },
    perks: ["Aylıq ödəniş", "Faiz xərci hesabı", "Erkən ödəniş qənaəti"],
    preview: "calc",
  },
  {
    badge: "Maliyyə köməkçisi",
    title: "Maliyyə suallarınıza sadə cavablar",
    subtitle: "Kredit tarixçəsi, borc yükü, erkən ödəniş və bank tələbləri haqqında aydın izahatlar alın.",
    cta: { label: "Suallara bax", href: "/az/financial-assistant" },
    perks: [
      "Borc yükü nədir?",
      "Erkən ödəniş sərfəlidirmi?",
      "Bank niyə rədd edə bilər?",
    ],
    preview: "assist",
  },
];

function CreditPreview() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-full max-w-xs">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kredit profili</span>
        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Yaxşı</span>
      </div>
      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#e5e7eb" strokeWidth="7" />
            <circle cx="32" cy="32" r="26" fill="none" stroke="#3b82f6" strokeWidth="7"
              strokeDasharray={`${(68 / 100) * 163} 163`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-gray-900">68</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">68<span className="text-sm text-gray-400 font-normal">/100</span></p>
          <p className="text-xs text-gray-400">Kredit skoru</p>
        </div>
      </div>
      {[
        { label: "Borc yükü", val: "Orta" },
        { label: "Kredit tarixçəsi", val: "Yaxşı" },
        { label: "İş stajı", val: "Yaxşı" },
        { label: "Yaş", val: "Orta" },
      ].map((f) => (
        <div key={f.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0 text-sm">
          <span className="text-gray-600">{f.label}</span>
          <span className={`font-semibold ${f.val === "Yaxşı" ? "text-emerald-600" : "text-amber-600"}`}>{f.val}</span>
        </div>
      ))}
    </div>
  );
}

function CalcPreview() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-full max-w-xs">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Hesablama nəticəsi</p>
      {[
        { label: "Kredit məbləği", value: "10 000 ₼" },
        { label: "Müddət", value: "24 ay" },
        { label: "Aylıq ödəniş", value: "478 ₼", highlight: true },
        { label: "Ümumi ödəniş", value: "11 472 ₼" },
        { label: "Faiz xərci", value: "1 472 ₼" },
      ].map((r) => (
        <div key={r.label} className={`flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm ${r.highlight ? "font-bold" : ""}`}>
          <span className="text-gray-500">{r.label}</span>
          <span className={r.highlight ? "text-blue-700" : "text-gray-800"}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function AssistPreview() {
  const questions = [
    "Borc yükü nədir və necə hesablanır?",
    "Kredit tarixçəsi pisdirsə, nə etmək olar?",
    "Erkən ödəniş həmişə sərfəlidirmi?",
  ];
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-full max-w-xs">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Populyar suallar</p>
      <div className="space-y-2">
        {questions.map((q) => (
          <div key={q} className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer group">
            <BookOpen size={14} className="text-blue-400 shrink-0 mt-0.5" />
            <span className="text-xs text-gray-700 group-hover:text-blue-700 leading-relaxed">{q}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const previewMap: Record<string, React.ReactNode> = {
  credit: <CreditPreview />,
  calc: <CalcPreview />,
  assist: <AssistPreview />,
};

const howItWorks = [
  {
    step: "01",
    title: "Məlumatları daxil edin",
    desc: "Gəliriniz, mövcud ödənişləriniz və əsas məlumatları qeyd edin.",
  },
  {
    step: "02",
    title: "İlkin nəticəni görün",
    desc: "Kredit profiliniz və əsas risk faktorları hesablanır.",
  },
  {
    step: "03",
    title: "Tövsiyələri alın",
    desc: "Nəticənizi yaxşılaşdırmaq üçün nələrə diqqət etməli olduğunuzu görün.",
  },
];

const assessedFactors = [
  {
    icon: <TrendingUp size={22} className="text-blue-600" />,
    title: "Borc yükü",
    desc: "Gəlirinizin hansı hissəsinin kredit ödənişlərinə yönəldildiyini göstərir.",
  },
  {
    icon: <Shield size={22} className="text-blue-600" />,
    title: "Kredit tarixçəsi",
    desc: "Gecikmələr və əvvəlki kredit davranışının təsirini nəzərə alır.",
  },
  {
    icon: <CheckCircle2 size={22} className="text-blue-600" />,
    title: "İş stajı və gəlir",
    desc: "Gəlirin sabitliyi və iş təcrübəsi ilkin profilə təsir edir.",
  },
  {
    icon: <Clock size={22} className="text-blue-600" />,
    title: "Yaş və kredit müddəti",
    desc: "Yaş, müddət və ödəniş qabiliyyəti birlikdə qiymətləndirilir.",
  },
];

const faqs = [
  {
    q: "Navio bank tərəfindən kredit təsdiqi verir?",
    a: "Xeyr. Navio yalnız məlumat platformasıdır. Kredit qərarını yalnız bank qəbul edir. Navio-nun nəticəsi ilkin yoxlama xarakteri daşıyır.",
  },
  {
    q: "İlkin yoxlama üçün hansı sənədlər lazımdır?",
    a: "Heç bir sənəd tələb olunmur. Yalnız əsas maliyyə məlumatlarınızı daxil etmək kifayətdir.",
  },
  {
    q: "Borc yükü nədir?",
    a: "Borc yükü gəlirinizin kredit ödənişlərinə yönəldilən faizdir. Banklar adətən 70%-dən yuxarı borc yükü olan müraciətləri qəbul etmir.",
  },
  {
    q: "Kredit tarixçəsi necə təsir edir?",
    a: "Gecikmələr kredit profilinizi zəiflədə bilər. Cari gecikməniz varsa, onu bağlamaq profilinizi yaxşılaşdırar.",
  },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const slide = slides[activeSlide];

  return (
    <main className="bg-gray-50">
      {/* Hero Carousel */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f1f3d 0%, #1e3a6e 60%, #2952a3 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-200 mb-4 border border-blue-400/30">
                {slide.badge}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                {slide.title}
              </h1>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">{slide.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Link
                  href={slide.cta.href}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-blue-900 bg-white hover:bg-blue-50 transition-all shadow-lg"
                >
                  {slide.cta.label}
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 mt-6">
                {slide.perks.map((p) => (
                  <div key={p} className="flex items-center gap-1.5 text-sm text-blue-200">
                    <CheckCircle2 size={14} className="text-blue-300" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              {previewMap[slide.preview]}
            </div>
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center gap-2 mt-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all ${i === activeSlide ? "w-8 bg-white" : "w-2 bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Three product cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <FileSearch size={28} className="text-blue-600" />,
              title: "Kredit yoxlaması",
              desc: "Kredit profilinizi, borc yükünüzü və əsas risk faktorlarını əvvəlcədən qiymətləndirin.",
              cta: "İlkin yoxlama",
              href: "/az/credit-check",
            },
            {
              icon: <Calculator size={28} className="text-blue-600" />,
              title: "Kredit kalkulyatoru",
              desc: "Aylıq ödənişi, ümumi xərci və erkən ödənişin təsirini hesablayın.",
              cta: "Kalkulyatora keç",
              href: "/az/calculators",
            },
            {
              icon: <BookOpen size={28} className="text-blue-600" />,
              title: "Maliyyə köməkçisi",
              desc: "Kredit və şəxsi maliyyə ilə bağlı əsas suallara sadə cavablar alın.",
              cta: "Suallara bax",
              href: "/az/financial-assistant",
            },
          ].map((card) => (
            <div key={card.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                {card.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
              <Link
                href={card.href}
                className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                {card.cta}
                <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Necə işləyir?</h2>
            <p className="text-gray-500 max-w-md mx-auto">Banka müraciətdən əvvəl kredit profilinizi 3 sadə addımda anlayın.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md"
                  style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b5fc0 100%)" }}>
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/az/credit-check"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-md transition-all"
              style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b5fc0 100%)" }}
            >
              İlkin yoxlamaya başla
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Assessed factors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Nəyi qiymətləndiririk?</h2>
          <p className="text-gray-500 max-w-md mx-auto">Kredit profilinizi formalaşdıran dörd əsas faktor.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {assessedFactors.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported loan types */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Hansı kreditlər üçün istifadə edə bilərsiniz?</h2>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {[
              { label: "İstehlak krediti", href: "/az/calculators/consumer-loan" },
              { label: "İpoteka", href: "/az/calculators/mortgage" },
              { label: "Avtokredit", href: "/az/calculators/auto-loan" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-blue-100 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors text-sm"
              >
                {item.label}
                <ChevronRight size={16} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Populyar suallar</h2>
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-medium text-gray-800 text-sm">{f.q}</span>
                <ChevronRight size={16} className={`text-gray-400 shrink-0 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            {[
              { icon: <Shield size={18} />, text: "Sənəd tələb olunmur" },
              { icon: <Clock size={18} />, text: "2 dəqiqədə nəticə" },
              { icon: <CheckCircle2 size={18} />, text: "Məlumat xarakterli" },
              { icon: <FileSearch size={18} />, text: "FIN tələb edilmir" },
            ].map((t) => (
              <div key={t.text} className="flex items-center gap-2">
                <span className="text-blue-400">{t.icon}</span>
                {t.text}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
