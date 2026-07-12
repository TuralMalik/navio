import { NextResponse } from "next/server";

/* Анонимное логирование расчётов скоринга.
   MVP: пишем в серверные логи (Vercel → Logs). Когда появится БД — заменить console.log на insert.
   Никаких персональных данных: только входы формы и результат. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[scoring]", JSON.stringify({ ts: new Date().toISOString(), ...body }));
  } catch {
    // не роняем клиент из-за логов
  }
  return NextResponse.json({ ok: true });
}
