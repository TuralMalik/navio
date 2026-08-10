import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { isGoogleConfigured } from "@/lib/server/google-credentials";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  // Та же проверка, что и при регистрации провайдера: кнопка не должна вести в ошибку
  const googleEnabled = isGoogleConfigured();
  const emailEnabled = Boolean(process.env.RESEND_API_KEY);
  return (
    <Suspense fallback={<main className="bg-gray-50 min-h-screen" />}>
      <RegisterForm googleEnabled={googleEnabled} emailEnabled={emailEnabled} />
    </Suspense>
  );
}
