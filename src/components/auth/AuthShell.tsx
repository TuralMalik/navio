"use client";

import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export { Field, inputClasses } from "@/components/ui/Field";

/* Хлебных крошек здесь нет намеренно.

   Вход и регистрация — тупиковые экраны в одном шаге от чего угодно: сюда
   попадают из шапки или по редиректу с закрытой страницы, и «Ana səhifə ›
   Giriş» не описывает никакой реальной иерархии. Уйти отсюда можно логотипом
   в шапке, а на самой карточке лишняя строка только отвлекает от формы.

   crumb остаётся в пропсах: он всё ещё нужен как заголовок вкладки. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  crumb?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 py-10">
      <div className="mx-auto w-full max-w-md px-4">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 mb-6 text-sm leading-relaxed text-gray-600">{subtitle}</p>
          {children}
        </Card>

        <p className="mt-5 text-center text-xs leading-relaxed text-gray-500">
          Navio bank deyil. Qeydiyyat üçün FIN, pasport və ya bank məlumatları tələb olunmur.
        </p>
      </div>
    </main>
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" loading={loading} block size="lg">
      {children}
    </Button>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    /* role=alert, чтобы скринридер сообщил об ошибке сразу: без него человек,
       не видящий экрана, нажимает «Daxil ol» и не узнаёт, что что-то не так. */
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
    >
      <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" aria-hidden />
      {message}
    </div>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-gray-500">{label}</span>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

/** Официальная кнопка Google: логотип обязателен по их brand guidelines. */
export function GoogleButton({ onClick, loading, label }: { onClick: () => void; loading: boolean; label: string }) {
  return (
    <Button
      variant="secondary"
      block
      size="lg"
      onClick={onClick}
      loading={loading}
      icon={
        <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
          <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
        </svg>
      }
    >
      {label}
    </Button>
  );
}
