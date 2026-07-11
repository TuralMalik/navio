"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ChevronRight, Search, ArrowRight, Plus, Sparkles, X,
  FileText, Scale, Landmark, Clock, CreditCard, Coins, Package, Car, House, Wrench,
} from "lucide-react";
import { articles, type Article } from "@/lib/articles";

const NAVY = "#0A1F44";
const BLUE = "#2447F0";
const BLUE_DARK = "#1B36BE";
const BLUE_SOFT = "#EBEFFE";
const MINT = "#0BB07B";
const MUTED = "#5B6577";
const LINE = "#E3E8F1";
const WASH = "#F4F6FB";

/* Темы с иконками (в порядке важности) */
const TOPICS: { name: string; icon: React.ReactNode }[] = [
  { name: "Bank tələbləri", icon: <Landmark size={18} /> },
  { name: "Borc yükü", icon: <Scale size={18} /> },
  { name: "Gecikmə", icon: <Clock size={18} /> },
  { name: "Kredit tarixçəsi", icon: <FileText size={18} /> },
  { name: "Kredit kartı", icon: <CreditCard size={18} /> },
  { name: "Erkən ödəniş", icon: <Coins size={18} /> },
  { name: "Kredit məhsulları", icon: <Package size={18} /> },
  { name: "İpoteka", icon: <House size={18} /> },
  { name: "Avtokredit", icon: <Car size={18} /> },
];

/* Самые частые вопросы перед кредитом (high-intent) */
const POPULAR_SLUGS = [
  "bank-niye-redd-ede-biler",
  "kredit-ucun-minimum-maas",
  "borc-yuku-nedir",
  "gecikme-kredit-tarixcesine-tesiri",
  "redd-sonra-ne-vaxt-yeniden-muraciet",
  "kredit-tarixcesi-nedir",
];

function countByCategory(cat: string) {
  return articles.filter((a) => a.category === cat).length;
}

/* Один раскрывающийся ответ */
function AnswerRow({
  a, open, onToggle, onJump,
}: {
  a: Article; open: boolean; onToggle: () => void; onJump: (slug: string) => void;
}) {
  const related = useMemo(
    () => articles.filter((x) => x.category === a.category && x.slug !== a.slug).slice(0, 3),
    [a.slug, a.category],
  );

  return (
    <div className="rounded-2xl bg-white transition-colors" style={{ border: `1px solid ${open ? BLUE : LINE}` }}>
      <button onClick={onToggle} className="w-full flex items-center gap-4 text-left px-5 py-4">
        <span className="flex-1">
          <span className="block text-[15px] font-semibold leading-snug" style={{ color: NAVY }}>{a.title}</span>
          {!open && <span className="block text-[13px] mt-0.5 leading-snug line-clamp-1" style={{ color: MUTED }}>{a.summary}</span>}
        </span>
        <span className="shrink-0 w-8 h-8 rounded-full grid place-items-center transition-all"
          style={{ background: open ? BLUE : WASH, color: open ? "#fff" : MUTED, transform: open ? "rotate(45deg)" : "none" }}>
          <Plus size={16} />
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1">
          <p className="text-[14.5px] leading-relaxed" style={{ color: "#37414f" }}>{a.content}</p>

          {a.warning && (
            <div className="mt-3 flex items-start gap-2 rounded-xl px-3.5 py-2.5" style={{ background: "#FEF6E7", border: "1px solid #FADFA6" }}>
              <span className="text-[13px] leading-relaxed" style={{ color: "#8A5A00" }}>⚠️ {a.warning}</span>
            </div>
          )}

          {a.relatedTool && (
            <Link href={a.relatedTool.href}
              className="group mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] font-semibold text-white text-sm transition-all hover:-translate-y-px"
              style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.28)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}>
              <Wrench size={15} /> {a.relatedTool.label}
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {related.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${LINE}` }}>
              <p className="text-[11.5px] font-bold uppercase tracking-wider mb-2" style={{ color: MUTED }}>Bununla bağlı</p>
              <div className="flex flex-col gap-1.5">
                {related.map((r) => (
                  <button key={r.slug} onClick={() => onJump(r.slug)}
                    className="group flex items-center justify-between gap-3 text-left text-[13.5px] font-medium rounded-lg px-3 py-2 transition-colors"
                    style={{ background: WASH, color: NAVY }}>
                    {r.title}
                    <ArrowRight size={14} className="shrink-0 group-hover:translate-x-0.5 transition-transform" style={{ color: BLUE }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Ассистент-CTA, ведущий в главный продукт */
function AssistantCTA() {
  return (
    <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(155deg, ${NAVY} 0%, #12306B 100%)` }}>
      <div className="pointer-events-none absolute rounded-full" style={{ right: -50, top: -50, width: 180, height: 180, background: "radial-gradient(circle, rgba(36,71,240,.45), transparent 70%)" }} />
      <span className="relative inline-flex items-center gap-1.5 text-[11px] font-bold uppercase px-2.5 py-1 rounded-full mb-3"
        style={{ color: "#C7D3FF", background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.16)", letterSpacing: ".1em" }}>
        <Sparkles size={12} /> Sizə özəl
      </span>
      <p className="relative text-[17px] font-extrabold leading-snug mb-2">Ümumi cavablar buradadır. Sizin dəqiq şansınız — kredit yoxlamasında.</p>
      <p className="relative text-[13.5px] mb-4" style={{ color: "#B9C4E0" }}>3 dəqiqə, sənədsiz və pulsuz. Öz profilinizə əsasən nəticə alın.</p>
      <Link href="/az/kredit-yoxlama"
        className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-[10px] font-semibold text-white text-sm transition-all hover:-translate-y-px"
        style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.35)" }}>
        Kredit şansımı yoxla <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
      <Link href="/az/calculators" className="relative block mt-3 text-[13px] font-semibold" style={{ color: "#8FB0FF" }}>
        və ya ödənişi hesablayın →
      </Link>
    </div>
  );
}

