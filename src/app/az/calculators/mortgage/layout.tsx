import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İpoteka kalkulyatoru",
  description: "Əmlak dəyəri, ilkin ödəniş və müddətə görə ipoteka üzrə aylıq ödənişi hesablayın.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
