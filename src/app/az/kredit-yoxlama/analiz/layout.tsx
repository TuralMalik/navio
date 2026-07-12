import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nəticənin ətraflı analizi",
  description: "Kredit şansı balınızın ətraflı izahı: amillər, məhdudlaşdırıcılar və balı artırmaq üçün konkret tövsiyələr.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