export default function FinancialAssistantPage() {
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const isSearching = q !== "" || activeTopic !== null;

  const results = useMemo(() => {
    if (!isSearching) return [];
    return articles.filter((a) => {
      const matchTopic = activeTopic === null || a.category === activeTopic;
      const matchQ = q === "" ||
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q);
      return matchTopic && matchQ;
    });
  }, [q, activeTopic, isSearching]);

  const popular = useMemo(
    () => POPULAR_SLUGS.map((s) => articles.find((a) => a.slug === s)).filter(Boolean) as Article[],
    [],
  );

  function jumpTo(slug: string) {
    setOpenSlug(slug);
    requestAnimationFrame(() => {
      document.getElementById(`q-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function toggle(slug: string) {
    setOpenSlug((cur) => (cur === slug ? null : slug));
  }

  return (
    <main className="min-h-screen" style={{ background: WASH }}>
      {/* ── Ask hero ── */}
      <div style={{ background: `radial-gradient(700px 300px at 80% -20%, ${BLUE_SOFT} 0%, transparent 60%), #fff`, borderBottom: `1px solid ${LINE}` }}>
        <div className="max-w-[1120px] mx-auto px-6 pt-8 pb-10">
          <div className="flex items-center gap-2 text-sm mb-5" style={{ color: MUTED }}>
            <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
            <ChevronRight size={14} />
            <span style={{ color: NAVY }}>Maliyyə köməkçisi</span>
          </div>

          <div className="max-w-[720px]">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mb-4" style={{ color: BLUE, background: BLUE_SOFT }}>
              <Sparkles size={13} /> Navio bilik bazası
            </span>
            <h1 className="font-extrabold mb-3" style={{ color: NAVY, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-.02em", lineHeight: 1.1 }}>
              Kredit haqqında nə soruşmaq istəyirsiniz?
            </h1>
            <p className="text-[16px] mb-6" style={{ color: MUTED }}>
              Konkret sualınızı yazın — cavabı dərhal burada açılır. Məqalə oxumağa ehtiyac yoxdur.
            </p>

            {/* Search */}
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
              <input
                type="text"
                autoFocus
                placeholder="Məsələn: bank niyə imtina edir?"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpenSlug(null); }}
                className="w-full pl-12 pr-11 py-4 text-[15px] rounded-2xl bg-white focus:outline-none transition"
                style={{ border: `1.5px solid ${LINE}`, boxShadow: "0 8px 30px rgba(10,31,68,.06)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = BLUE)}
                onBlur={(e) => (e.currentTarget.style.borderColor = LINE)}
              />
              {query && (
                <button onClick={() => { setQuery(""); setOpenSlug(null); }} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: MUTED }}>
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Topic chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => { setActiveTopic(null); setOpenSlug(null); }}
                className="px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all"
                style={activeTopic === null && q === ""
                  ? { background: NAVY, color: "#fff" }
                  : { background: "#fff", color: MUTED, border: `1px solid ${LINE}` }}>
                Hamısı
              </button>
              {TOPICS.slice(0, 6).map((t) => (
                <button key={t.name} onClick={() => { setActiveTopic(t.name); setQuery(""); setOpenSlug(null); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all"
                  style={activeTopic === t.name
                    ? { background: BLUE, color: "#fff" }
                    : { background: "#fff", color: MUTED, border: `1px solid ${LINE}` }}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1120px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

          {/* Main column */}
          <div ref={listRef}>
            {isSearching ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[13px] font-semibold" style={{ color: MUTED }}>
                    {activeTopic ? activeTopic : `"${query}"`} — {results.length} cavab
                  </p>
                  {activeTopic && (
                    <button onClick={() => setActiveTopic(null)} className="text-[13px] font-semibold inline-flex items-center gap-1" style={{ color: BLUE }}>
                      <X size={13} /> Filtri sıfırla
                    </button>
                  )}
                </div>

                {results.length === 0 ? (
                  /* No-results = конверсия */
                  <div className="rounded-2xl bg-white p-8 text-center" style={{ border: `1px solid ${LINE}` }}>
                    <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4" style={{ background: BLUE_SOFT, color: BLUE }}>
                      <Search size={24} />
                    </div>
                    <p className="text-[16px] font-bold mb-1" style={{ color: NAVY }}>Bu suala hazır cavab tapılmadı</p>
                    <p className="text-[14px] mb-5 max-w-sm mx-auto" style={{ color: MUTED }}>
                      Ən dəqiq cavab ümumi məqalədə deyil — sizin öz kredit profilinizdədir.
                    </p>
                    <Link href="/az/kredit-yoxlama"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] font-semibold text-white text-sm"
                      style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.28)" }}>
                      Kredit şansımı yoxla <ArrowRight size={15} />
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {results.map((a) => (
                      <div key={a.slug} id={`q-${a.slug}`}>
                        <AnswerRow a={a} open={openSlug === a.slug} onToggle={() => toggle(a.slug)} onJump={jumpTo} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Empty state — веди за руку */
              <>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: BLUE_SOFT, color: BLUE }}><Sparkles size={15} /></span>
                  <h2 className="text-[17px] font-bold" style={{ color: NAVY }}>Ən çox soruşulanlar</h2>
                </div>
                <div className="flex flex-col gap-2.5 mb-10">
                  {popular.map((a) => (
                    <div key={a.slug} id={`q-${a.slug}`}>
                      <AnswerRow a={a} open={openSlug === a.slug} onToggle={() => toggle(a.slug)} onJump={jumpTo} />
                    </div>
                  ))}
                </div>

                <h2 className="text-[17px] font-bold mb-4" style={{ color: NAVY }}>Mövzu üzrə axtarın</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TOPICS.map((t) => (
                    <button key={t.name} onClick={() => { setActiveTopic(t.name); setOpenSlug(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="group text-left rounded-2xl bg-white p-4 transition-all"
                      style={{ border: `1px solid ${LINE}` }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = "0 8px 24px rgba(10,31,68,.08)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.boxShadow = "none"; }}>
                      <span className="w-10 h-10 rounded-xl grid place-items-center mb-3" style={{ background: BLUE_SOFT, color: BLUE }}>{t.icon}</span>
                      <p className="text-[14px] font-bold leading-snug" style={{ color: NAVY }}>{t.name}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: MUTED }}>{countByCategory(t.name)} sual</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Mobile CTA */}
            <div className="lg:hidden mt-8">
              <AssistantCTA />
            </div>
          </div>

          {/* Sticky assistant rail (desktop) */}
          <aside className="hidden lg:block sticky top-24">
            <AssistantCTA />
          </aside>

        </div>
      </div>
    </main>
  );
}
