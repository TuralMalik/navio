import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ShieldCheck } from "lucide-react";
import { getAdminSession, loginAdmin, purgeExpiredAdminSessions } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin sign-in", robots: { index: false, follow: false } };

/* Вход в админку: пароль и код приложения-аутентификатора за один шаг.
   Двухшаговой формы нет специально — промежуточное состояние «пароль верный,
   ждём код» само по себе подсказка для перебора. */

async function signIn(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const token = String(formData.get("token") ?? "");

  if (!email || !password || !token) {
    redirect("/admin/login?error=missing");
  }

  const h = await headers();
  const req = new Request("https://navio.local/admin/login", { headers: h });

  const result = await loginAdmin({ email, password, token, req });

  if (!result.ok) {
    if (result.reason === "locked") {
      redirect(`/admin/login?error=locked&minutes=${result.retryAfterMinutes ?? 15}`);
    }
    // Одна формулировка на все случаи: не подсказываем, какой из факторов не сошёлся
    redirect("/admin/login?error=invalid");
  }

  void purgeExpiredAdminSessions();
  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; minutes?: string }>;
}) {
  // Уже вошёл — незачем показывать форму
  if (await getAdminSession()) redirect("/admin");

  const sp = await searchParams;
  const error =
    sp.error === "locked"
      ? `Too many failed attempts. Try again in ${sp.minutes ?? 15} minutes.`
      : sp.error === "missing"
        ? "Fill in all three fields."
        : sp.error
          ? "Those details are not correct."
          : null;

  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="w-9 h-9 rounded-lg bg-blue-600 grid place-items-center">
            <ShieldCheck size={18} className="text-white" />
          </span>
          <div>
            <p className="text-[15px] font-bold text-white leading-tight">Navio admin</p>
            <p className="text-[11.5px] text-slate-400">Two-factor authentication required</p>
          </div>
        </div>

        <form action={signIn} className="bg-white rounded-xl p-6 space-y-4">
          {error && (
            <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Email</label>
            <input id="email" name="email" type="email" required autoComplete="username" className={input} />
          </div>

          <div>
            <label htmlFor="password" className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" className={input} />
          </div>

          <div>
            <label htmlFor="token" className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
              Authenticator code
            </label>
            <input
              id="token" name="token" type="text" required
              inputMode="numeric" autoComplete="one-time-code"
              placeholder="123456"
              className={`${input} tracking-[0.3em] font-mono`}
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Six digits from your authenticator app, or one backup code.
            </p>
          </div>

          <button type="submit"
            className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-[13.5px] font-bold hover:bg-slate-800 transition-colors">
            Sign in
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center mt-4">
          Admin accounts are provisioned directly. There is no sign-up.
        </p>
      </div>
    </main>
  );
}
