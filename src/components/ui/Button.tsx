import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

/* Одна кнопка на всё приложение.

   Нажатие (scale .97), переходы, фокус и вид disabled заданы глобально в
   globals.css для button/[role=button]/.btn — поэтому здесь их нет и
   дублировать их в новых вариантах не нужно.

   Состояние загрузки намеренно НЕ подменяет подпись: спиннер занимает слот
   иконки, ширина кнопки не меняется. Кнопка, которая на время запроса
   схлопывается в «...», сдвигает форму под курсором. */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  // Акцент только здесь: главное действие экрана. Плоская заливка, без градиента.
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-white text-ink border border-gray-300 hover:border-gray-400 hover:bg-gray-50",
  ghost: "text-gray-700 hover:bg-gray-100",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-13 px-7 text-base gap-2",
};

const BASE =
  "btn inline-flex items-center justify-center rounded-lg font-semibold " +
  "select-none whitespace-nowrap";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  /** Иконка слева. При loading подменяется спиннером. */
  icon?: ReactNode;
  /** Растянуть на всю ширину контейнера. */
  block?: boolean;
  className?: string;
  children?: ReactNode;
}

function classes({ variant = "primary", size = "md", block, className }: CommonProps): string {
  return [BASE, VARIANTS[variant], SIZES[size], block ? "w-full" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & { loading?: boolean };

export function Button({
  variant, size, icon, block, className, children, loading = false, disabled, type = "button", ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      // aria-busy, чтобы скринридер сообщил о работе, а не молчал до ответа
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={classes({ variant, size, block, className })}
      {...rest}
    >
      {loading ? <Loader2 aria-hidden className="nv-spin shrink-0" size={16} /> : icon}
      {children}
    </button>
  );
}

type LinkButtonProps = CommonProps & Omit<ComponentProps<typeof Link>, "className" | "children">;

/** Ссылка, выглядящая как кнопка. Отдельный компонент, чтобы не появлялось
    <button> внутри <a> и чтобы навигация оставалась настоящей ссылкой:
    её можно открыть в новой вкладке и она видна поисковику. */
export function LinkButton({ variant, size, icon, block, className, children, ...rest }: LinkButtonProps) {
  return (
    <Link className={classes({ variant, size, block, className })} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
