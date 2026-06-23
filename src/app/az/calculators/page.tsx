import Link from "next/link";
import { ChevronRight, Calculator } from "lucide-react";

const calculators = [
  {
    title: "İstehlak krediti kalkulyatoru",
    desc: "Aylıq ödənişi, faiz xərclərini, komissiya və sığortanı, həmçinin erkən ödənişin təsirini hesablayın.",
    href: "/az/calculators/consumer-loan",
    tags: ["Aylıq ödəniş", "Erkən ödəniş", "Borc yükü"],
  },
  {
    title: "İpoteka kalkulyatoru",
    desc: "Əmlak dəyəri, ilkin ödəniş, LTV nisbəti və aylıq ödənişi hesablayın.",
    href: "/az/calculators/mortgage",
    tags: ["LTV", "İlkin ödəniş", "Aylıq ödəniş"],
  },
  {
    title: "Avtokredit kalkulyatoru",
    desc: "Avtomobilin qiyməti, ilkin ödəniş və kredit müddətinə görə aylıq ödənişi görün.",
    href: "/az/calculators/auto-loan",
    tags: ["Avtomobil tipi", "LTV", "Aylıq ödəniş"],
  },
];

export default function CalculatorsPage() {
  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
            <ChevronRight size={14} />
            <span className="text-gray-600">Kredit kalkulyatoru</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kredit kalkulyatorları</h1>
          <p className="text-gray-500 mt-1 max-w-xl text-sm">
            İstehlak krediti, ipoteka və avtokredit üçün aylıq ödənişinizi, faiz xərclərini və
            erkən ödənişin təsirini hesablayın.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {calculators.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calculator size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                  {c.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto">
                {c.tags.map((t) => (
                  <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
              <span className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                Hesabla <ChevronRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
