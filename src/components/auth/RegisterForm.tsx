"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookmarkCheck, History, Star, MailCheck, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AuthShell, Field, SubmitButton, FormError, Divider, GoogleButton, inputCls } from "./AuthShell";

const DEFAULT_NEXT = "/az";
const MIN_PASSWORD = 8;

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return DEFAULT_NEXT;
  return raw;
}

export function RegisterForm({ googleEnabled, emailEnabled }: { googleEnabled: boolean; emailEnabled: boolean }) {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setError(`Şifrə ən azı ${MIN_PASSWORD} simvol olmalıdır.`);
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await authClient.signUp.email({ email, password, name, callbackURL: next });
    if (error) {
      setError(
        error.status === 422
          ? "Bu e-poçt artıq qeydiyyatdan keçib."
          : "Qeydiyyat alınmadı. Bir az sonra yenidən cəhd edin.",
      );
      setLoading(false);
      return;
    }
    // Подтверждение почты не обязательно; письмо уходит только если почта подключена
    setDone(true);
    setTimeout(() => window.location.assign(next), 1200);
  }

  async function onGoogle() {
    setGoogleLoading(true);
    setError(null);
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: next });
    if (error) {
      setError("Google ilə qeydiyyat alınmadı.");
      setGoogleLoading(false);
    }
  }

  if (done) {
    return (
      <AuthShell crumb="Qeydiyyat" title="Hesabınız hazırdır" subtitle="Sizi nəticəyə yönləndiririk...">
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
          {emailEnabled ? (
            <>
              <MailCheck size={17} className="shrink-0 mt-0.5 text-emerald-600" />
              <p>
                <strong>{email}</strong> ünvanına təsdiq məktubu göndərdik. Təsdiq etmək məcburi deyil —
                hesabınızdan indi də istifadə edə bilərsiniz.
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 size={17} className="shrink-0 mt-0.5 text-emerald-600" />
              <p>Hesabınız yaradıldı. İndi ətraflı analizə çıxışınız var.</p>
            </>
          )}
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell crumb="Qeydiyyat" title="Qeydiyyatdan keçin" subtitle="Pulsuz hesab — ətraflı analiz və hesablama tarixçəsi üçün.">
      {googleEnabled && (
        <>
          <GoogleButton onClick={onGoogle} loading={googleLoading} label="Google ilə davam et" />
          <Divider label="və ya" />
        </>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <FormError message={error} />

        <Field label="Ad">
          <input type="text" required autoComplete="name" value={name}
            onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Adınız" />
        </Field>

        <Field label="E-poçt">
          <input type="email" required autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="ad@nümunə.az" />
        </Field>

        <Field label="Şifrə" hint={`Ən azı ${MIN_PASSWORD} simvol`}>
          <input type="password" required autoComplete="new-password" minLength={MIN_PASSWORD} value={password}
            onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
        </Field>

        <SubmitButton loading={loading}>Qeydiyyatdan keç</SubmitButton>
      </form>

      <div className="mt-7 pt-6 border-t border-gray-100 space-y-2.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Hesabla əlçatan olur</p>
        {[
          { icon: <BookmarkCheck size={16} />, label: "Ətraflı analiz və tövsiyələr" },
          { icon: <History size={16} />, label: "Hesablama tarixçəsi" },
          { icon: <Star size={16} />, label: "Nəticələri yadda saxlamaq" },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <span className="text-blue-400">{f.icon}</span>
            <span className="text-sm text-gray-600">{f.label}</span>
          </div>
        ))}
      </div>

      <p className="text-sm text-center mt-6 text-gray-500">
        Artıq hesabınız var?{" "}
        <Link href={`/az/login${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-blue-600 hover:text-blue-800">
          Daxil olun
        </Link>
      </p>
    </AuthShell>
  );
}
