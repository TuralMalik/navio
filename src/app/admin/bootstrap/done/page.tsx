import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin created", robots: { index: false, follow: false } };

const COOKIE = "navio_bootstrap_result";

/* Экран «админ создан»: единственное место, где секрет TOTP и резервные коды
   видны в открытом виде. Читаем их из одноразового cookie и тут же удаляем,
   чтобы обновление страницы уже ничего не показало. */
export default async function BootstrapDonePage() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;

  // Нет cookie — либо страницу открыли напрямую, либо уже обновили
  if (!raw) redirect("/admin/login");

  jar.delete(COOKIE);

  let data: { email: string; totpSecret: string; totpUri: string; backupCodes: string[] };
  try {
    data = JSON.parse(raw);
  } catch {
    redirect("/admin/login");
  }

  const svg = await QRCode.toString(data.totpUri, { type: "svg", margin: 1, width: 190 });

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[460px] bg-white rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg bg-emerald-600 grid place-items-center">
            <ShieldCheck size={18} className="text-white" />
          </span>
          <div>
            <p className="text-[15px] font-bold text-slate-900 leading-tight">Administrator created</p>
            <p className="text-[12px] text-slate-500">{data.email}</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-[12.5px] text-amber-800">
          Save both items below now. They are shown once and cannot be recovered.
          Refreshing this page will not bring them back.
        </div>

        <div>
          <p className="text-[12.5px] font-semibold text-slate-700 mb-2">1. Scan with your authenticator app</p>
          <div className="flex items-start gap-4">
            <div className="shrink-0 border border-slate-200 rounded-lg p-2 [&_svg]:w-[150px] [&_svg]:h-[150px]"
              dangerouslySetInnerHTML={{ __html: svg }} />
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 mb-1">Or enter this key manually:</p>
              <p className="font-mono text-[12px] text-slate-900 break-all bg-slate-50 border border-slate-200 rounded px-2 py-1.5">
                {data.totpSecret}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[12.5px] font-semibold text-slate-700 mb-2">2. Backup codes (each usable once)</p>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[12.5px]">
            {data.backupCodes.map((c) => (
              <span key={c} className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800">{c}</span>
            ))}
          </div>
        </div>

        <Link href="/admin/login"
          className="block w-full py-2.5 rounded-lg bg-slate-900 text-white text-[13.5px] font-bold text-center hover:bg-slate-800 transition-colors">
          Go to sign-in
        </Link>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Setup is now closed — this page cannot create another administrator. You can remove
          <code className="font-mono"> ADMIN_BOOTSTRAP_TOKEN</code> from the server; it has no further use.
        </p>
      </div>
    </main>
  );
}
