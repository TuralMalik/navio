"use client";

import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

/* Поле ввода с полным набором состояний.

   Ошибка ОБЯЗАНА быть конкретной («Gəlir 0-dan böyük olmalıdır»), а не общей
   («Yanlış dəyər»): пользователь должен понять, что именно исправить, не
   перебирая поля. Введённое значение при ошибке не стирается — форма,
   очищающая поля после неудачной отправки, заставляет набирать всё заново.

   Связка label/input/ошибка идёт через id и aria-describedby, иначе
   скринридер прочитает поле без подписи и без причины ошибки. */

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-800 mb-1.5">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-700">
          <AlertCircle size={13} className="mt-px shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

/** Классы поля ввода. Экспортируются для случаев, когда нужен свой элемент. */
export function inputClasses(error?: string | null, className = ""): string {
  return [
    "w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-ink",
    "placeholder:text-gray-400 transition-colors",
    "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
    error ? "border-rose-400 hover:border-rose-500" : "border-gray-300 hover:border-gray-400",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type TextInputProps = Omit<ComponentProps<"input">, "className"> & {
  label: string;
  hint?: string;
  error?: string | null;
  className?: string;
};

/** Подписанное поле ввода: сам связывает label, ошибку и aria-атрибуты. */
export function TextInput({ label, hint, error, className, id, ...rest }: TextInputProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-semibold text-gray-800 mb-1.5">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClasses(error)}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-700">
          <AlertCircle size={13} className="mt-px shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-gray-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
