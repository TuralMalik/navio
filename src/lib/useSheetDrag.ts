"use client";

import { useState } from "react";

/* Закрытие шторки свайпом вниз.

   Палец ведёт шторку один в один; отпустили ниже порога — закрылась, выше —
   вернулась на место. Без этого шторку на телефоне можно закрыть только
   прицельным попаданием в крестик, что для нижнего листа неестественно.

   Жест ловится ТОЛЬКО на узких экранах и только на неподвижной зоне (ручка
   или заголовок). Если повесить его на прокручиваемое тело, он начнёт
   конфликтовать со скроллом и с pull-to-refresh.

   Состояние держим в useState, а не в ref: ref нельзя ни читать, ни писать
   во время рендера (React Compiler это запрещает), а обработчики касаний
   пересоздаются на каждый рендер и поэтому всегда видят свежие значения.
   Между touchmove и touchend рендер успевает закоммититься, так что на
   отпускании смещение уже актуальное. */

const CLOSE_THRESHOLD_PX = 80;

export function useSheetDrag(onClose: () => void, open: boolean) {
  const [startY, setStartY] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);

  /* Сброс при повторном открытии — во время рендера, а не в эффекте:
     иначе шторка на кадр появлялась бы всё ещё сдвинутой на величину
     прошлого свайпа. */
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setStartY(null);
      setOffset(0);
    }
  }

  const end = () => {
    if (startY === null) return;
    setStartY(null);
    // Смещение при закрытии намеренно НЕ обнуляем: у шторки есть анимация
    // ухода, и она должна продолжиться с той точки, где отпустили палец,
    // а не прыгнуть обратно в ноль и только потом уехать вниз.
    if (offset > CLOSE_THRESHOLD_PX) onClose();
    else setOffset(0);
  };

  return {
    offset,
    dragging: startY !== null,
    handleProps: {
      onTouchStart: (e: React.TouchEvent) => {
        if (window.matchMedia("(min-width: 640px)").matches) return;
        setStartY(e.touches[0].clientY);
        setOffset(0);
      },
      onTouchMove: (e: React.TouchEvent) => {
        if (startY === null) return;
        // Только вниз: вверх шторка не растягивается.
        setOffset(Math.max(0, e.touches[0].clientY - startY));
      },
      onTouchEnd: end,
      onTouchCancel: end,
    },
  };
}
