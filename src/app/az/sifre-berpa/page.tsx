"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AuthShell, SubmitButton, FormError } from "@/components/auth/AuthShell";
import { TextInput } from "@/components/ui/Field";
import { LinkButton } from "@/components/ui/Button";

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
        <LinkButton href="/az/login" block size="lg">
          Yenidən bərpa keçidi istəyin
        </LinkButton>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell crumb="Şifrənin bərpası" title="Şifrə dəyişdirildi" subtitle="Yeni şifrənizlə daxil ola bilərsiniz.">
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
          <p>Şifrəniz uğurla yeniləndi.</p>
        </div>
        <LinkButton href="/az/login" block size="lg">
          Daxil ol
        </LinkButton>
      </AuthShell>
    );
  }

  return (
    <AuthShell crumb="Şifrənin bərpası" title="Yeni şifrə təyin edin" subtitle="Hesabınız üçün yeni şifrə seçin.">
      <form onSubmit={onSubmit} className="space-y-4">
        <FormError message={error} />
        <TextInput label="Yeni şifrə" hint={`Ən azı ${MIN_PASSWORD} simvol`} type="password" required
          autoComplete="new-password" minLength={MIN_PASSWORD} value={password}
          onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <SubmitButton loading={loading}>Şifrəni dəyiş</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50" />}>
      <ResetContent />
    </Suspense>
  );
}
