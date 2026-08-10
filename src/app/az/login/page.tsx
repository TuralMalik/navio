import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { isGoogleConfigured } from "@/lib/server/google-credentials";

/* Читаем наличие Google-кредов на каждом запросе: owner может выдать их позже,
   и кнопка должна появиться без пересборки. */
export const dynamic = "force-dynamic";

export default function LoginPage() {
  // Та же проверка, что и при регистрации провайдера: кнопка не должна вести в ошибку
  const googleEnabled = isGoogleConfigured();
  // Без Resend восстановление пароля не работает — прячем ссылку
  const emailEnabled = Boolean(process.env.RESEND_API_KEY);
  return (
    <Suspense fallback={<main className="bg-gray-50 min-h-screen" />}>
      <LoginForm googleEnabled={googleEnabled} emailEnabled={emailEnabled} />
    </Suspense>
  );
}
