"use client";

import { useEffect, useRef, useState } from "react";

/* Лёгкий scroll-entrance: добавляет класс nv-in, когда элемент попадает во вьюпорт.
   Анимация задаётся в globals.css (.nv-reveal / .nv-stagger). Одноразово.
   prefers-reduced-motion обрабатывается в CSS (там reveal сразу видим). */
export function Reveal({
  children, className = "", as: Tag = "div", once = true, style,
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  once?: boolean;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        });
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag ref={ref} style={style} className={`nv-reveal ${shown ? "nv-in" : ""} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
