import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const emailEnabled = Boolean(process.env.RESEND_API_KEY);
  return (
    <Suspense fallback={<main className="bg-gray-50 min-h-screen" />}>
      <RegisterForm googleEnabled={googleEnabled} emailEnabled={emailEnabled} />
    </Suspense>
  );
}
