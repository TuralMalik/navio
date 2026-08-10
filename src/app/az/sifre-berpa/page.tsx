"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AuthShell, Field, SubmitButton, FormError, inputClasses } from "@/components/auth/AuthShell";

const MIN_PASSWORD = 8;

function ResetContent() {
  const params = useSearchParams();
  // Better Auth кладёт токен в ?token=, а при невалидном — ?error=
  const token = params.get("token");
  const linkError = params.get("error");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setError(`Şifrə ən azı ${MIN_PASSWORD} simvol olmalıdır.`);
      return;
    }
    if (!token) {
      setError("Keçid etibarsızdır.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    if (error) {
      setError("Keçidin vaxtı bitib və ya artıq istifadə olunub. Yenidən cəhd edin.");
      setLoading(false);
      return;
    }
    setDone(true);
  }

  if (linkError || !token) {
    return (
      <AuthShell crumb="Şifrənin bərpası" title="Keçid etibarsızdır" subtitle="Bu keçidin vaxtı bitib və ya artıq istifadə olunub.">
        <Link href="/az/login"
          className="block w-full py-3 rounded-xl font-semibold text-white text-sm text-center"
          style={{ background: "linear-gradient(135deg, #2447F0 0%, #1B36BE 100%)" }}>
          Yenidən bərpa keçidi istəyin
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell crumb="Şifrənin bərpası" title="Şifrə dəyişdirildi" subtitle="Yeni şifrənizlə daxil ola bilərsiniz.">
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 mb-5">
          <CheckCircle2 size={17} className="shrink-0 mt-0.5 text-emerald-600" />
          <p>Şifrəniz uğurla yeniləndi.</p>
        </div>
        <Link href="/az/login"
          className="block w-full py-3 rounded-xl font-semibold text-white text-sm text-center"
          style={{ background: "linear-gradient(135deg, #2447F0 0%, #1B36BE 100%)" }}>
          Daxil ol
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell crumb="Şifrənin bərpası" title="Yeni şifrə təyin edin" subtitle="Hesabınız üçün yeni şifrə seçin.">
      <form onSubmit={onSubmit} className="space-y-4">
        <FormError message={error} />
        <Field label="Yeni şifrə" hint={`Ən azı ${MIN_PASSWORD} simvol`}>
          <input type="password" required autoComplete="new-password" minLength={MIN_PASSWORD} value={password}
            onChange={(e) => setPassword(e.target.value)} className={inputClasses()} placeholder="••••••••" />
        </Field>
        <SubmitButton loading={loading}>Şifrəni dəyiş</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="bg-gray-50 min-h-screen" />}>
      <ResetContent />
    </Suspense>
  );
}
