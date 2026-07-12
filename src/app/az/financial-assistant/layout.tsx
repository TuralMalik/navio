import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maliyyə köməkçisi — kredit sualları",
  description: "Kreditlər, gecikmələr, ipoteka və kredit tarixçəsi haqqında suallarınıza sadə və aydın cavablar.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
