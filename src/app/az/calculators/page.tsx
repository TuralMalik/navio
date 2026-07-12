import Link from "next/link";
import { ChevronRight, ArrowRight, Banknote, House, Car } from "lucide-react";

const calculators = [
  {
    icon: <Banknote size={24} className="text-white" />,
    gradient: "from-blue-500 to-blue-700",
    title: "İstehlak krediti",
    desc: "Nağd pul ehtiyaclarınız üçün kredit imkanlarını hesablayın.",
    href: "/az/calculators/consumer-loan",
  },
  {
    icon: <House size={24} className="text-white" />,
    gradient: "from-emerald-500 to-teal-600",
    title: "İpoteka krediti",
    desc: "Ev almaq üçün ipoteka şərtlərini hesablayın.",
    href: "/az/calculators/mortgage",
  },
  {
    icon: <Car size={24} className="text-white" />,
    gradient: "from-purple-500 to-indigo-600",
    title: "Avtokredit",
    desc: "Avtomobil almaq üçün kredit şərtlərini hesablayın.",
    href: "/az/calculators/auto-loan",
  },
];

export default function CalculatorsPage() {
  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
            <ChevronRight size={14} />
            <span className="text-gray-600">Kredit kalkulyatoru</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kredit kalkulyatorları</h1>
          <p className="text-gray-500 mt-1 max-w-xl text-sm">
            İstehlak krediti, ipoteka və avtokredit üçün aylıq ödənişinizi, faiz xərclərini hesablayın.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {calculators.map((c) => (
            <Link key={c.href} href={c.href} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                {c.icon}
              </div>
              <h2 className="font-bold text-gray-900 mb-2">{c.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">{c.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all duration-200 mt-auto">
                Hesabla <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
