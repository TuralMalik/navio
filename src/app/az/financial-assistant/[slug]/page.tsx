import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { articles, getArticle } from "@/lib/articles";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      elements.push(
        <h3 key={i} className="font-bold text-gray-900 mt-5 mb-2 text-base">
          {line.slice(2, -2)}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={i} className="text-gray-700 text-sm ml-4 list-disc">
          {line.slice(2)}
        </li>
      );
    } else if (line.startsWith("| ")) {
      // Simple table row
      const cells = line.split("|").filter(Boolean).map((c) => c.trim());
      elements.push(
        <div key={i} className="flex gap-4 text-sm py-1 border-b border-gray-100">
          {cells.map((c, ci) => (
            <span key={ci} className={ci === 0 ? "w-24 font-medium text-gray-700" : "text-gray-600"}>{c}</span>
          ))}
        </div>
      );
    } else if (line.trim() === "" || line.startsWith("|--")) {
      // skip
    } else {
      elements.push(
        <p key={i} className="text-gray-700 text-sm leading-relaxed">
          {line}
        </p>
      );
    }
    i++;
  }
  return elements;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = articles.filter((a) => a.slug !== slug && a.category === article.category).slice(0, 3);

  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
          <ChevronRight size={14} />
          <Link href="/az/financial-assistant" className="hover:text-blue-600">Maliyyə köməkçisi</Link>
          <ChevronRight size={14} />
          <span className="text-gray-600 truncate">{article.title}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />{article.readingTime} dəqiqəlik oxu
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{article.title}</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{article.summary}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-6">
          <div className="space-y-2">
            {renderContent(article.content)}
          </div>
        </div>

        {/* Warning */}
        {article.warning && (
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 leading-relaxed">{article.warning}</p>
          </div>
        )}

        {/* CTA */}
        {article.relatedTool && (
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-white mb-1">Daha ətraflı analiz üçün</p>
              <p className="text-blue-200 text-sm">{article.relatedTool.label}</p>
            </div>
            <Link
              href={article.relatedTool.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-800 font-semibold text-sm hover:bg-blue-50 transition-colors shrink-0"
            >
              Keç <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Əlaqəli məqalələr</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/az/financial-assistant/${r.slug}`}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow group">
                  <p className="font-medium text-sm text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                    {r.title}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={11} />{r.readingTime} dəq
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
