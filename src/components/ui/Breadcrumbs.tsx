import Link from "next/link";
import { ChevronRight } from "lucide-react";

/* Хлебные крошки. Последний элемент — текущая страница, поэтому он не ссылка
   и помечен aria-current: ссылка на саму себя сбивает и мышь, и скринридер. */
export function Breadcrumbs({ trail, current }: { trail: { href: string; label: string }[]; current: string }) {
  return (
    <nav aria-label="Naviqasiya" className="mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-gray-500">
      {trail.map((t) => (
        <span key={t.href} className="flex items-center gap-1.5">
          <Link href={t.href} className="rounded hover:text-brand-700">
            {t.label}
          </Link>
          <ChevronRight size={13} aria-hidden className="text-gray-400" />
        </span>
      ))}
      <span aria-current="page" className="text-gray-700">{current}</span>
    </nav>
  );
}
