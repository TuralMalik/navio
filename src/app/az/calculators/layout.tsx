import type { Metadata } from "next";
import { CalcHeader } from "@/components/calculators/CalcNav";

export const metadata: Metadata = {
  title: { default: "Kredit kalkulyatorları", template: "%s | Navio" },
  description: "İstehlak, ipoteka və avtokredit üçün aylıq ödənişi, faiz xərclərini və ümumi məbləği hesablayın.",
};

/* Шапка и переключатель живут в layout: при переходе между калькуляторами
   они не размонтируются, поэтому вкладки не мигают, а едущая подложка
   доигрывает переход. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <CalcHeader />
      {children}
    </main>
  );
}
