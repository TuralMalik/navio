"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useSheetDrag } from "@/lib/useSheetDrag";

/* Нижняя шторка для телефона: выезжает снизу, гасит фон, блокирует прокрутку
   страницы под собой и закрывается тапом по фону, Escape или свайпом вниз.

   Рендерится порталом в body. Причина конкретная: у шторки z-index должен
   соревноваться с нижней панелью навигации, а любой предок с transform или
   filter создаёт свой контекст наложения и запирает z-index внутри него.
   Тогда панель рисуется поверх шторки. */

const ANIM_MS = 200;

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const [entered, setEntered] = useState(false);
  const { offset, dragging, handleProps } = useSheetDrag(onClose, open);

  /* Шторка остаётся в дереве, пока проигрывается уход: если размонтировать
     её сразу, выезд получится только в одну сторону. Состояние выводится во
     время рендера, а не в эффекте, иначе первый кадр после открытия
     рисовался бы ещё без шторки. */
  const [lastOpen, setLastOpen] = useState(open);
  const [closing, setClosing] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    setClosing(!open);
    setEntered(false);
  }
  const mounted = open || closing;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Фон не должен прокручиваться под открытой шторкой
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Снимаем «закрывается» после анимации ухода
  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => setClosing(false), ANIM_MS);
    return () => clearTimeout(t);
  }, [closing]);

  useEffect(() => {
    if (!open) return;
    // Кадр задержки, чтобы браузер успел отрисовать стартовое состояние
    // и переход действительно проигрался, а не был склеен с монтированием.
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ opacity: entered ? 1 : 0, transition: `opacity ${ANIM_MS}ms ease-out` }}
        className="fixed inset-0 z-[1110] bg-black/30"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          transform: entered ? `translateY(${offset}px)` : "translateY(100%)",
          transition: dragging ? "none" : `transform ${ANIM_MS}ms ease-out`,
        }}
        className="fixed inset-x-0 bottom-0 z-[1120] flex max-h-[85vh] flex-col rounded-t-2xl bg-white will-change-transform"
      >
        {/* Ручка. touch-none обязателен: иначе браузер перехватит жест
            прокруткой или обновлением страницы. */}
        <div
          {...handleProps}
          aria-hidden
          className="flex shrink-0 touch-none justify-center pt-3 pb-1"
        >
          <div className="h-1.5 w-10 rounded-full bg-gray-300" />
        </div>

        {title && (
          <div className="flex shrink-0 items-center justify-between px-4 pb-2">
            <h2 className="text-base font-bold text-ink">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Bağla"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
