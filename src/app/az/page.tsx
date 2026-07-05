"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ChevronDown,
  Calculator,
  BookOpen,
  Info,
  CreditCard,
  BarChart2,
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

const NAVY = "#0A1F44";
const BLUE = "#2447F0";
const BLUE_DARK = "#1B36BE";
const BLUE_SOFT = "#EBEFFE";
const MINT = "#0BB07B";
const MINT_SOFT = "#E7F7F1";
const MUTED = "#5B6577";
const LINE = "#E3E8F1";
const WASH = "#F4F6FB";

function AnimatedGauge({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let start: number | null = null;
        const run = (ts: number) => {
          if (start === null) start = ts;
          const p = Math.min((ts - start) / 1200, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(eased * target));
          if (p < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return (
    <div
      ref={ref}
      className="w-[180px] h-[180px] mx-auto mb-1.5 rounded-full grid place-items-center"
      style={{ background: `conic-gradient(${MINT} ${val}%, ${LINE} 0)` }}
      role="img"
      aria-label={`${target} bal 100-dən`}
    >
      <div className="w-[142px] h-[142px] rounded-full bg-white grid place-items-center text-center">
        <div>
          <b className="block text-[44px] font-extrabold leading-none" style={{ color: NAVY }}>{val}</b>
          <small className="text-[13px]" style={{ color: MUTED }}>/ 100</small>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="bg-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section
        className="py-20 md:py-24"
        style={{ background: `radial-gradient(900px 420px at 85% -10%, ${BLUE_SOFT} 0%, transparent 60%), #FFFFFF` }}
      >
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_.85fr] gap-12 lg:gap-16 items-center">

            {/* Left */}
            <div>
              <h1
                className="font-extrabold mb-6"
                style={{ color: NAVY, fontSize: "clamp(40px, 5.6vw, 62px)", lineHeight: 1.12, letterSpacing: "-.028em" }}
              >
                Kredit almaq{" "}
                <em className="not-italic relative whitespace-nowrap" style={{ color: BLUE }}>
                  <span className="relative z-10">şansınızı</span>
                  <span className="absolute left-0 right-0 bottom-1.5 h-2.5 rounded-[3px]" style={{ background: BLUE_SOFT }} />
                </em>{" "}
                yoxlayın
              </h1>

              <p className="text-[19px] max-w-[460px] mb-9" style={{ color: MUTED }}>
                Banka müraciət etməzdən əvvəl kredit almaq ehtimalınızı yoxlayın — sənədsiz, pulsuz, 3 dəqiqəyə.
              </p>

              <div className="flex flex-wrap gap-3.5 mb-10">
                <Link
                  href="/az/kredit-yoxlama"
                  className="group inline-flex items-center gap-2 px-9 py-[18px] rounded-[10px] font-semibold text-white text-[17px] transition-all hover:-translate-y-px"
                  style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.30)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_DARK)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}
                >
                  İlkin yoxlamaya başla
                  <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/az/calculators"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[10px] font-semibold text-[15px] bg-transparent border-[1.5px] transition-colors"
                  style={{ color: NAVY, borderColor: LINE }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = NAVY)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = LINE)}
                >
                  Kalkulyatorlara keç
                </Link>
              </div>

              {/* Facts row */}
              <div className="flex flex-wrap gap-y-4">
                {[
                  { b: "3 dəq", s: "Nəticə vaxtı" },
                  { b: "Sənədsiz", s: "Rəsmi sorğu yoxdur" },
                  { b: "Pulsuz", s: "Heç bir öhdəlik yoxdur" },
                ].map((f, i) => (
                  <div key={f.b} className="px-7 first:pl-0" style={{ borderLeft: i > 0 ? `1px solid ${LINE}` : "none" }}>
                    <b className="block text-2xl font-extrabold" style={{ color: NAVY, letterSpacing: "-.01em" }}>{f.b}</b>
                    <span className="text-[13.5px]" style={{ color: MUTED }}>{f.s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — score card */}
            <aside
              className="relative bg-white rounded-[20px] p-[30px]"
              style={{ border: `1px solid ${LINE}`, boxShadow: "0 8px 30px rgba(10,31,68,.10)" }}
              aria-label="Kredit profili nümunəsi"
            >
              <div
                className="pointer-events-none absolute rounded-[21px]"
                style={{
                  inset: "-1px", padding: "1px",
                  background: `linear-gradient(140deg, ${BLUE} 0%, transparent 40%)`,
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />
              <div className="flex justify-between items-center mb-[22px]">
                <span className="font-bold text-[15.5px]" style={{ color: NAVY }}>Kredit profili</span>
                <span className="text-xs font-bold px-[11px] py-[5px] rounded-full" style={{ color: MINT, background: MINT_SOFT }}>
                  Nümunə nəticə
                </span>
              </div>

              <AnimatedGauge target={72} />
              <div className="text-center font-bold text-[15px] mb-6" style={{ color: MINT }}>Yaxşı nəticə</div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: "Borc yükü", value: "34%", good: true },
                  { label: "Aylıq ödəniş", value: "280 ₼", good: false },
                  { label: "Risk səviyyəsi", value: "Aşağı", good: true },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl px-3 py-3.5 text-center" style={{ background: WASH }}>
                    <small className="block text-xs mb-1" style={{ color: MUTED }}>{m.label}</small>
                    <b className="text-[15px] font-bold" style={{ color: m.good ? MINT : NAVY }}>{m.value}</b>
                  </div>
                ))}
              </div>

              <p className="mt-[18px] text-[12.5px] text-center" style={{ color: MUTED }}>
                Nəticələr ilkin qiymətləndirmə xarakteri daşıyır.
              </p>
            </aside>

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
