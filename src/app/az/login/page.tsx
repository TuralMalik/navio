import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

/* Читаем наличие Google-кредов на каждом запросе: owner может выдать их позже,
   и кнопка должна появиться без пересборки. */
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return (
    <Suspense fallback={<main className="bg-gray-50 min-h-screen" />}>
      <LoginForm googleEnabled={googleEnabled} />
    </Suspense>
  );
}
