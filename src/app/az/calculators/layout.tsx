import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Kredit kalkulyatorları", template: "%s | Navio" },
  description: "İstehlak, ipoteka və avtokredit üçün aylıq ödənişi, faiz xərclərini və ümumi məbləği hesablayın.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
