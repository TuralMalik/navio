"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AuthShell, Field, SubmitButton, FormError, Divider, GoogleButton, inputClasses } from "./AuthShell";

const DEFAULT_NEXT = "/az";

/** Открытый редирект недопустим: принимаем только внутренние пути. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return DEFAULT_NEXT;
  return raw;
}

export function LoginForm({ googleEnabled, emailEnabled }: { googleEnabled: boolean; emailEnabled: boolean }) {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await authClient.signIn.email({ email, password, callbackURL: next });
    if (error) {
      setError(
        error.status === 401 || error.status === 403
          ? "E-poçt və ya şifrə yanlışdır."
          : "Daxil olmaq alınmadı. Bir az sonra yenidən cəhd edin.",
      );
      setLoading(false);
      return;
    }
    window.location.assign(next);
  }

  async function onGoogle() {
    setGoogleLoading(true);
    setError(null);
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: next });
    if (error) {
      setError("Google ilə daxil olmaq alınmadı.");
      setGoogleLoading(false);
    }
  }

  async function onReset() {
    if (!email) {
      setError("Şifrəni bərpa etmək üçün əvvəlcə e-poçt ünvanınızı yazın.");
      return;
    }
    setError(null);
    await authClient.requestPasswordReset({ email, redirectTo: "/az/sifre-berpa" });
    // Ответ одинаковый независимо от того, есть ли такой пользователь:
    // иначе форма превращается в проверку «зарегистрирован ли этот email».
    setResetSent(true);
  }

  return (
    <AuthShell crumb="Giriş" title="Daxil olun" subtitle="Hesabınıza daxil olun və ətraflı analizə çıxış əldə edin.">
      {resetSent ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-800">
          <CheckCircle2 size={17} className="shrink-0 mt-0.5 text-emerald-600" />
          <p>Əgər bu e-poçt üzrə hesab varsa, şifrə bərpası üçün keçid göndərildi. Poçtunuzu yoxlayın.</p>
        </div>
      ) : (
        <>
          {googleEnabled && (
            <>
              <GoogleButton onClick={onGoogle} loading={googleLoading} label="Google ilə davam et" />
              <Divider label="və ya" />
            </>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <FormError message={error} />

            <Field label="E-poçt">
              <input type="email" required autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} className={inputClasses()} placeholder="ad@nümunə.az" />
            </Field>

            <Field label="Şifrə">
              <input type="password" required autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)} className={inputClasses()} placeholder="••••••••" />
            </Field>

            {/* Пока почта не подключена, восстановление пароля недоступно — не показываем ссылку,
                которая обещала бы письмо, которое никогда не придёт. */}
            {emailEnabled && (
              <div className="flex justify-end">
                <button type="button" onClick={onReset} className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                  Şifrəni unutmusunuz?
                </button>
              </div>
            )}

            <SubmitButton loading={loading}>Daxil ol</SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Hesabınız yoxdur?{" "}
            <Link href={`/az/register${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-semibold text-brand-700 hover:text-brand-800">
              Qeydiyyatdan keçin
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
