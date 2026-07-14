"use client";

/* Детальный анализ результата kredit yoxlaması.
   Данные берутся из sessionStorage (сохраняются при нажатии Hesabla).
   TODO: когда появится регистрация — открывать эту страницу только авторизованным. */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight, ArrowRight, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle2,
  Scale, History, BadgeCheck, Package, Lock, Lightbulb, XCircle,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { type BankForm, calcBankScore, CONFIG } from "@/lib/scoring";

const NAVY = "#0A1F44";
const BLUE = "#2447F0";
const MINT = "#0BB07B";
const MUTED = "#5B6577";
const LINE = "#E3E8F1";
const WASH = "#F4F6FB";

function scoreTier(score: number) {
  if (score >= 80) return { name: "Yüksək şans", color: "#16a34a", soft: "#dcfce7" };
  if (score >= 65) return { name: "Yaxşı şans", color: "#0BB07B", soft: "#E7F7F1" };
  if (score >= 45) return { name: "Orta şans", color: "#ca8a04", soft: "#fef9c3" };
  return { name: "Aşağı şans", color: "#ea580c", soft: "#ffedd5" };
}

/* Сработавшие капы: восстанавливаем причины из входов (та же логика порогов, что в scoring.ts) */
function activeCaps(f: BankForm, bgn: number) {
  const mebleg = Math.max(0, parseFloat(f.mebleg) || 0);
  const muddet = Math.max(0, parseInt(f.muddət) || 0);
  const cari = Math.max(0, parseInt(f.cariGecikmeGun) || 0);
  const kum = Math.max(0, parseInt(f.kumulyativ6ay) || 0);
  const maks = Math.max(0, parseInt(f.maks12ay) || 0);
  const unofficial = f.gelirNovu === "qeyri_resmi";
  const caps: { cap: number; reason: string; advice: string }[] = [];

  if (bgn > CONFIG.bgnTierMidPct && bgn <= CONFIG.bgnTierHighPct)
    caps.push({ cap: 79, reason: `Borc yükü (BGN) ${bgn.toFixed(1)}% — 45–60% aralığındadır`, advice: "Mövcud kredit ödənişlərini azaldın və ya daha kiçik məbləğ seçin — BGN 45%-dən aşağı düşəndə bu məhdudiyyət aradan qalxır." });
  else if (bgn > CONFIG.bgnTierHighPct && bgn <= CONFIG.bgnHardStopPct)
    caps.push({ cap: 59, reason: `Borc yükü (BGN) ${bgn.toFixed(1)}% — 60–70% aralığındadır`, advice: "Borc yükünüz kritik həddə yaxındır. Mövcud borcları bağlamadan yüksək nəticə mümkün deyil." });

  if (cari >= 1 && cari <= 5)
    caps.push({ cap: 70, reason: `Aktiv gecikmə ${cari} gün`, advice: "Gecikməni bağlayın — aktiv gecikmə bağlanan kimi bu məhdudiyyət götürülür." });
  else if (cari >= 6 && cari <= 15)
    caps.push({ cap: 50, reason: `Aktiv gecikmə ${cari} gün`, advice: "Hətta qısa aktiv gecikmə bir çox bank üçün ciddi siqnaldır. Onu bağlamaq nəticəni əhəmiyyətli yaxşılaşdırar." });
  else if (cari > 15)
    caps.push({ cap: 44, reason: `Aktiv gecikmə ${cari} gün (15 gündən çox)`, advice: "Uzunmüddətli aktiv gecikmə ən güclü mənfi amildir. İlk addım — onu tam bağlamaq." });

  if (kum >= 90)
    caps.push({ cap: 69, reason: `Son 6 ayda kumulyativ gecikmə ${kum} gün`, advice: "Növbəti aylarda bütün ödənişləri vaxtında edin — 6 aylıq pəncərə təmizləndikcə nəticə yaxşılaşır." });
  if (maks >= 120)
    caps.push({ cap: 69, reason: `Son 12 ayda maksimum gecikmə ${maks} gün`, advice: "Böyük tək gecikmə 12 ay ərzində nəticəni məhdudlaşdırır. Vaxt keçdikcə təsiri azalır." });

  if (unofficial)
    caps.push({
      cap: mebleg <= 1000 && muddet <= 36 ? 79 : 59,
      reason: "Qeyri-rəsmi gəlir — etibar limiti",
      advice: "Rəsmi gəlir mənbəyi (əmək müqaviləsi və ya VÖEN) bu məhdudiyyəti tam aradan qaldırır və ən böyük tək təsirli addımdır.",
    });
  else if (mebleg > CONFIG.amountCap59Above)
    caps.push({ cap: 59, reason: `Tələb olunan məbləğ ${formatNumber(mebleg)} ₼ (40 000 ₼-dən çox)`, advice: "Bu həcmdə girovsuz nağd kredit praktikada çox az verilir. Məbləği bölmək və ya girovlu məhsul düşünmək olar." });
  else if (mebleg > CONFIG.amountCap79Above)
    caps.push({ cap: 79, reason: `Tələb olunan məbləğ ${formatNumber(mebleg)} ₼ (30 000 ₼-dən çox)`, advice: "Məbləği 30 000 ₼-dən aşağı salmaq təsdiq şansını nəzərəçarpacaq artırır." });

  return caps.sort((a, b) => a.cap - b.cap);
}

