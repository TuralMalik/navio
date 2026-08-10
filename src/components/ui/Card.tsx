import type { ReactNode } from "react";

/* Поверхности.

   Шкала радиусов держится строго, потому что она и есть иерархия:
   Card (rounded-2xl) — уровень страницы, Panel (rounded-xl) — вложенный блок,
   контролы — rounded-lg и мельче. Если всё скруглить одинаково, вложенность
   перестаёт читаться и страница выглядит как список одинаковых плиток.

   Граница, а не тень: hairline border-gray-200 — базовая отбивка карточки.
   Тень (shadow-card) настолько слабая, что её нельзя заметить специально —
   именно так и задумано. */

interface SurfaceProps {
  children: ReactNode;
  className?: string;
  /** Убрать внутренние отступы: для карточек с таблицей или списком во всю ширину. */
  flush?: boolean;
}

export function Card({ children, className = "", flush = false }: SurfaceProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-card ${flush ? "" : "p-5 sm:p-6"} ${className}`}
    >
      {children}
    </div>
  );
}

/** Вложенная панель. Глубже одного уровня не вкладывать. */
export function Panel({ children, className = "", flush = false }: SurfaceProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white ${flush ? "" : "p-4"} ${className}`}>
      {children}
    </div>
  );
}

/** Заголовок секции внутри карточки. Sentence case, без разрядки и капса. */
export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-lg font-bold text-ink tracking-tight ${className}`}>{children}</h2>;
}

/** Пояснение под заголовком. */
export function CardHint({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;
}
