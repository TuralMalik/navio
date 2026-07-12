import Link from "next/link";
import { ChevronRight, CheckCircle2, XCircle } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
          <ChevronRight size={14} />
          <span className="text-gray-600">Haqqımızda</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Navio nədir?</h1>
          <p className="text-gray-600 leading-relaxed text-base">
            Navio istifadəçilərə kredit ödənişlərini hesablamağa, kredit profilini ilkin qiymətləndirməyə
            və maliyyə mövzularını sadə dildə anlamağa kömək edən məlumat platformasıdır.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-500" />
              Nə edirik?
            </h2>
            <ul className="space-y-3">
              {[
                "Kredit profilinin ilkin qiymətləndirilməsi",
                "İstehlak krediti kalkulyatoru",
                "İpoteka kalkulyatoru",
                "Avtokredit kalkulyatoru",
                "Erkən ödəniş hesablamaları",
                "Sadə maliyyə izahları",
                "Praktik tövsiyələr",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle size={20} className="text-red-400" />
              Nə etmirik?
            </h2>
            <ul className="space-y-3">
              {[
                "Kredit vermirik",
                "Bank qərarını əvəz etmirik",
                "Təsdiqə zəmanət vermirik",
                "Şəxsi sənəd (FIN, pasport) tələb etmirik",
                "Bank adından çıxış etmirik",
                "Kredit bürosu ilə bağlantımız yoxdur",
                "Əldə etdiyiniz məlumatları satmırıq",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <XCircle size={15} className="text-red-300 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-3">Niyə Navio?</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Çoxu insanlar banka müraciət etməzdən əvvəl kredit şərtlərini, borc yüklərini və faiz
            xərclərini düzgün qiymətləndirmir. Navio bu boşluğu doldurmaq üçün yaradılıb — sadə, şəffaf
            və sənədsiz bir platforma kimi.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/az/kredit-yoxlama"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #2447F0 0%, #1B36BE 100%)" }}
          >
            İlkin yoxlamaya başla
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
