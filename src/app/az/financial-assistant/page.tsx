"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ChevronDown, Search, ArrowRight, X, CreditCard, TrendingUp, AlertTriangle,
  RefreshCw, House, Car, Lightbulb, Mail, MessageCircleQuestion,
} from "lucide-react";
import { categories, allQuestions } from "@/lib/knowledgeQA";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "kredit-alma": <CreditCard size={18} />,
  "kredit-tarixcesi": <TrendingUp size={18} />,
  "gecikme-mehkeme": <AlertTriangle size={18} />,
  refinans: <RefreshCw size={18} />,
  ipoteka: <House size={18} />,
  avtokredit: <Car size={18} />,
  "faydali-meslehetler": <Lightbulb size={18} />,
};

const POPULAR_TAGS = ["Kredit şansı", "Kredit tarixçəsi", "Gecikmə", "İpoteka", "Refinans", "Avtokredit"];

/* Поиск нечувствителен к азербайджанской диакритике: человек набирает
   «gecikme», а в базе «gecikmə», и без нормализации он не найдёт ничего. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u");
}

function Disclosure({
  question,
  meta,
  answer,
  cta,
  open,
  onToggle,
  id,
}: {
  question: string;
  meta?: string;
  answer: string;
  cta?: { label: string; href: string };
  open: boolean;
  onToggle: () => void;
  id: string;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50"
      >
        <span className="flex-1">
          <span className="block text-sm font-semibold leading-snug text-ink">{question}</span>
          {meta && <span className="mt-0.5 block text-xs text-gray-500">{meta}</span>}
        </span>
        <ChevronDown
          size={16}
          aria-hidden
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div id={id} className="px-5 pb-4">
          <p className="text-[13.5px] leading-relaxed text-gray-600">{answer}</p>
          {cta && (
            <Link
              href={cta.href}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:text-brand-800"
            >
              {cta.label} <ArrowRight size={13} aria-hidden />
            </Link>
          )}
        </div>
      )}
    </div>
  );
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

  function scrollToCategory(slug: string) {
    setQuery("");
    setOpenId(null);
    requestAnimationFrame(() => {
      sectionRefs.current[slug]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 pt-6 pb-10 sm:px-6">
          <Breadcrumbs trail={[{ href: "/az", label: "Ana səhifə" }]} current="Maliyyə köməkçisi" />

          <h1 className="max-w-2xl text-3xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-4xl">
            Sizə necə kömək edə bilərik?
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-600">
            Kreditlər, gecikmələr, ipoteka, avtokredit, refinans və kredit tarixçəsi haqqında sadə və aydın cavablar.
          </p>

          <div className="relative mt-6 max-w-2xl">
            <Search size={18} aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              aria-label="Suallar arasında axtarış"
              placeholder="Məsələn: gecikmə, ipoteka, kredit tarixçəsi"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenId(null);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-11 text-[15px] text-ink transition-colors placeholder:text-gray-400 hover:border-gray-400"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setOpenId(null);
                }}
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Axtarışı təmizlə"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="mt-3 flex max-w-2xl flex-wrap items-center gap-2">
            <span className="text-[13px] text-gray-500">Populyar axtarışlar:</span>
            {POPULAR_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setQuery(t);
                  setOpenId(null);
                }}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-ink"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {isSearching ? (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-600" role="status" aria-live="polite">
                &laquo;{query}&raquo; üzrə {searchResults.length} nəticə
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setOpenId(null);
                }}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:text-brand-800"
              >
                <X size={13} aria-hidden /> Axtarışı bağla
              </button>
            </div>

            {searchResults.length === 0 ? (
              /* Пустой результат предлагает конкретное следующее действие,
                 а не сообщает «ничего не найдено» и оставляет в тупике. */
              <Card className="py-10 text-center">
                <MessageCircleQuestion size={26} className="mx-auto mb-3 text-gray-300" aria-hidden />
                <p className="text-base font-bold text-ink">Bu suala hazır cavab tapılmadı</p>
                <p className="mx-auto mt-1.5 mb-5 max-w-sm text-sm text-gray-600">
                  Öz vəziyyətinizə uyğun dəqiq nəticə üçün kredit şansınızı yoxlaya bilərsiniz.
                </p>
                <LinkButton href="/az/kredit-yoxlama" icon={<ArrowRight size={15} />}>
                  Kredit şansımı yoxla
                </LinkButton>
              </Card>
            ) : (
              <Card flush className="divide-y divide-gray-200 overflow-hidden">
                {searchResults.map((item) => (
                  <Disclosure
                    key={item.id}
                    id={`search-${item.id}`}
                    question={item.question}
                    meta={item.category}
                    answer={item.answer}
                    cta={item.cta}
                    open={openId === item.id}
                    onToggle={() => toggle(item.id)}
                  />
                ))}
              </Card>
            )}
          </div>
        ) : (
          <>
            <h2 className="mb-4 text-lg font-bold tracking-tight text-ink">Mövzu seçin</h2>
            {/* Иконки без цветных подложек: раньше каждая категория красилась
                в собственный цвет, включая фиолетовый и розовый, которых в
                палитре продукта нет. */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => scrollToCategory(c.slug)}
                  className="rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-gray-400"
                >
                  <span className="text-gray-400" aria-hidden>{CATEGORY_ICONS[c.slug]}</span>
                  <p className="mt-2 text-sm font-bold leading-snug text-ink">{c.name}</p>
                  <p className="mt-0.5 text-xs tabular-nums text-gray-500">{c.items.length} sual</p>
                </button>
              ))}
            </div>

            <h2 className="mt-10 mb-4 text-lg font-bold tracking-tight text-ink">Suallar</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {categories.map((c) => (
                <div
                  key={c.slug}
                  ref={(el) => {
                    sectionRefs.current[c.slug] = el;
                  }}
                  className="scroll-mt-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card"
                >
                  <div className="flex items-center gap-2.5 border-b border-gray-200 px-5 py-3.5">
                    <span className="text-gray-400" aria-hidden>{CATEGORY_ICONS[c.slug]}</span>
                    <h3 className="text-base font-bold text-ink">{c.name}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {c.items.map((item) => {
                      const uid = `${c.slug}-${item.id}`;
                      return (
                        <Disclosure
                          key={item.id}
                          id={`qa-${uid}`}
                          question={item.question}
                          answer={item.answer}
                          cta={item.cta}
                          open={openId === uid}
                          onToggle={() => toggle(uid)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-12 rounded-2xl bg-ink px-6 py-10 sm:px-9">
          <h2 className="text-xl font-extrabold tracking-tight text-white">Cavabınızı tapa bilmədiniz?</h2>
          <p className="mt-1.5 text-sm text-gray-300">Sualınızı yazın, sizə kömək edək.</p>
          <a
            href="mailto:info@navio.az"
            className="btn mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Mail size={16} aria-hidden /> Bizə yazın
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Məlumatlar maarifləndirici xarakter daşıyır və hüquqi məsləhət deyil.
        </p>
      </div>
    </main>
  );
}