/* Потенциал улучшения по блокам: потерянные баллы + конкретный совет */
function blockAdvice(f: BankForm, blocks: { label: string; score: number; max: number }[], bgn: number) {
  const out: { icon: React.ReactNode; label: string; got: number; max: number; text: string }[] = [];
  const icons: Record<string, React.ReactNode> = {
    "Borc yükü (BGN)": <Scale size={18} />,
    "Kredit tarixçəsi": <History size={18} />,
    "Gəlirin etibarlılığı": <BadgeCheck size={18} />,
    "Əlçatanlıq (məbləğ + müddət)": <Package size={18} />,
  };
  const cari = Math.max(0, parseInt(f.cariGecikmeGun) || 0);
  const kum = Math.max(0, parseInt(f.kumulyativ6ay) || 0);
  const mebleg = Math.max(0, parseFloat(f.mebleg) || 0);
  const muddet = Math.max(0, parseInt(f.muddət) || 0);

  for (const b of blocks) {
    const lost = b.max - b.score;
    let text = "Bu amil üzrə maksimum bal toplamısınız — belə də saxlayın.";
    if (lost > 0) {
      switch (b.label) {
        case "Borc yükü (BGN)":
          text = `BGN hazırda ${bgn.toFixed(1)}%-dir. 45%-dən aşağı BGN bu blokdan tam ${b.max} bal verir. Mövcud aylıq ödənişləri azaldın, kart limitlərini bağlayın və ya daha kiçik məbləğ seçin.`;
          break;
        case "Kredit tarixçəsi":
          text = [
            f.baglanmisTecrube !== "var" && "Uğurla bağlanmış kredit təcrübəsi ən çox bal verir — kiçik krediti vaxtında bağlamaq tarixçəni gücləndirir.",
            cari > 0 && `Aktiv gecikmə (${cari} gün) bu blokdan bal aparır — onu bağlamaq dərhal təsir edir.`,
            kum > 0 && "Son 6 ayı təmiz saxlamaq blokun qalan hissəsini bərpa edir.",
          ].filter(Boolean).join(" ") || "Ödənişləri vaxtında etməyə davam edin.";
          break;
        case "Gəlirin etibarlılığı":
          text = f.gelirNovu === "qeyri_resmi"
            ? "Qeyri-rəsmi gəlir bu blokdan minimal bal verir. Rəsmiləşdirmə (əmək müqaviləsi / VÖEN) ən təsirli addımdır."
            : f.gelirNovu === "teqaud"
            ? "Təqaüd gəliri üçün bal sabitdir — bu blokda dəyişiklik mümkün deyil."
            : "İş stajı tələb olunan həddə çatanda (rəsmi: 6 ay, digər: 12 ay) bu blok tam bal verir.";
          break;
        case "Əlçatanlıq (məbləğ + müddət)":
          text = `${mebleg > 10000 ? `Məbləğ ${formatNumber(mebleg)} ₼ — kiçik məbləğlər daha yüksək bal alır. ` : ""}${muddet > 36 ? `Müddət ${muddet} ay — 36 aya qədər müddət maksimum bal verir.` : ""}`.trim() || "Parametrlər optimala yaxındır.";
          break;
      }
    }
    out.push({ icon: icons[b.label], label: b.label, got: b.score, max: b.max, text });
  }
  return out;
}

