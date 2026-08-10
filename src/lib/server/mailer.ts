import "server-only";
import { Resend } from "resend";

/* Почта включается только когда есть RESEND_API_KEY. Пока ключа нет, письма
   не отправляются вообще, и UI не обещает того, чего не будет: скрывается
   восстановление пароля, при регистрации не пишем «мы отправили письмо».
   В dev письмо пишется в лог, чтобы можно было пройти сценарий по ссылке. */
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "Navio <onboarding@resend.dev>";

export const emailEnabled = Boolean(apiKey);

const resend = apiKey ? new Resend(apiKey) : null;

async function send(to: string, subject: string, html: string, text: string) {
  if (!resend) {
    console.warn(`[mailer] RESEND_API_KEY yoxdur — məktub göndərilmədi. to=${to} subject=${subject}`);
    console.warn(`[mailer] ${text}`);
    return;
  }
  const { error } = await resend.emails.send({ from, to, subject, html, text });
  if (error) {
    console.error("[mailer] göndərmə xətası:", error);
    throw new Error(`E-poçt göndərilə bilmədi: ${error.message}`);
  }
}

/* ─── Общий шаблон: простой, без внешних ресурсов (почтовые клиенты режут CSS) ─── */
function layout(heading: string, body: string, cta: { label: string; url: string }) {
  return `<!doctype html>
<html lang="az"><body style="margin:0;background:#F4F6FB;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FB;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #E3E8F1;border-radius:16px;padding:32px;">
        <tr><td style="font-size:20px;font-weight:bold;color:#0A1F44;padding-bottom:8px;">Navio</td></tr>
        <tr><td style="font-size:13px;color:#5B6577;padding-bottom:24px;">Sizin maliyyə köməkçiniz</td></tr>
        <tr><td style="font-size:18px;font-weight:bold;color:#0A1F44;padding-bottom:12px;">${heading}</td></tr>
        <tr><td style="font-size:14px;line-height:1.6;color:#5B6577;padding-bottom:24px;">${body}</td></tr>
        <tr><td>
          <a href="${cta.url}" style="display:inline-block;background:#2447F0;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:14px 28px;border-radius:10px;">${cta.label}</a>
        </td></tr>
        <tr><td style="font-size:12px;color:#5B6577;padding-top:24px;line-height:1.6;">
          Düymə işləmirsə, bu linki brauzerə köçürün:<br>
          <span style="color:#2447F0;word-break:break-all;">${cta.url}</span>
        </td></tr>
        <tr><td style="font-size:11px;color:#98A2B3;padding-top:24px;border-top:1px solid #E3E8F1;line-height:1.6;">
          Bu məktubu siz gözləmirdinizsə, sadəcə nəzərə almayın.<br>
          Navio bank deyil və heç bir kredit vermir.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendVerificationEmail(to: string, url: string) {
  await send(
    to,
    "Navio — e-poçt ünvanınızı təsdiqləyin",
    layout(
      "E-poçt ünvanınızı təsdiqləyin",
      "Hesabınızı tam aktivləşdirmək və hesablamalarınızı yadda saxlamaq üçün e-poçt ünvanınızı təsdiqləyin.",
      { label: "E-poçtu təsdiqlə", url },
    ),
    `E-poçt ünvanınızı təsdiqləmək üçün keçidə daxil olun: ${url}`,
  );
}

export async function sendResetPasswordEmail(to: string, url: string) {
  await send(
    to,
    "Navio — şifrənin bərpası",
    layout(
      "Şifrənizi bərpa edin",
      "Şifrənizi dəyişmək üçün aşağıdakı düyməyə klikləyin. Keçid 1 saat ərzində etibarlıdır.",
      { label: "Şifrəni dəyiş", url },
    ),
    `Şifrənizi bərpa etmək üçün keçidə daxil olun: ${url}`,
  );
}
