"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ChevronDown,
  Calculator,
  BookOpen,
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

      {/* ── STEPS: numbered timeline ── */}
      <section className="py-24" style={{ background: WASH }}>
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="max-w-[640px] mx-auto text-center mb-13" style={{ marginBottom: 52 }}>
            <span className="inline-block text-xs font-bold uppercase mb-3.5" style={{ color: BLUE, letterSpacing: ".14em" }}>Proses</span>
            <h2 className="font-extrabold mb-3" style={{ color: NAVY, fontSize: "clamp(28px,3.4vw,38px)", letterSpacing: "-.02em" }}>Necə işləyir?</h2>
            <p className="text-[17px]" style={{ color: MUTED }}>Üç sadə addım — və siz banka getməzdən əvvəl vəziyyətinizi bilirsiniz.</p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="hidden md:block absolute top-[26px] left-[8%] right-[8%] h-0.5"
              style={{ background: `repeating-linear-gradient(90deg, ${LINE} 0 8px, transparent 8px 16px)` }} />
            {[
              { num: "01", title: "Məlumatları daxil edin", desc: "Sadə forma: gəliriniz, mövcud borclarınız və istədiyiniz kredit məbləği.", time: "≈ 2 dəqiqə", last: false },
              { num: "02", title: "Analiz edirik", desc: "Sistem kredit profilinizi anlarında hesablayır — heç bir rəsmi sorğu göndərilmir.", time: "≈ 30 saniyə", last: false },
              { num: "03", title: "Nəticəni alın", desc: "Nəticəni görün, fərdi tövsiyələrlə profilinizi yaxşılaşdırın.", time: "Dərhal", last: true },
            ].map((s) => (
              <div key={s.num} className="relative">
                <span className="w-[52px] h-[52px] rounded-full grid place-items-center font-extrabold text-xl text-white mb-[22px] relative z-10"
                  style={{ background: s.last ? BLUE : NAVY, boxShadow: `0 0 0 8px ${WASH}` }}>
                  {s.num}
                </span>
                <h3 className="text-[19px] font-bold mb-2" style={{ color: NAVY }}>{s.title}</h3>
                <p className="text-[15.5px] max-w-[280px]" style={{ color: MUTED }}>{s.desc}</p>
                <span className="inline-block mt-3 text-[13px] font-semibold" style={{ color: BLUE }}>{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HELP: flagship + side cards ── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="max-w-[640px] mb-13" style={{ marginBottom: 52 }}>
            <span className="inline-block text-xs font-bold uppercase mb-3.5" style={{ color: BLUE, letterSpacing: ".14em" }}>Xidmətlər</span>
            <h2 className="font-extrabold mb-3" style={{ color: NAVY, fontSize: "clamp(28px,3.4vw,38px)", letterSpacing: "-.02em" }}>Navio sizə necə kömək edir?</h2>
            <p className="text-[17px]" style={{ color: MUTED }}>Əsas alət — kredit yoxlaması. Kalkulyatorlar və maliyyə köməkçisi onu tamamlayır.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6">
            {/* Flagship */}
            <div className="relative overflow-hidden rounded-[20px] p-11 flex flex-col text-white"
              style={{ background: `linear-gradient(155deg, ${NAVY} 0%, #12306B 100%)` }}>
              <div className="pointer-events-none absolute rounded-full"
                style={{ right: -70, top: -70, width: 260, height: 260, background: "radial-gradient(circle, rgba(36,71,240,.45), transparent 70%)" }} />
              <span className="inline-block text-xs font-bold uppercase mb-3.5 relative" style={{ color: "#8FA5F5", letterSpacing: ".14em" }}>Əsas alət</span>
              <h3 className="text-[28px] font-extrabold mb-3 text-white relative" style={{ letterSpacing: "-.015em" }}>Kredit yoxlaması</h3>
              <p className="text-base max-w-[380px] mb-7 relative" style={{ color: "#B9C4E0" }}>
                Cəmi 3 dəqiqəyə kredit profilinizi öyrənin və nəticəni anında görün — banka getməzdən əvvəl.
              </p>
              <div className="flex gap-6 mb-9 relative">
                {[
                  { b: "72/100", s: "Orta nümunə bal" },
                  { b: "3 dəq", s: "Yoxlama müddəti" },
                  { b: "0 ₼", s: "Tam pulsuz" },
                ].map((m) => (
                  <div key={m.b}>
                    <b className="block text-[22px] font-extrabold">{m.b}</b>
                    <span className="text-[13px]" style={{ color: "#8FA0C9" }}>{m.s}</span>
                  </div>
                ))}
              </div>
              <Link href="/az/kredit-yoxlama"
                className="group self-start relative z-10 inline-flex items-center gap-2 px-7 py-[15px] rounded-[10px] font-semibold text-white transition-all hover:-translate-y-px"
                style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.30)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}>
                Yoxlamaya başla <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            {/* Side cards */}
            <div className="flex flex-col gap-6">
              {[
                { icon: <Calculator size={22} />, title: "Kredit kalkulyatorları", desc: "İstehlak, ipoteka və avtokredit üçün aylıq ödənişi hesablayın.", cta: "Kalkulyatorlara keç", href: "/az/calculators" },
                { icon: <BookOpen size={22} />, title: "Maliyyə köməkçisi", desc: "Maliyyə vəziyyətinizi yaxşılaşdırmaq üçün fərdi tövsiyələr alın.", cta: "Köməkçidən istifadə et", href: "/az/financial-assistant" },
              ].map((c) => (
                <div key={c.title} className="flex-1 bg-white rounded-[20px] p-[30px] flex flex-col transition-all"
                  style={{ border: `1px solid ${LINE}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = "0 8px 30px rgba(10,31,68,.10)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.boxShadow = "none"; }}>
                  <span className="w-[46px] h-[46px] rounded-xl grid place-items-center mb-[18px]" style={{ background: BLUE_SOFT, color: BLUE }}>{c.icon}</span>
                  <h3 className="text-[19px] font-bold mb-1.5" style={{ color: NAVY }}>{c.title}</h3>
                  <p className="text-[15px] mb-4" style={{ color: MUTED }}>{c.desc}</p>
                  <Link href={c.href} className="group mt-auto inline-flex items-center gap-1.5 font-semibold text-[15px]" style={{ color: BLUE }}>
                    {c.cta} <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LOAN TYPES: divided rows ── */}
      <section className="py-24" style={{ background: WASH }}>
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="max-w-[640px] mb-13" style={{ marginBottom: 52 }}>
            <span className="inline-block text-xs font-bold uppercase mb-3.5" style={{ color: BLUE, letterSpacing: ".14em" }}>Kredit növləri</span>
            <h2 className="font-extrabold" style={{ color: NAVY, fontSize: "clamp(28px,3.4vw,38px)", letterSpacing: "-.02em" }}>Hansı kreditlər üçün?</h2>
          </div>
          <div style={{ borderTop: `1px solid ${LINE}` }}>
            {[
              { icon: <Banknote size={22} />, title: "İstehlak krediti", desc: "Nağd pul ehtiyacınızı ilkin qiymətləndirin — aylıq ödənişi və ümumi məbləği hesablayın.", href: "/az/calculators/consumer-loan" },
              { icon: <House size={22} />, title: "İpoteka krediti", desc: "Ev almaq üçün ipoteka şərtlərini hesablayın — ilkin ödəniş, müddət və faiz dərəcəsi ilə.", href: "/az/calculators/mortgage" },
              { icon: <Car size={22} />, title: "Avtokredit", desc: "Avtomobil almaq üçün kredit şərtlərini hesablayın və büdcənizi planlaşdırın.", href: "/az/calculators/auto-loan" },
            ].map((c) => (
              <Link key={c.title} href={c.href}
                className="grid items-center gap-5 md:gap-7 py-7 px-2 transition-colors grid-cols-[48px_1fr] md:grid-cols-[56px_1.1fr_1.6fr_auto]"
                style={{ borderBottom: `1px solid ${LINE}` }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(36,71,240,.035)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <span className="w-12 h-12 rounded-xl grid place-items-center bg-white" style={{ border: `1px solid ${LINE}`, color: BLUE }}>{c.icon}</span>
                <h3 className="text-[19px] font-bold" style={{ color: NAVY }}>{c.title}</h3>
                <p className="text-[15.5px] hidden md:block" style={{ color: MUTED }}>{c.desc}</p>
                <span className="group inline-flex items-center gap-1.5 font-semibold text-[15px] whitespace-nowrap col-span-2 md:col-span-1" style={{ color: BLUE }}>
                  Hesabla <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="max-w-[640px] mx-auto text-center mb-13" style={{ marginBottom: 52 }}>
            <span className="inline-block text-xs font-bold uppercase mb-3.5" style={{ color: BLUE, letterSpacing: ".14em" }}>Suallar</span>
            <h2 className="font-extrabold" style={{ color: NAVY, fontSize: "clamp(28px,3.4vw,38px)", letterSpacing: "-.02em" }}>Populyar suallar</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-6 items-start">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-xl overflow-hidden transition-colors"
                style={{ border: `1px solid ${openFaq === i ? BLUE : LINE}` }}>
                <button
                  className="w-full text-left px-[22px] py-5 flex items-center justify-between gap-4 font-semibold text-[15.5px]"
                  style={{ color: NAVY }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {f.q}
                  <span className="flex-none w-[26px] h-[26px] rounded-full grid place-items-center transition-transform"
                    style={{ background: openFaq === i ? BLUE_SOFT : WASH, color: openFaq === i ? BLUE : MUTED, transform: openFaq === i ? "rotate(180deg)" : "none" }}>
                    <ChevronDown size={14} />
                  </span>
                </button>
                {openFaq === i && (
                  <p className="px-[22px] pb-5 text-[15px]" style={{ color: MUTED }}>{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="pb-24 bg-white">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="relative overflow-hidden rounded-[24px] px-12 py-[72px] text-center text-white"
            style={{ background: `linear-gradient(140deg, ${NAVY}, #12306B)` }}>
            <span className="pointer-events-none absolute font-extrabold whitespace-nowrap"
              style={{ fontSize: 200, letterSpacing: "-.04em", color: "rgba(255,255,255,.045)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
              72/100
            </span>
            <h2 className="relative font-extrabold mb-3 text-white" style={{ fontSize: "clamp(28px,3.6vw,40px)", letterSpacing: "-.02em" }}>Hazırsınız?</h2>
            <p className="relative text-[17px] mb-8" style={{ color: "#B9C4E0" }}>Kredit müraciətindən əvvəl bir neçə dəqiqə vaxtınızı ayırın.</p>
            <Link href="/az/kredit-yoxlama"
              className="group relative inline-flex items-center gap-2 px-9 py-[18px] rounded-[10px] font-semibold text-white text-[17px] transition-all hover:-translate-y-px"
              style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.30)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}>
              Pulsuz yoxlamaya başla <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ── */}
      <div className="py-[22px]" style={{ background: WASH, borderTop: `1px solid ${LINE}` }}>
        <div className="max-w-[1120px] mx-auto px-6">
          <p className="text-[13px] max-w-[820px] mx-auto text-center" style={{ color: MUTED }}>
            <b style={{ color: NAVY }}>Navio bank deyil.</b> Heç bir kredit verilmir və banka müraciətin nəticəsinə zəmanət verilmir. Nəticələr ilkin qiymətləndirmə xarakteri daşıyır.
          </p>
        </div>
      </div>

    </main>
  );
}