export default function AnalizPage() {
  const [input, setInput] = useState<BankForm | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("navio_scoring_input");
      if (raw) setInput(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  if (!loaded) return <main className="min-h-screen" style={{ background: WASH }} />;

  /* Нет данных расчёта — ведём пройти проверку */
  if (!input) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: WASH }}>
        <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center" style={{ border: `1px solid ${LINE}` }}>
          <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4" style={{ background: "#EBEFFE", color: BLUE }}>
            <Lock size={24} />
          </div>
          <h1 className="text-[18px] font-bold mb-2" style={{ color: NAVY }}>Əvvəlcə yoxlamadan keçin</h1>
          <p className="text-[14px] mb-5" style={{ color: MUTED }}>
            Ətraflı analiz üçün əvvəlcə kredit şansınızı hesablayın — nəticə buraya avtomatik ötürülür.
          </p>
          <Link href="/az/kredit-yoxlama"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] font-semibold text-white text-sm"
            style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.28)" }}>
            Kredit yoxlamasına keç <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    );
  }

  const r = calcBankScore(input);
  const tier = scoreTier(r.score);
  const caps = r.blocks ? activeCaps(input, r.bgn) : [];
  const rawScore = r.blocks ? r.blocks.reduce((s, b) => s + b.score, 0) : 0;
  const capApplied = r.blocks && r.score < rawScore;
  const advice = r.blocks ? blockAdvice(input, r.blocks, r.bgn) : [];

  return (
    <main className="min-h-screen" style={{ background: WASH }}>
      <div className="max-w-[880px] mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb + back */}
        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: MUTED }}>
          <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
          <ChevronRight size={14} />
          <Link href="/az/kredit-yoxlama" className="hover:text-blue-600">Kredit yoxlaması</Link>
          <ChevronRight size={14} />
          <span style={{ color: NAVY }}>Ətraflı analiz</span>
        </div>

        <h1 className="font-extrabold mb-2" style={{ color: NAVY, fontSize: "clamp(26px,3.6vw,34px)", letterSpacing: "-.02em" }}>
          Nəticənizin ətraflı analizi
        </h1>
        <p className="text-[15px] mb-8" style={{ color: MUTED }}>
          Balınızın necə formalaşdığını görün və onu artırmaq üçün konkret addımları öyrənin.
        </p>

        {/* ── Итог ── */}
        <div className="rounded-2xl bg-white p-6 mb-5" style={{ border: `1px solid ${LINE}` }}>
          {r.stops.length > 0 ? (
            <div className="flex items-start gap-3">
              <span className="w-11 h-11 rounded-xl grid place-items-center shrink-0" style={{ background: "#fee2e2", color: "#dc2626" }}>
                <XCircle size={22} />
              </span>
              <div>
                <p className="text-[17px] font-bold mb-1" style={{ color: NAVY }}>Hazırda bu parametrlərlə kredit mümkün deyil</p>
                {r.stops.map((s) => (
                  <p key={s} className="text-[14px] mb-1" style={{ color: MUTED }}>• {s}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <div className="w-24 h-24 rounded-full grid place-items-center shrink-0"
                style={{ background: `conic-gradient(${tier.color} ${r.score}%, ${LINE} 0)` }}>
                <div className="w-[76px] h-[76px] rounded-full bg-white grid place-items-center">
                  <span className="text-[26px] font-extrabold" style={{ color: NAVY }}>{r.score}</span>
                </div>
              </div>
              <div className="flex-1 min-w-[220px]">
                <span className="inline-block text-[13px] font-bold px-3 py-1 rounded-full mb-2" style={{ background: tier.soft, color: tier.color }}>
                  {tier.name}
                </span>
                <p className="text-[14px]" style={{ color: MUTED }}>
                  Amillər üzrə toplanmış bal: <b style={{ color: NAVY }}>{rawScore} / 100</b>
                  {capApplied && <> · məhdudlaşdırıcı amillərlə son nəticə: <b style={{ color: NAVY }}>{r.score}</b></>}
                </p>
                {r.estimatedRate != null && (
                  <p className="text-[14px] mt-1" style={{ color: MUTED }}>
                    Təxmini illik faiz: <b style={{ color: NAVY }}>{r.estimatedRate.toFixed(1)}%</b>
                    {r.commission.amount > 0 && <> · birdəfəlik komissiya: <b style={{ color: NAVY }}>{formatNumber(r.commission.amount)} ₼</b></>}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {r.blocks && (
          <>
            {/* ── Ограничители ── */}
            {caps.length > 0 && (
              <div className="rounded-2xl bg-white p-6 mb-5" style={{ border: `1px solid ${LINE}` }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: "#FEF3E2", color: "#D97706" }}>
                    <AlertTriangle size={16} />
                  </span>
                  <h2 className="text-[16px] font-bold" style={{ color: NAVY }}>Nəticəni məhdudlaşdıran amillər</h2>
                </div>
                <div className="space-y-3">
                  {caps.map((c) => (
                    <div key={c.reason} className="rounded-xl p-4" style={{ background: "#FEF9F3", border: "1px solid #FADFA6" }}>
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <p className="text-[14px] font-semibold" style={{ color: "#8A5A00" }}>{c.reason}</p>
                        <span className="shrink-0 text-[12px] font-bold px-2 py-0.5 rounded-full bg-white" style={{ color: "#D97706", border: "1px solid #FADFA6" }}>
                          maks. {c.cap} bal
                        </span>
                      </div>
                      <p className="text-[13px] leading-relaxed" style={{ color: "#7a5a1e" }}>{c.advice}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Разбор по блокам ── */}
            <div className="rounded-2xl bg-white p-6 mb-5" style={{ border: `1px solid ${LINE}` }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: "#EBEFFE", color: BLUE }}>
                  <TrendingUp size={16} />
                </span>
                <h2 className="text-[16px] font-bold" style={{ color: NAVY }}>Balın formalaşması — amillər üzrə</h2>
              </div>
              <div className="space-y-5">
                {advice.map((a) => (
                  <div key={a.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span style={{ color: a.got === a.max ? MINT : MUTED }}>{a.icon}</span>
                        <span className="text-[14px] font-semibold" style={{ color: NAVY }}>{a.label}</span>
                      </div>
                      <span className="text-[13px] font-bold" style={{ color: a.got === a.max ? MINT : NAVY }}>
                        {a.got} / {a.max}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: WASH }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${(a.got / a.max) * 100}%`, background: a.got === a.max ? MINT : BLUE }} />
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color: MUTED }}>{a.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── План действий ── */}
            <div className="rounded-2xl p-6 mb-5 text-white relative overflow-hidden"
              style={{ background: `linear-gradient(155deg, ${NAVY} 0%, #12306B 100%)` }}>
              <div className="flex items-center gap-2 mb-4 relative">
                <span className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: "rgba(255,255,255,.12)" }}>
                  <Lightbulb size={16} />
                </span>
                <h2 className="text-[16px] font-bold">Şansı artırmaq üçün addımlar</h2>
              </div>
              <div className="space-y-2.5 relative">
                {[
                  ...caps.map((c) => c.advice),
                  "Əmək haqqınızı aldığınız banka müraciət etsəniz, şansınız adətən daha yüksək olur.",
                ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 5).map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: "#8FB0FF" }} />
                    <p className="text-[13.5px] leading-relaxed" style={{ color: "#D6DEF5" }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Навигация ── */}
        <div className="flex flex-wrap gap-3">
          <Link href="/az/kredit-yoxlama"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] font-semibold text-sm bg-white transition-colors"
            style={{ border: `1px solid ${LINE}`, color: NAVY }}>
            <ArrowLeft size={15} /> Yenidən hesabla
          </Link>
          <Link href="/az/calculators"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] font-semibold text-white text-sm"
            style={{ background: BLUE, boxShadow: "0 6px 18px rgba(36,71,240,.28)" }}>
            Ödənişi kalkulyatorda hesabla <ArrowRight size={15} />
          </Link>
        </div>

        <p className="text-[12px] mt-6" style={{ color: MUTED }}>
          Nəticələr ilkin qiymətləndirmə xarakteri daşıyır. Yekun qərarı bank verir. Navio heç bir kredit vermir.
        </p>
      </div>
    </main>
  );
}
