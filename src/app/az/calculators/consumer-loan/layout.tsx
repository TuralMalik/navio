import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İstehlak krediti kalkulyatoru",
  description: "İstehlak krediti üzrə aylıq ödənişi, faiz xərclərini və erkən ödənişin təsirini hesablayın.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
