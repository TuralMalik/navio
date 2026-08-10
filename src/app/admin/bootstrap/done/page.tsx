import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin created", robots: { index: false, follow: false } };

const COOKIE = "navio_bootstrap_result";

/* Экран «админ создан»: единственное место, где секрет TOTP и резервные коды
   видны в открытом виде.

   Раньше страница удаляла cookie прямо в теле компонента. Next это запрещает:
   менять cookie можно только в Server Action или Route Handler, поэтому
   страница падала ДО отрисовки — администратор в базе появлялся, а секрет и
   резервные коды не показывались никогда. Войти после этого было невозможно:
   второй фактор обязателен, а его никто не видел.

   Теперь удаление живёт в действии за кнопкой «я сохранил». Это заодно
   правильнее по смыслу: секрет исчезает не тогда, когда страница
   отрисовалась, а тогда, когда человек подтвердил, что записал его. Случайное
   обновление страницы больше ничего не теряет. */

async function dismiss() {
  "use server";
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/admin/login");
}

export default async function BootstrapDonePage() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;

  // Нет cookie — либо страницу открыли напрямую, либо секрет уже подтверждён
  if (!raw) redirect("/admin/login");

  let data: { email: string; totpSecret: string; totpUri: string; backupCodes: string[] };
  try {
    data = JSON.parse(raw);
  } catch {
    redirect("/admin/login");
  }

  const svg = await QRCode.toString(data.totpUri, { type: "svg", margin: 1, width: 190 });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-10">
      <div className="w-full max-w-[460px] space-y-5 rounded-xl bg-white p-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-600">
            <ShieldCheck size={18} className="text-white" />
          </span>
          <div>
            <p className="text-[15px] font-bold leading-tight text-slate-900">Administrator created</p>
            <p className="text-[12px] text-slate-500">{data.email}</p>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12.5px] text-amber-800">
          Save both items below before you continue. Without the authenticator entry or a backup
          code you cannot sign in, because the second factor is required.
        </div>

        <div>
          <p className="mb-2 text-[12.5px] font-semibold text-slate-700">1. Scan with your authenticator app</p>
          <div className="flex items-start gap-4">
            <div
              className="shrink-0 rounded-lg border border-slate-200 p-2 [&_svg]:h-[150px] [&_svg]:w-[150px]"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <div className="min-w-0">
              <p className="mb-1 text-[11px] text-slate-500">Or enter this key manually:</p>
              <p className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-[12px] break-all text-slate-900">
                {data.totpSecret}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12.5px] font-semibold text-slate-700">2. Backup codes (each usable once)</p>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[12.5px]">
            {data.backupCodes.map((c) => (
              <span key={c} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-slate-800">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Кнопка, а не ссылка: она и подтверждает сохранение, и стирает
            секрет. Пока по ней не нажали, обновление страницы безопасно. */}
        <form action={dismiss}>
          <button
            type="submit"
            className="block w-full rounded-lg bg-slate-900 py-2.5 text-center text-[13.5px] font-bold text-white transition-colors hover:bg-slate-800"
          >
            I have saved both, go to sign-in
          </button>
        </form>

        <p className="text-[11px] leading-relaxed text-slate-500">
          Setup is now closed: this page cannot create another administrator. You can remove
          <code className="font-mono"> ADMIN_BOOTSTRAP_TOKEN</code> from the server, it has no further use.
        </p>
      </div>
    </main>
  );
}
