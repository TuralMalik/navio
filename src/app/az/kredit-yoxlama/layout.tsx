import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kredit şansını yoxla — pulsuz ilkin qiymətləndirmə",
  description: "Banka müraciət etmədən əvvəl kredit almaq şansınızı öyrənin. 3 dəqiqə, sorğusuz və pulsuz — kredit tarixçənizə təsir etmir.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
