import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avtokredit kalkulyatoru",
  description: "Avtomobilin qiyməti, ilkin ödəniş və kredit müddətinə görə aylıq ödənişi hesablayın.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
