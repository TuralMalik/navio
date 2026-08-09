"use client";

import { useCallback, useEffect, useRef } from "react";

/** Откладывает вызов на delay мс; повторные вызовы сбрасывают таймер. */
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay: number) {
  const fnRef = useRef(fn);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return useCallback(
    (...args: A) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay],
  );
}

/** Счётчик запросов: ответ применяем, только если он от последнего отправленного.
   Без этого медленный ранний ответ может перетереть свежий результат. */
export function useLatestRequest() {
  const seq = useRef(0);
  const next = useCallback(() => ++seq.current, []);
  const isLatest = useCallback((id: number) => id === seq.current, []);
  return { next, isLatest };
}
