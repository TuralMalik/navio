import { notFound, redirect } from "next/navigation";
import { KeyRound, AlertTriangle } from "lucide-react";
import { bootstrapState, createFirstAdmin } from "@/lib/server/admin-bootstrap";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin setup", robots: { index: false, follow: false } };

/* Одноразовая страница создания первого администратора.
   Живёт ВНЕ защищённой группы маршрутов: войти ещё некем.
   Закрывается сама, как только в admin_user появляется первая строка. */

/** Секрет и резервные коды НЕ передаём через URL: они осели бы в истории
   браузера и в логах. Кладём в короткоживущий httpOnly-cookie, который экран
   результата читает и сразу удаляет. */
async function create(formData: FormData) {
  "use server";

  const token = String(formData.get("token") ?? "");
  const result = await createFirstAdmin({
    token,
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!result.ok) {
    redirect(`/admin/bootstrap?token=${encodeURIComponent(token)}&error=${result.reason}`);
  }

  // Секреты показываем на отдельном экране, но не в URL: кладём в одноразовый
  // cookie, который страница результата сразу удаляет.
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  jar.set("navio_bootstrap_result", JSON.stringify(result.result), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 600,
  });
  redirect("/admin/bootstrap/done");
}

const ERRORS: Record<string, string> = {
  "bad-token": "That setup token is not correct.",
  "no-token-configured": "ADMIN_BOOTSTRAP_TOKEN is not set on the server.",
  "already-initialised": "An admin already exists. Setup is closed.",
  "bad-email": "That email address does not look valid.",
  "weak-password": "Use at least 12 characters.",
};

export default async function BootstrapPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const state = await bootstrapState(sp.token);

  // Админ уже есть — страницы просто не существует
  if (!state.available && state.reason === "already-initialised") notFound();

  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  const error = sp.error ? (ERRORS[sp.error] ?? "Something went wrong.") : null;

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="w-9 h-9 rounded-lg bg-blue-600 grid place-items-center">
            <KeyRound size={18} className="text-white" />
          </span>
          <div>
            <p className="text-[15px] font-bold text-white leading-tight">Navio admin setup</p>
            <p className="text-[11.5px] text-slate-400">Creates the first administrator, once</p>
          </div>
        </div>

        {/* Форму показываем ТОЛЬКО когда настройка действительно открыта.
            Раньше при неверном токене отдавалась форма: создать админа она всё
            равно не могла (сервер перепроверяет), но человек узнавал об этом
            лишь после заполнения. */}
        {!state.available ? (
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-start gap-2.5 text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-3">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold mb-1">Setup is not open.</p>
                {state.reason === "no-token-configured" ? (
                  <p className="leading-relaxed">
                    Add an environment variable named <code className="font-mono">ADMIN_BOOTSTRAP_TOKEN</code> in
                    Vercel (any long random value, 16+ characters), redeploy, then open this page again with
                    <code className="font-mono"> ?token=</code> followed by that value.
                  </p>
                ) : (
                  <p className="leading-relaxed">
                    The setup token in the address is missing or does not match the one configured on the
                    server. Check the value of <code className="font-mono">ADMIN_BOOTSTRAP_TOKEN</code>.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <form action={create} className="bg-white rounded-xl p-6 space-y-4">
            {error && (
              <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}

            <input type="hidden" name="token" value={sp.token ?? ""} />

            <div>
              <label htmlFor="email" className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Email</label>
              <input id="email" name="email" type="email" required className={input} placeholder="admin@navio.az" />
            </div>

            <div>
              <label htmlFor="name" className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Name</label>
              <input id="name" name="name" type="text" className={input} placeholder="Full name" />
            </div>

            <div>
              <label htmlFor="password" className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Password</label>
              <input id="password" name="password" type="password" required minLength={12} className={input} />
              <p className="text-[11px] text-slate-500 mt-1.5">
                At least 12 characters. Use a password manager to generate it.
              </p>
            </div>

            <button type="submit"
              className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-[13.5px] font-bold hover:bg-slate-800 transition-colors">
              Create administrator
            </button>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              The next screen shows a QR code for your authenticator app and a set of backup codes.
              They are shown once and cannot be recovered.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
