"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Clock, BookOpen, ArrowRight } from "lucide-react";
import { articles, categories } from "@/lib/articles";

export default function FinancialAssistantPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Hamısı");

  const filtered = articles.filter((a) => {
    const matchCat = activeCategory === "Hamısı" || a.category === activeCategory;
    const matchQ =
      query === "" ||
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.summary.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const featured = articles[0];

  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
            <ChevronRight size={14} />
            <span className="text-gray-600">Maliyyə köməkçisi</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Maliyyə köməkçisi</h1>
          <p className="text-gray-500 text-sm max-w-xl">
            Kredit, ipoteka, borc yükü və bank tələbləri haqqında sadə dildə cavablar.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Sual axtar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured article */}
        {activeCategory === "Hamısı" && query === "" && (
          <div className="mb-8">
            <Link
              href={`/az/financial-assistant/${featured.slug}`}
              className="block bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 md:p-8 text-white hover:opacity-95 transition-opacity"
            >
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 mb-3">
                Tövsiyə edilən
              </span>
              <h2 className="text-xl md:text-2xl font-bold mb-2">{featured.title}</h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-4 max-w-xl">{featured.summary}</p>
              <div className="flex items-center gap-4 text-sm text-blue-200">
                <span className="flex items-center gap-1"><Clock size={13} />{featured.readingTime} dəq</span>
                <span className="flex items-center gap-1 font-semibold text-white">
                  Oxu <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Article grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nəticə tapılmadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => (
              <Link
                key={a.slug}
                href={`/az/financial-assistant/${a.slug}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {a.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />{a.readingTime} dəq
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-blue-700 transition-colors">
                  {a.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">{a.summary}</p>
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                  Oxu <ChevronRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* CTA strip */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 mb-1">Kredit profilinizi yoxlayın</p>
              <p className="text-xs text-gray-500">2 dəqiqə, sənəd tələb olunmur</p>
            </div>
            <Link href="/az/kredit-yoxlama" className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b5fc0 100%)" }}>
              Başla
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 mb-1">Kredit ödənişini hesablayın</p>
              <p className="text-xs text-gray-500">İstehlak, ipoteka, avtokredit</p>
            </div>
            <Link href="/az/calculators" className="px-4 py-2 rounded-lg text-sm font-semibold text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors">
              Kalkulyator
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
