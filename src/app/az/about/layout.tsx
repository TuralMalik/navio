import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Haqqımızda",
  description: "Navio, kredit qərarlarından əvvəl maliyyə vəziyyətinizi anlamağa kömək edən məlumat platformasıdır.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
