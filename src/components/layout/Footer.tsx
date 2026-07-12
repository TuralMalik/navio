import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-3">
              <span className="text-xl font-bold text-white">Navio</span>
              <p className="text-xs text-gray-400 mt-0.5">Sizin maliyyə bələdçiniz</p>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Navio kredit profilinizi ilkin qiymətləndirməyə, ödənişləri hesablamağa və maliyyə
              mövzularını anlamağa kömək edən məlumat platformasıdır.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Navio bank deyil. Heç bir kredit vermir və banka müraciətin nəticəsinə zəmanət vermir.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Xidmətlər</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/az/kredit-yoxlama" className="hover:text-white transition-colors">Kredit yoxlaması</Link></li>
              <li><Link href="/az/calculators/consumer-loan" className="hover:text-white transition-colors">İstehlak krediti kalkulyatoru</Link></li>
              <li><Link href="/az/calculators/mortgage" className="hover:text-white transition-colors">İpoteka kalkulyatoru</Link></li>
              <li><Link href="/az/calculators/auto-loan" className="hover:text-white transition-colors">Avtokredit kalkulyatoru</Link></li>
              <li><Link href="/az/financial-assistant" className="hover:text-white transition-colors">Maliyyə köməkçisi</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Şirkət</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/az/about" className="hover:text-white transition-colors">Haqqımızda</Link></li>
              <li><Link href="/az/privacy" className="hover:text-white transition-colors">Məxfilik siyasəti</Link></li>
              <li><Link href="/az/disclaimer" className="hover:text-white transition-colors">İmtina bəyanatı</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Navio. Bütün hüquqlar qorunur.</p>
          <p className="text-xs text-gray-500">
            Bu platforma yalnız məlumat xarakteri daşıyır.
          </p>
        </div>
      </div>
    </footer>
  );
}
