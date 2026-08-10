"use client";

/* Автоматический захват кликов и отправок форм.

   ЖЁСТКОЕ ПРАВИЛО ПРИВАТНОСТИ: здесь НИКОГДА не читается value поля ввода.
   Формы Navio содержат доход, размер долга, дни просрочки и возраст. Эти данные
   осознанно хранятся в scoring_calculation вместе с расчётом — там у них есть
   контекст и они описаны в политике конфиденциальности. Утаскивать их ещё и в
   аналитику значит размножать чувствительные данные по таблицам, где их никто
   не ждёт. Поэтому от полей берём только ИМЕНА, а не значения.

   Исключение — явное согласие на месте: элемент с data-track-value отдаёт и
   значение. Ставить его на поля с суммами и доходом нельзя.

   Что пишется:
   • ui.click     — клик по ссылке/кнопке/интерактивному элементу
   • form.submit  — отправка формы (список имён полей, без значений)
   • ui.change    — переключение select/checkbox/radio (имя; значение — по opt-in) */

import { trackEvent } from "./tracking";

/** Ползунки исключены: перетаскивание генерирует поток событий ни о чём. */
const CHANGE_SKIP_TYPES = new Set(["range", "file", "password"]);

/** Мягкий потолок на визит: защита от бесконечного цикла на месте вызова. */
const MAX_EVENTS_PER_VISIT = 200;
let emitted = 0;

const INTERACTIVE = "a,button,[role=button],[role=tab],[role=link],input[type=submit],input[type=button],summary,[data-track]";

function clean(s: string | null | undefined): string {
  return (s ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
}

/** Устойчивая подпись элемента. Читает только разметку и текст — не value. */
function labelOf(el: Element): string {
  const explicit = el.getAttribute("data-track");
  if (explicit) return clean(explicit);

  const aria = el.getAttribute("aria-label");
  if (aria) return clean(aria);

  // textContent кнопки/ссылки — это подпись интерфейса, не пользовательский ввод
  const text = clean(el.textContent);
  if (text) return text;

  const title = el.getAttribute("title");
  if (title) return clean(title);

  const name = el.getAttribute("name") || el.getAttribute("id");
  if (name) return clean(name);

  const cls = (el.getAttribute("class") || "").split(/\s+/).filter(Boolean)[0];
  return clean(`${el.tagName.toLowerCase()}${cls ? "." + cls : ""}`);
}

/** Для ссылок — только внутренний путь либо внешний хост, не полный URL. */
function linkTarget(el: Element): string | undefined {
  const href = el.getAttribute("href");
  if (!href) return undefined;
  if (href.startsWith("/")) return href.slice(0, 120);
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href.slice(0, 60);
  }
  try {
    return new URL(href, window.location.origin).host.slice(0, 120);
  } catch {
    return undefined;
  }
}

function emit(name: string, props: Record<string, unknown>): void {
  if (emitted >= MAX_EVENTS_PER_VISIT) return;
  emitted += 1;
  trackEvent(name, props);
}

/** Сбрасывается при навигации, чтобы потолок был на визит, а не на сессию. */
export function resetAutoCaptureBudget(): void {
  emitted = 0;
}

function onClick(e: MouseEvent): void {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const el = target.closest(INTERACTIVE);
  if (!el) return;

  const props: Record<string, unknown> = {
    label: labelOf(el),
    tag: el.tagName.toLowerCase(),
  };
  const to = linkTarget(el);
  if (to) props.to = to;

  const type = el.getAttribute("type");
  if (type) props.type = type;

  emit("ui.click", props);
}

function onSubmit(e: Event): void {
  const form = e.target;
  if (!(form instanceof HTMLFormElement)) return;

  // Только имена полей. Значения не читаем — см. правило приватности выше.
  const fields: string[] = [];
  for (const el of Array.from(form.elements)) {
    const name = el.getAttribute?.("name") || el.getAttribute?.("id");
    if (name && fields.length < 25) fields.push(clean(name));
  }

  emit("form.submit", {
    form: clean(form.getAttribute("name") || form.getAttribute("id") || form.getAttribute("data-track") || "form"),
    fields,
  });
}

function onChange(e: Event): void {
  const el = e.target;
  if (!(el instanceof HTMLElement)) return;

  const tag = el.tagName.toLowerCase();
  if (tag !== "select" && tag !== "input" && tag !== "textarea") return;

  const type = (el.getAttribute("type") || "").toLowerCase();
  if (CHANGE_SKIP_TYPES.has(type)) return;
  // Свободный текст не трогаем вовсе: там и живут суммы и доход
  if (tag === "textarea" || type === "text" || type === "number" || type === "email" || type === "tel") return;

  const props: Record<string, unknown> = {
    field: clean(el.getAttribute("name") || el.getAttribute("id") || labelOf(el)),
    tag,
  };
  if (type) props.type = type;

  // Значение — только по явному согласию на самом элементе
  if (el.hasAttribute("data-track-value")) {
    if (el instanceof HTMLSelectElement) props.value = clean(el.value);
    else if (el instanceof HTMLInputElement && (type === "checkbox" || type === "radio")) props.value = el.checked;
  }

  emit("ui.change", props);
}

/** Ставит слушатели на document. Возвращает функцию снятия. */
export function installAutoCapture(): () => void {
  // capture: true — успеваем до stopPropagation в обработчиках приложения
  document.addEventListener("click", onClick, { capture: true, passive: true });
  document.addEventListener("submit", onSubmit, { capture: true });
  document.addEventListener("change", onChange, { capture: true, passive: true });

  return () => {
    document.removeEventListener("click", onClick, { capture: true });
    document.removeEventListener("submit", onSubmit, { capture: true });
    document.removeEventListener("change", onChange, { capture: true });
  };
}
