"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ChevronRight, ChevronDown, Search, ArrowRight, X,
  CreditCard, TrendingUp, AlertTriangle, RefreshCw, House, Car, Lightbulb,
  Mail, ShieldCheck, Zap, MessageCircleQuestion,
} from "lucide-react";
import { categories, allQuestions } from "@/lib/knowledgeQA";

const NAVY = "#0A1F44";
const BLUE = "#2447F0";
const BLUE_DARK = "#1B36BE";
const BLUE_SOFT = "#EBEFFE";
const MUTED = "#5B6577";
const LINE = "#E3E8F1";
const WASH = "#F4F6FB";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "kredit-alma": <CreditCard size={22} />,
  "kredit-tarixcesi": <TrendingUp size={22} />,
  "gecikme-mehkeme": <AlertTriangle size={22} />,
  "refinans": <RefreshCw size={22} />,
  "ipoteka": <House size={22} />,
  "avtokredit": <Car size={22} />,
  "faydali-meslehetler": <Lightbulb size={22} />,
};

const POPULAR_TAGS = ["Kredit şansı", "Kredit tarixçəsi", "Gecikmə", "İpoteka", "Refinans", "Avtokredit"];

function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ş/g, "s")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ö/g, "o").replace(/ü/g, "u");
}

export default function FinancialAssistantPage() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const q = normalize(query.trim());
  const isSearching = q.length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    return allQuestions.filter((item) => {
      const hay = normalize(`${item.question} ${item.answer} ${item.category}`);
      return terms.every((t) => hay.includes(t));
    });
  }, [q, isSearching]);

  function runSearch(term: string) {
    setQuery(term);
    setOpenId(null);
  }

  function scrollToCategory(slug: string) {
    setQuery("");
    setOpenId(null);
    requestAnimationFrame(() => {
      sectionRefs.current[slug]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggle(id: string) {
    setOpenId((cur) => (cur === id ? null : id));
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: `radial-gradient(900px 420px at 85% -10%, ${BLUE_SOFT} 0%, transparent 60%), #FFFFFF` }}
      >
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 pt-8 pb-14">
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: MUTED }}>
            <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
            <ChevronRight size={14} />
            <span style={{ color: NAVY }}>Maliyyə köməkçisi</span>
          </div>

          <div className="max-w-[680px]">
            <h1 className="font-extrabold mb-3" style={{ color: NAVY, fontSize: "clamp(30px,4.4vw,44px)", letterSpacing: "-.02em", lineHeight: 1.12 }}>
              Sizə necə kömək edə bilərik?
            </h1>
            <p className="text-[17px] mb-7" style={{ color: MUTED }}>
              Kreditlər, gecikmələr, ipoteka, avtokredit, refinans və kredit tarixçəsi haqqında sadə və aydın cavablar.
            </p>

            {/* Search */}
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
              <input
                type="text"
                placeholder="Məsələn: gecikmə, ipoteka, kredit tarixçəsi, refinans"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpenId(null); }}
                className="w-full pl-12 pr-28 py-4 text-[15px] rounded-2xl bg-white focus:outline-none transition"
                style={{ border: `1.5px solid ${LINE}`, boxShadow: "0 8px 30px rgba(10,31,68,.06)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = BLUE)}
                onBlur={(e) => (e.currentTarget.style.borderColor = LINE)}
              />
              {query ? (
                <button
                  onClick={() => { setQuery(""); setOpenId(null); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl grid place-items-center transition-colors"
                  style={{ color: MUTED }}
                  aria-label="Təmizlə"
                >
                  <X size={18} />
                </button>
              ) : (
                <span className="hidden sm:grid absolute right-2.5 top-1/2 -translate-y-1/2 place-items-center px-4 h-10 rounded-xl font-semibold text-sm text-white"
                  style={{ background: BLUE }}>
                  Axtar
                </span>
              )}
            </div>

            {/* Popular tags */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-[13px] mr-1" style={{ color: MUTED }}>Populyar axtarışlar:</span>
              {POPULAR_TAGS.map((t) => (
                <button key={t} onClick={() => runSearch(t)}
                  className="px-3 py-1.5 rounded-full text-[13px] font-medium bg-white transition-colors"
                  style={{ border: `1px solid ${LINE}`, color: NAVY }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = BLUE)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = LINE)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 pb-16">

        {isSearching ? (
          /* ── Search results ── */
          <div className="pt-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] font-semibold" style={{ color: MUTED }}>
                &ldquo;{query}&rdquo; — {searchResults.length} nəticə
              </p>
              <button onClick={() => { setQuery(""); setOpenId(null); }} className="text-[13px] font-semibold inline-flex items-center gap-1" style={{ color: BLUE }}>
                <X size={13} /> Axtarışı bağla
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center" style={{ border: `1px solid ${LINE}` }}>
                <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4" style={{ background: BLUE_SOFT, color: BLUE }}>
                  <MessageCircleQuestion size={26} />
                </div>
                <p className="text-[17px] font-bold mb-1" style={{ color: NAVY }}>Bu suala hazır cavab tapılmadı</p>
                <p className="text-[14px] mb-5 max-w-sm mx-auto" style={{ color: MUTED }}>
                  Sizin öz vəziyyətinizə uyğun dəqiq nəticə üçün kredit şansınızı yoxlaya bilərsiniz.
                </p>
                <Link href="/az/kredit-yoxlama"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] font-semibold text-white text-sm"
                  style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.28)" }}>
                  Kredit şansımı yoxla <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl bg-white overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
                {searchResults.map((item, i) => (
                  <div key={item.id} style={{ borderTop: i > 0 ? `1px solid ${LINE}` : "none" }}>
                    <button onClick={() => toggle(item.id)}
                      className="w-full flex items-center gap-3 text-left px-5 py-4 transition-colors hover:bg-[#F8F9FC]">
                      <span className="w-8 h-8 rounded-lg grid place-items-center shrink-0 text-[15px]" style={{ background: item.soft }}>
                        {item.emoji}
                      </span>
                      <span className="flex-1">
                        <span className="block text-[14.5px] font-semibold" style={{ color: NAVY }}>{item.question}</span>
                        <span className="text-[12px]" style={{ color: MUTED }}>{item.category}</span>
                      </span>
                      <ChevronDown size={16} className="shrink-0 transition-transform" style={{ color: MUTED, transform: openId === item.id ? "rotate(180deg)" : "none" }} />
                    </button>
                    {openId === item.id && (
                      <div className="px-5 pb-5 pl-16">
                        <p className="text-[14px] leading-relaxed" style={{ color: "#37414f" }}>{item.answer}</p>
                        {item.cta && (
                          <Link href={item.cta.href}
                            className="group mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold"
                            style={{ color: BLUE }}>
                            {item.cta.label} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ── Category cards ── */}
            <div className="pt-10 pb-2">
              <h2 className="text-[15px] font-bold uppercase tracking-wide mb-4" style={{ color: MUTED }}>Mövzu seçin</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((c) => (
                  <button key={c.slug} onClick={() => scrollToCategory(c.slug)}
                    className="group text-left rounded-2xl bg-white p-4 sm:p-5 transition-all"
                    style={{ border: `1px solid ${LINE}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.boxShadow = "0 10px 28px rgba(10,31,68,.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                    <span className="w-11 h-11 rounded-xl grid place-items-center mb-3" style={{ background: c.soft, color: c.color }}>
                      {CATEGORY_ICONS[c.slug]}
                    </span>
                    <p className="text-[14.5px] font-bold leading-snug" style={{ color: NAVY }}>{c.name}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: MUTED }}>{c.items.length} sual</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Question groups ── */}
            <div className="pt-8 flex flex-col gap-6">
              <h2 className="text-[15px] font-bold uppercase tracking-wide" style={{ color: MUTED }}>Suallar</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {categories.map((c) => (
                  <div key={c.slug}
                    ref={(el) => { sectionRefs.current[c.slug] = el; }}
                    className="rounded-2xl bg-white overflow-hidden scroll-mt-24"
                    style={{ border: `1px solid ${LINE}` }}
                  >
                    <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${LINE}` }}>
                      <span className="w-9 h-9 rounded-lg grid place-items-center" style={{ background: c.soft, color: c.color }}>
                        {CATEGORY_ICONS[c.slug]}
                      </span>
                      <h3 className="text-[16px] font-bold" style={{ color: NAVY }}>{c.name}</h3>
                    </div>
                    <div>
                      {c.items.map((item, i) => {
                        const uid = `${c.slug}-${item.id}`;
                        const open = openId === uid;
                        return (
                          <div key={item.id} style={{ borderTop: i > 0 ? `1px solid ${LINE}` : "none" }}>
                            <button onClick={() => toggle(uid)}
                              className="w-full flex items-center gap-3 text-left px-5 py-3.5 transition-colors hover:bg-[#F8F9FC]">
                              <span className="flex-1 text-[14px] font-medium leading-snug" style={{ color: NAVY }}>{item.question}</span>
                              <ChevronDown size={16} className="shrink-0 transition-transform" style={{ color: MUTED, transform: open ? "rotate(180deg)" : "none" }} />
                            </button>
                            {open && (
                              <div className="px-5 pb-4">
                                <p className="text-[13.5px] leading-relaxed" style={{ color: "#37414f" }}>{item.answer}</p>
                                {item.cta && (
                                  <Link href={item.cta.href}
                                    className="group mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-semibold"
                                    style={{ color: c.color }}>
                                    {item.cta.label} <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Bottom CTA ── */}
        <div className="mt-14 rounded-[24px] p-7 sm:p-9 relative overflow-hidden"
          style={{ background: `linear-gradient(155deg, ${NAVY} 0%, #12306B 100%)` }}>
          <div className="pointer-events-none absolute rounded-full" style={{ right: -60, top: -60, width: 220, height: 220, background: "radial-gradient(circle, rgba(36,71,240,.45), transparent 70%)" }} />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <h3 className="text-[20px] sm:text-[22px] font-extrabold text-white mb-1.5">Cavabınızı tapa bilmədiniz?</h3>
              <p className="text-[14.5px] mb-5" style={{ color: "#B9C4E0" }}>Sualınızı yazın, biz sizə kömək edək.</p>
              <a href="mailto:info@navio.az"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-[10px] font-semibold text-white text-sm transition-all hover:-translate-y-px"
                style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.35)" }}>
                <Mail size={16} /> Bizə yazın
              </a>
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-3">
              {[
                { icon: <Zap size={16} />, label: "Pulsuz" },
                { icon: <MessageCircleQuestion size={16} />, label: "Sadə izah" },
                { icon: <ShieldCheck size={16} />, label: "Tez cavab" },
              ].map((t) => (
                <div key={t.label} className="flex items-center gap-2 text-[13.5px] font-semibold text-white/90">
                  <span className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: "rgba(255,255,255,.10)" }}>{t.icon}</span>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[12px] mt-6 text-center" style={{ color: MUTED }}>
          Məlumatlar maarifləndirici xarakter daşıyır və hüquqi məsləhət deyil.
        </p>
      </div>
    </main>
  );
}
