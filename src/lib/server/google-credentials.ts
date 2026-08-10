import "server-only";

/* Проверка формы Google-кредов перед тем, как отдать их Better Auth.

   Зачем: если перепутать местами ID и secret, Better Auth подставит secret
   в client_id, и он уедет в URL авторизации ОТКРЫТЫМ ТЕКСТОМ — в историю
   браузера, в логи, на страницу ошибки Google. Пользователь при этом видит
   только «Ошибка 401: invalid_client», по которой причину не найти.
   Поэтому проверяем формат заранее и отказываемся регистрировать провайдера.

   Формат задан Google:
     client ID     → ...apps.googleusercontent.com
     client secret → GOCSPX-... */

const SECRET_PREFIX = "GOCSPX-";
const CLIENT_ID_SUFFIX = ".apps.googleusercontent.com";

export interface GoogleCredentials {
  clientId: string;
  clientSecret: string;
}

let warned = false;

function warnOnce(message: string) {
  // Один раз на инстанс: модуль читается на каждый рендер, лог не должен спамить
  if (warned) return;
  warned = true;
  console.error(`[auth] Google ilə giriş söndürüldü. ${message}`);
}

/** Креды, если они заданы и выглядят правдоподобно. Иначе null. */
export function getGoogleCredentials(): GoogleCredentials | null {
  // trim: значение, вставленное в дашборд, часто тянет за собой пробел или перевод строки
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  // Ещё не выданы — это нормальное состояние, не ошибка
  if (!clientId && !clientSecret) return null;

  if (!clientId || !clientSecret) {
    warnOnce("GOOGLE_CLIENT_ID və GOOGLE_CLIENT_SECRET-in yalnız biri təyin olunub, ikisi də lazımdır.");
    return null;
  }

  if (clientId.startsWith(SECRET_PREFIX)) {
    warnOnce(
      "GOOGLE_CLIENT_ID-ə client secret yazılıb (GOCSPX- ilə başlayır). " +
      "Dəyərləri yerlərinə düzgün yazın və HƏMİN secret-i Google Console-da yeniləyin. " +
      "O, artıq avtorizasiya URL-ində açıq şəkildə ötürülmüş ola bilər.",
    );
    return null;
  }

  if (!clientId.endsWith(CLIENT_ID_SUFFIX)) {
    warnOnce(`GOOGLE_CLIENT_ID "${CLIENT_ID_SUFFIX}" ilə bitməlidir.`);
    return null;
  }

  if (clientSecret.endsWith(CLIENT_ID_SUFFIX)) {
    warnOnce("GOOGLE_CLIENT_SECRET-ə client ID yazılıb, dəyərlər yerlərini dəyişib.");
    return null;
  }

  return { clientId, clientSecret };
}

/** Показывать ли кнопку «Google ilə davam et». Совпадает с тем, зарегистрирован ли провайдер. */
export function isGoogleConfigured(): boolean {
  return getGoogleCredentials() !== null;
}
