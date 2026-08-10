import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export default function AzLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />

      {/* Место под фиксированную нижнюю панель. Без этого она накрывала бы
          конец страницы: подвал и последний блок оказывались под ней и
          доскроллить до них было нельзя. Отступ задаётся здесь один раз,
          чтобы каждая страница не помнила про него отдельно. */}
      <div className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
      <MobileTabBar />
    </div>
  );
}
