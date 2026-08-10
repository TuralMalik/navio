import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";
import "./globals.css";

/* latin-ext здесь обязателен, а не «на всякий случай».
   Google-подмножество latin покрывает из азербайджанских букв только ı
   (U+0131). Буквы ə Ə ğ Ğ İ ş Ş лежат в диапазоне U+0100-02BA, то есть в
   latin-ext. С subsets: ["latin"] сайт рендерил их системным шрифтом,
   прямо посреди слова, другим начертанием и метрикой.

   Шрифт выбирался по ТОМУ, ЧТО РЕАЛЬНО ОТДАЁТ Google, а не по исходному
   бинарнику из репозитория google/fonts: подмножества нарезаются на их
   стороне и часть глифов теряется. Разница не теоретическая. У Onest в
   исходнике ə есть, а в отдаваемом latin-ext его нет, хотя unicode-range
   этот диапазон объявляет: браузер скачивает файл, не находит глиф и
   уходит в системный фолбэк. Так же отваливаются Manrope и Open Sans (нет
   Ə), Karla, Figtree, Rubik (нет ə).

   Plus Jakarta Sans проверен по отданным woff2: все азербайджанские буквы
   на месте с непустыми контурами, плюс есть tnum для табличных цифр. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-jakarta",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://navio.az";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Navio · Sizin maliyyə köməkçiniz",
    template: "%s | Navio",
  },
  description:
    "Kredit profilinizi ilkin qiymətləndirin, ödənişləri hesablayın, maliyyə suallarınıza cavab tapın.",
  openGraph: {
    type: "website",
    siteName: "Navio",
    locale: "az_AZ",
    title: "Navio · Sizin maliyyə köməkçiniz",
    description:
      "Banka müraciət etmədən əvvəl kredit şansınızı yoxlayın. Sorğusuz, pulsuz, 3 dəqiqəyə.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-gray-50">
        {children}
        {/* Первопартийная аналитика: просмотры, вовлечённость, клики. */}
        <TrackingProvider />
        <Analytics />
      </body>
    </html>
  );
}
