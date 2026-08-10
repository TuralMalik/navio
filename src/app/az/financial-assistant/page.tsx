"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowRight, X, MessageCircleQuestion } from "lucide-react";
import { categories, allQuestions } from "@/lib/knowledgeQA";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";

/* Раздел «Mövzu seçin» убран.

   Это была сетка из семи одинаковых карточек с иконкой сверху, то есть ровно
   тот шаблон, по которому страница опознаётся как сгенерированная. И работала
   она плохо: клик по теме не выбирал тему, а ПРОКРУЧИВАЛ куда-то вниз, к
   отдельному блоку той же темы. Получалось два списка тем на одной странице.

   Теперь тема — это фильтр. Один ряд чипов, один список вопросов, никакой
   прокрутки вслепую. Заодно исчезла вторая копия тем и «популярные запросы»:
   чипы делают то же самое честнее.

   Menzil ровно так и поступает: у них FAQ — плоский аккордеон, без витрины
   тем над ним. */

const ALL = "__all__";

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

export default function FinancialAssistantPage() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string>(ALL);
  const [openId, setOpenId] = useState<string | null>(null);

  const q = normalize(query.trim());

  const visible = useMemo(() => {
    const terms = q.split(/\s+/).filter(Boolean);
    return allQuestions.filter((item) => {
      if (topic !== ALL && item.categorySlug !== topic) return false;
      if (!terms.length) return true;
      const hay = normalize(`${item.question} ${item.answer} ${item.category}`);
      return terms.every((t) => hay.includes(t));
    });
  }, [q, topic]);

  const filtering = topic !== ALL || q.length > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 pt-6 pb-8 sm:px-6">

          <h1 className="max-w-2xl text-3xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-4xl">
            Sizə necə kömək edə bilərik?
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-600">
            Kreditlər, gecikmələr, ipoteka, refinans və kredit tarixçəsi haqqında sadə cavablar.
          </p>

          <div className="relative mt-6">
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

          {/* Тема выбирается здесь и сразу фильтрует список ниже. */}
          <div role="group" aria-label="Mövzu" className="mt-3 flex flex-wrap gap-1.5">
            {[{ slug: ALL, name: "Hamısı", count: allQuestions.length }, ...categories.map((c) => ({
              slug: c.slug,
              name: c.name,
              count: c.items.length,
            }))].map((c) => {
              const on = topic === c.slug;
              return (
                <button
                  key={c.slug}
                  aria-pressed={on}
                  onClick={() => {
                    setTopic(c.slug);
                    setOpenId(null);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                    on
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:text-ink"
                  }`}
                >
                  {c.name}
                  <span className={`ml-1.5 tabular-nums ${on ? "text-brand-100" : "text-gray-400"}`}>{c.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600 tabular-nums" role="status" aria-live="polite">
            {visible.length} sual
          </p>
          {filtering && (
            <button
              onClick={() => {
                setQuery("");
                setTopic(ALL);
                setOpenId(null);
              }}
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:text-brand-800"
            >
              <X size={13} aria-hidden /> Filtri sıfırla
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          /* Пустой результат предлагает следующее действие, а не сообщает
             «ничего не найдено» и оставляет в тупике. */
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
            {visible.map((item) => (
              <Accordion
                key={item.id}
                id={`qa-${item.id}`}
                question={item.question}
                // Тему подписываем только когда показаны все: внутри выбранной
                // темы одна и та же подпись под каждым вопросом — шум.
                meta={topic === ALL ? item.category : undefined}
                open={openId === item.id}
                onToggle={() => setOpenId((cur) => (cur === item.id ? null : item.id))}
              >
                <p className="text-[13.5px] leading-relaxed text-gray-600">{item.answer}</p>
                {item.cta && (
                  <Link
                    href={item.cta.href}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:text-brand-800"
                  >
                    {item.cta.label} <ArrowRight size={13} aria-hidden />
                  </Link>
                )}
              </Accordion>
            ))}
          </Card>
        )}

        <div className="mt-10 rounded-2xl bg-ink px-6 py-10 sm:px-9">
          <h2 className="text-xl font-extrabold tracking-tight text-white">Cavabınızı tapa bilmədiniz?</h2>
          <p className="mt-1.5 text-sm text-gray-300">Sualınızı yazın, sizə kömək edək.</p>
          {/* Единственная кнопка на сайте, собранная вручную классами вместо
              общего компонента: отсюда и другой отступ, и отсутствие стрелки,
              которая есть у каждого второго призыва к действию. */}
          <LinkButton href="mailto:info@navio.az" className="mt-5" icon={<ArrowRight size={15} />}>
            Bizə yazın
          </LinkButton>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Məlumatlar maarifləndirici xarakter daşıyır və hüquqi məsləhət deyil.
        </p>
      </div>
    </main>
  );
}
