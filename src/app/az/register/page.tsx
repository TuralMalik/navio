import Link from "next/link";
import { ChevronRight, UserPlus, BookmarkCheck, History, Star } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="bg-gray-50 min-h-screen py-10 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
          <ChevronRight size={14} />
          <span className="text-gray-600">Qeydiyyat</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
            <UserPlus size={28} className="text-blue-500" />
          </div>
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 mb-4">
            Tezliklə
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Qeydiyyat</h1>
          <p className="text-gray-500 text-sm mb-8">
            Navio hesabı funksiyası hazırlanır.
          </p>

          <div className="text-left space-y-3 mb-8">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hesabla əlçatan olacaq</p>
            {[
              { icon: <BookmarkCheck size={16} />, label: "Hesablamaları yadda saxlamaq" },
              { icon: <History size={16} />, label: "Müqayisə tarixçəsini görmək" },
              { icon: <Star size={16} />, label: "Seçilmiş materialları saxlamaq" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <span className="text-blue-400">{f.icon}</span>
                <span className="text-sm text-gray-600">{f.label}</span>
              </div>
            ))}
          </div>

          <Link href="/az/kredit-yoxlama"
            className="block w-full py-3 rounded-xl font-semibold text-white text-sm text-center"
            style={{ background: "linear-gradient(135deg, #2447F0 0%, #1B36BE 100%)" }}>
            Sənədsiz ilkin yoxlama
          </Link>
        </div>
      </div>
    </main>
  );
}
