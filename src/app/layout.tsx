import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://navio.az";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Navio — Sizin maliyyə bələdçiniz",
    template: "%s | Navio",
  },
  description:
    "Kredit profilinizi ilkin qiymətləndirin, ödənişləri hesablayın, maliyyə suallarınıza cavab tapın.",
  openGraph: {
    type: "website",
    siteName: "Navio",
    locale: "az_AZ",
    title: "Navio — Sizin maliyyə bələdçiniz",
    description:
      "Banka müraciət etmədən əvvəl kredit şansınızı yoxlayın — sorğusuz, pulsuz, 3 dəqiqəyə.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
