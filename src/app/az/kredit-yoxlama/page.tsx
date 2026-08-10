"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, XCircle, Info, ArrowRight, Building2, Landmark, Gauge as GaugeIcon } from "lucide-react";
import { track } from "@vercel/analytics";
import { formatNumber, formatPercent } from "@/lib/utils";
import { SliderRow } from "@/components/ui/SliderRow";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, inputClasses } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { ScoreDial } from "@/components/score/ScoreDial";
import { BgnBar } from "@/components/score/BgnBar";
import {
  type Mode, type GelirNovu, type KreditNovu, type IsStaji,
  type BankForm, type BoktForm,
  FORM_RANGES, clampToRange,
} from "@/lib/scoring-types";
import type { PublicScoreResult } from "@/lib/score-contract";
import { toneStyle } from "@/lib/tone";
import { useDebouncedCallback, useLatestRequest } from "@/lib/useDebouncedCallback";

const azn = (v: number) => `${formatNumber(v)} ₼`;

/* Расшифровка БОКТ по клику. Настоящая <button>, а не span с role: так
   работает клавиатура, фокус и озвучивание без ручной эмуляции. */
function BoktTooltip() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label="BOKT nədir?"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="grid h-[18px] w-[18px] place-items-center rounded-full bg-gray-200 text-[11px] font-bold text-gray-700 transition-colors hover:bg-gray-300"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-max max-w-[230px] -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-center text-xs font-medium leading-snug text-white"
        >
          Banka olmayan kredit təşkilatı
        </span>
      )}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  // Sentence case, а не КАПС вразрядку: капс читается как рекламная плашка
  // и медленнее распознаётся, особенно в азербайджанском с ə/ğ/ş.
  return <h2 className="mb-3 text-sm font-bold text-ink">{children}</h2>;
}

/* ─── Main ─── */
function KreditYoxlamaContent() {
  const searchParams = useSearchParams();
  const initNov = (searchParams.get("nov") as KreditNovu) || "naqd";
  const initMebleq = searchParams.get("mebleq") || (initNov === "naqd" ? "200" : "500");
  const initMuddet = searchParams.get("muddet") || "24";
  const initFaiz = searchParams.get("faiz") || "24";

  const [mode, setMode] = useState<Mode>("bank");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [bank, setBank] = useState<BankForm>({
    kreditNovu: initNov,
    mebleg: initMebleq,
    muddət: initMuddet,
    faiz: initFaiz,
    gelirNovu: "resmi",
    gelir: "",
    isStaji: "12_plus",
    yas: "30",
    movcudNaqdOdenis: "0",
    movcudKartLimit: "0",
    cariGecikmeGun: "0",
    maks12ay: "0",
  });

  const [bokt, setBokt] = useState<BoktForm>({ mebleg: "", gelir: "", kreditTarixce: "yox" });

  const { next: nextRequest, isLatest } = useLatestRequest();

  /* Расчёт живёт на сервере: форма уходит в /api/score, обратно приходит только
     то, что можно показать. Пороги, веса и таблицы ставок в браузер не попадают. */
  const runScoring = useCallback(async () => {
    const reqId = nextRequest();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input: mode === "bank" ? bank : bokt }),
      });
      if (!isLatest(reqId)) return; // ответ на устаревший запрос — игнорируем
      if (!res.ok) {
        setError(
          res.status === 429
            ? "Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd edin."
            : "Hesablama alınmadı. Bir az sonra yenidən cəhd edin.",
        );
        setResult(null);
        return;
      }
      const data: PublicScoreResult = await res.json();
      if (!isLatest(reqId)) return;
      setResult(data);
      track("scoring_calculated", {
        mode,
        kreditNovu: mode === "bank" ? bank.kreditNovu : "bokt",
        gelirNovu: mode === "bank" ? bank.gelirNovu : "-",
        scoreBucket: data.score >= 80 ? "80+" : data.score >= 65 ? "65-79" : data.score >= 45 ? "45-64" : "<45",
        hasStops: data.stops.length ? "yes" : "no",
      });
    } catch {
      if (!isLatest(reqId)) return;
      setError("Şəbəkə xətası. İnternet bağlantınızı yoxlayın.");
      setResult(null);
    } finally {
      if (isLatest(reqId)) setLoading(false);
    }
  }, [mode, bank, bokt, nextRequest, isLatest]);

  // Дебаунс гасит двойные нажатия и быстрые повторные отправки
  const debouncedScoring = useDebouncedCallback(() => { void runScoring(); }, 300);

  function handleSubmit() {
    setSubmitted(true);
    debouncedScoring();
    /* На узком экране результат лежит ПОД длинной формой, и без этого
       пользователь оставался смотреть на форму, не понимая, посчиталось ли
       что-нибудь. Прокрутка идёт всегда, потому что причина не косметическая:
       иначе результата просто не видно. */
    requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        resultRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    });
  }

  function switchMode(next: Mode) {
    if (next === "bokt") setBokt((n) => ({ ...n, mebleg: bank.mebleg, gelir: bank.gelir }));
    setMode(next);
    setSubmitted(false);
    setResult(null);
    setError(null);
  }

  const blocked = Boolean(result?.blocked);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-4xl">
            Kredit şansınızı yoxlayın
          </h1>
          <p className="mt-2 max-w-xl text-base text-gray-600">
            Banka müraciət etməzdən əvvəl nəticənizi öyrənin. Sorğusuz və pulsuz, kredit tarixçənizə təsir etmir.
          </p>

          {/* Кнопка «что такое BOKT» стоит РЯДОМ с переключателем, а не внутри
              него: в role=tablist допустимы только сами вкладки, иначе
              скринридер считает её третьей вкладкой и объявляет «3 из 3». */}
          <div className="mt-6 flex items-center gap-2">
            <div
              role="tablist"
              aria-label="Kredit təşkilatının növü"
              className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1"
            >
              <button
                role="tab"
                aria-selected={mode === "bank"}
                onClick={() => switchMode("bank")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  mode === "bank" ? "bg-white text-brand-700 shadow-card" : "text-gray-600 hover:text-ink"
                }`}
              >
                <Landmark size={16} /> Bank
              </button>
              <button
                role="tab"
                aria-selected={mode === "bokt"}
                onClick={() => switchMode("bokt")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  mode === "bokt" ? "bg-white text-brand-700 shadow-card" : "text-gray-600 hover:text-ink"
                }`}
              >
                <Building2 size={16} /> BOKT
              </button>
            </div>
            <BoktTooltip />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-5">
        {/* ── FORM ── */}
        <div className="lg:col-span-3">
          <Card className="space-y-6">
            {mode === "bank" ? (
              <>
                <section>
                  <SectionHeading>Kredit parametrləri</SectionHeading>
                  <div className="space-y-4">
                    <Field
                      label="Kredit növü"
                      htmlFor="kredit-novu"
                      hint={bank.gelirNovu === "qeyri_resmi" ? "İpoteka və avtokredit rəsmi gəlir tələb edir" : undefined}
                    >
                      <select
                        id="kredit-novu"
                        value={bank.kreditNovu}
                        onChange={(e) =>
                          setBank((b) => {
                            const nov = e.target.value as KreditNovu;
                            // Диапазоны зависят от типа кредита: поджимаем сумму и срок
                            const m = FORM_RANGES.mebleg(nov);
                            const d = FORM_RANGES.muddet(nov);
                            return {
                              ...b,
                              kreditNovu: nov,
                              mebleg: String(clampToRange(parseFloat(b.mebleg) || m.min, m.min, m.max)),
                              muddət: String(clampToRange(parseInt(b.muddət) || d.min, d.min, d.max)),
                            };
                          })
                        }
                        className={inputClasses()}
                      >
                        <option value="naqd">Nağd kredit</option>
                        <option value="kart">Kredit kartı</option>
                        <option value="ipoteka" disabled={bank.gelirNovu === "qeyri_resmi"}>
                          İpoteka{bank.gelirNovu === "qeyri_resmi" ? " (rəsmi gəlir tələb olunur)" : ""}
                        </option>
                        <option value="avto" disabled={bank.gelirNovu === "qeyri_resmi"}>
                          Avtomobil krediti{bank.gelirNovu === "qeyri_resmi" ? " (rəsmi gəlir tələb olunur)" : ""}
                        </option>
                      </select>
                    </Field>

                    <SliderRow
                      label="Tələb olunan məbləğ"
                      value={parseFloat(bank.mebleg) || FORM_RANGES.mebleg(bank.kreditNovu).min}
                      min={FORM_RANGES.mebleg(bank.kreditNovu).min}
                      max={FORM_RANGES.mebleg(bank.kreditNovu).max}
                      step={1}
                      format={(v) => azn(v)}
                      unit="₼"
                      onChange={(v) => setBank((b) => ({ ...b, mebleg: String(v) }))}
                    />

                    <SliderRow
                      label="Kredit müddəti"
                      value={parseInt(bank.muddət) || 24}
                      min={FORM_RANGES.muddet(bank.kreditNovu).min}
                      max={FORM_RANGES.muddet(bank.kreditNovu).max}
                      step={1}
                      format={(v) => `${v} ay`}
                      unit="ay"
                      onChange={(v) => setBank((b) => ({ ...b, muddət: String(v) }))}
                    />

                    {bank.kreditNovu !== "naqd" && (
                      <SliderRow
                        label="İllik faiz dərəcəsi"
                        value={parseFloat(bank.faiz) || 24}
                        min={FORM_RANGES.faiz.min}
                        max={FORM_RANGES.faiz.max}
                        step={0.5}
                        format={(v) => formatPercent(v)}
                        unit="%"
                        onChange={(v) => setBank((b) => ({ ...b, faiz: String(v) }))}
                      />
                    )}
                  </div>
                </section>

                <section className="border-t border-gray-200 pt-5">
                  <SectionHeading>Gəlir məlumatları</SectionHeading>
                  <div className="space-y-4">
                    <Field label="Gəlir növü" htmlFor="gelir-novu">
                      <select
                        id="gelir-novu"
                        value={bank.gelirNovu}
                        onChange={(e) => {
                          const nov = e.target.value as GelirNovu;
                          setBank((b) => ({
                            ...b,
                            gelirNovu: nov,
                            // Для неофициального дохода ипотека и авто недоступны
                            kreditNovu:
                              nov === "qeyri_resmi" && (b.kreditNovu === "ipoteka" || b.kreditNovu === "avto")
                                ? "naqd"
                                : b.kreditNovu,
                          }));
                        }}
                        className={inputClasses()}
                      >
                        <option value="resmi">Rəsmi gəlir</option>
                        <option value="qeyri_resmi">Qeyri-rəsmi gəlir</option>
                        <option value="teqaud">Təqaüd</option>
                        <option value="fs">VÖEN / Fərdi sahibkar</option>
                        <option value="xarici">Xaricdə qazanc</option>
                      </select>
                    </Field>

                    <Field label="Aylıq gəlir (net)" htmlFor="gelir" hint="Vergi çıxıldıqdan sonra, manatla">
                      <input
                        id="gelir"
                        type="number"
                        inputMode="numeric"
                        placeholder="1000"
                        min={0}
                        value={bank.gelir}
                        onChange={(e) => setBank((b) => ({ ...b, gelir: e.target.value }))}
                        className={inputClasses()}
                      />
                    </Field>

                    {/* Стаж не применяется к пенсии и неофициальному доходу */}
                    {bank.gelirNovu !== "teqaud" && bank.gelirNovu !== "qeyri_resmi" && (
                      <Field
                        label="Cari iş yerində staj"
                        htmlFor="staj"
                        hint={
                          bank.gelirNovu === "resmi"
                            ? "Rəsmi gəlir üçün minimum 6 ay tələb olunur"
                            : "Minimum 12 ay tələb olunur"
                        }
                      >
                        <select
                          id="staj"
                          value={bank.isStaji}
                          onChange={(e) => setBank((b) => ({ ...b, isStaji: e.target.value as IsStaji }))}
                          className={inputClasses()}
                        >
                          <option value="0_2">0 - 2 ay</option>
                          <option value="3_5">3 - 5 ay</option>
                          <option value="6_11">6 - 11 ay</option>
                          <option value="12_plus">12 ay və daha çox</option>
                        </select>
                      </Field>
                    )}
                  </div>
                </section>

                <section className="border-t border-gray-200 pt-5">
                  <SectionHeading>Şəxsi məlumatlar</SectionHeading>
                  <SliderRow
                    label="Yaş"
                    value={parseInt(bank.yas) || 30}
                    min={FORM_RANGES.yas.min}
                    max={FORM_RANGES.yas.max}
                    step={1}
                    format={(v) => `${v} yaş`}
                    unit="yaş"
                    onChange={(v) => setBank((b) => ({ ...b, yas: String(v) }))}
                  />
                </section>

                <section className="border-t border-gray-200 pt-5">
                  <SectionHeading>Mövcud öhdəliklər</SectionHeading>
                  <div className="space-y-4">
                    <Field
                      label="Mövcud aylıq nağd kredit ödənişi"
                      htmlFor="movcud-odenis"
                      hint="Aktiv kreditlər üzrə cəmi aylıq ödəniş. Yoxdursa 0 yazın."
                    >
                      <input
                        id="movcud-odenis"
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        min={0}
                        value={bank.movcudNaqdOdenis}
                        onChange={(e) => setBank((b) => ({ ...b, movcudNaqdOdenis: e.target.value }))}
                        className={inputClasses()}
                      />
                    </Field>

                    <Field
                      label="Mövcud kredit kartı limiti"
                      htmlFor="kart-limit"
                      hint="Bütün aktiv kredit kartlarının ümumi limiti. Yoxdursa 0 yazın."
                    >
                      <input
                        id="kart-limit"
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        min={0}
                        value={bank.movcudKartLimit}
                        onChange={(e) => setBank((b) => ({ ...b, movcudKartLimit: e.target.value }))}
                        className={inputClasses()}
                      />
                    </Field>
                  </div>
                </section>

                <section className="border-t border-gray-200 pt-5">
                  <SectionHeading>Kredit tarixçəsi</SectionHeading>
                  <div className="space-y-4">
                    <Field
                      label="Cari (aktiv) gecikmə"
                      htmlFor="cari-gecikme"
                      hint="Gün sayı. Hazırda gecikmiş ödənişiniz yoxdursa 0 yazın. Bir neçə krediti gecikdirmisinizsə, ən böyük gecikməni qeyd edin."
                    >
                      <input
                        id="cari-gecikme"
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        min={0}
                        value={bank.cariGecikmeGun}
                        onChange={(e) => setBank((b) => ({ ...b, cariGecikmeGun: e.target.value }))}
                        className={inputClasses()}
                      />
                    </Field>

                    <Field
                      label="Son 12 ayda maksimum gecikmə"
                      htmlFor="maks-gecikme"
                      hint="Gün sayı. Son 12 ayda ən uzun tək gecikmə. Yoxdursa 0 yazın."
                    >
                      <input
                        id="maks-gecikme"
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        min={0}
                        value={bank.maks12ay}
                        onChange={(e) => setBank((b) => ({ ...b, maks12ay: e.target.value }))}
                        className={inputClasses()}
                      />
                    </Field>
                  </div>
                </section>
              </>
            ) : (
              <>
                <SliderRow
                  label="Tələb olunan məbləğ"
                  value={parseFloat(bokt.mebleg) || 100}
                  min={50}
                  max={1000}
                  step={1}
                  format={(v) => azn(v)}
                  unit="₼"
                  onChange={(v) => setBokt((n) => ({ ...n, mebleg: String(v) }))}
                />

                <SliderRow
                  label="Aylıq gəlir"
                  value={parseFloat(bokt.gelir) || 300}
                  min={100}
                  max={5000}
                  step={50}
                  format={(v) => azn(v)}
                  unit="₼"
                  onChange={(v) => setBokt((n) => ({ ...n, gelir: String(v) }))}
                />

                <Field label="Kredit tarixçəsi" htmlFor="bokt-tarixce">
                  <select
                    id="bokt-tarixce"
                    value={bokt.kreditTarixce}
                    onChange={(e) => setBokt((n) => ({ ...n, kreditTarixce: e.target.value as "yox" | "gecikme" }))}
                    className={inputClasses()}
                  >
                    <option value="yox">Gecikmə yoxdur</option>
                    <option value="gecikme">Gecikmələr var</option>
                  </select>
                </Field>

                {parseFloat(bokt.mebleg) > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-bold text-amber-900">Maksimum ödəniləcək məbləğ</p>
                    <p className="mt-1 text-2xl font-extrabold tabular-nums text-amber-900">
                      {azn(parseFloat(bokt.mebleg) * 2)}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-amber-800">
                      Mərkəzi Bank qaydası: ümumi borcun artımı əsas borcun 100%-ni keçə bilməz. Yəni{" "}
                      {azn(parseFloat(bokt.mebleg))} götürsəniz, geri qaytaracağınız məbləğ bundan çox ola bilməz.
                    </p>
                  </div>
                )}
              </>
            )}

            <Button onClick={handleSubmit} loading={loading} size="lg" block className="mt-2">
              Hesabla
            </Button>
          </Card>
        </div>

        {/* ── RESULT ── */}
        <div ref={resultRef} className="space-y-4 lg:col-span-2">
          <div className="lg:sticky lg:top-20 lg:space-y-4">
            <Card>
              <CardTitle className="mb-4">Nəticə</CardTitle>

              {!submitted ? (
                /* Пустое состояние называет следующее действие, а не просто
                   сообщает, что данных нет. */
                <div className="flex flex-col items-center py-8 text-center">
                  <GaugeIcon size={28} className="mb-3 text-gray-300" aria-hidden />
                  <p className="text-sm font-medium text-gray-600">
                    Formanı doldurun və &laquo;Hesabla&raquo; düyməsinə basın.
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Nəticə dərhal burada görünəcək.</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <AlertTriangle size={24} className="mb-3 text-rose-500" aria-hidden />
                  <p className="mb-4 text-sm font-medium text-gray-700">{error}</p>
                  <Button variant="secondary" size="sm" onClick={() => void runScoring()} loading={loading}>
                    Yenidən cəhd et
                  </Button>
                </div>
              ) : !result ? (
                <div className="flex flex-col items-center py-10 text-center" role="status" aria-live="polite">
                  <span className="nv-spin mb-3 block h-6 w-6 rounded-full border-2 border-gray-200 border-t-brand-600" />
                  <p className="text-sm font-medium text-gray-600">Hesablanır...</p>
                </div>
              ) : blocked ? (
                /* Хард-стоп: балл НЕ показываем. Раньше рисовался ноль на шкале,
                   хотя ноль — не настоящий результат, а признак блокировки, и
                   выглядел он как «у вас ноль баллов». Ведёт причина отказа. */
                <div className="space-y-3">
                  <Badge tone="high" icon={<XCircle size={13} />}>
                    Hazırkı şərtlərlə mümkün deyil
                  </Badge>
                  {result.stops.map((s, i) => (
                    <p key={i} className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">
                      {s}
                    </p>
                  ))}
                  <p className="text-xs leading-relaxed text-gray-600">
                    Banklar bu parametrlərlə kredit verə bilməz. Şərtləri dəyişib yenidən yoxlaya bilərsiniz.
                  </p>
                  {mode === "bank" && (
                    <Button variant="secondary" block onClick={() => switchMode("bokt")} icon={<Building2 size={15} />}>
                      BOKT şərtləri ilə yoxla
                    </Button>
                  )}
                </div>
              ) : (
                <div className="nv-reveal nv-in">
                  <ScoreDial score={result.score} tone={result.label?.tone ?? "na"} />

                  {result.label && (
                    <div className="mt-4 text-center">
                      <p className={`text-lg font-bold ${toneStyle(result.label.tone).text}`}>
                        {result.label.text}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{result.label.detail}</p>
                    </div>
                  )}

                  {result.warnings.length > 0 && (
                    <ul className="mt-5 space-y-2 border-t border-gray-200 pt-4">
                      {result.warnings.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-amber-900">
                          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
                          {w}
                        </li>
                      ))}
                      {mode === "bank" && result.extraWarningCount > 0 && result.calculationId && (
                        <li>
                          <a
                            href={`/az/kredit-yoxlama/analiz?id=${result.calculationId}`}
                            className="text-xs font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
                          >
                            Daha {result.extraWarningCount} qeyd ətraflı analizdə
                          </a>
                        </li>
                      )}
                    </ul>
                  )}

                  {mode === "bank" && result.bgn != null && (
                    <div className="mt-5 border-t border-gray-200 pt-4">
                      <BgnBar bgn={result.bgn} limit={result.bgnLimit} tone={result.bgnTone} />

                      {result.yeniOdenis > 0 && (
                        <dl className="mt-4 space-y-2 text-sm">
                          <div className="flex items-baseline justify-between gap-3">
                            <dt className="text-gray-600">Yeni aylıq ödəniş</dt>
                            <dd className="font-bold tabular-nums text-ink">{azn(result.yeniOdenis)}</dd>
                          </div>
                          <div className="flex items-baseline justify-between gap-3">
                            <dt className="text-gray-600">
                              {result.estimatedRate != null ? "Təxmini illik faiz" : "İllik faiz"}
                            </dt>
                            <dd className="font-semibold tabular-nums text-gray-700">
                              {formatPercent(result.estimatedRate ?? result.manualRate ?? 0)}
                            </dd>
                          </div>
                          {result.commission && (
                            <div className="flex items-baseline justify-between gap-3">
                              <dt className="text-gray-600">
                                Birdəfəlik komissiya
                                <span className="block text-xs text-gray-500">
                                  {formatPercent(result.commission.pct)}, aylıq ödənişə daxil deyil
                                </span>
                              </dt>
                              <dd className="font-semibold tabular-nums text-gray-700">
                                {azn(result.commission.amount)}
                              </dd>
                            </div>
                          )}
                        </dl>
                      )}

                      {result.estimatedRate != null && (
                        <p className="mt-3 text-xs leading-relaxed text-gray-500">
                          Faizi Navio hesablayır. Bu ilkin hesablamadır, ictimai təklif deyil. Bank faizi fərdi təyin edir.
                        </p>
                      )}
                    </div>
                  )}

                  {mode === "bank" && result.topRecommendation && (
                    <div className="mt-5 border-t border-gray-200 pt-4">
                      <h3 className="mb-2 text-sm font-bold text-ink">Əsas tövsiyə</h3>
                      <p className="text-sm font-semibold text-ink">{result.topRecommendation.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600">{result.topRecommendation.text}</p>
                    </div>
                  )}

                  {mode === "bank" && result.calculationId && (
                    <LinkButton
                      href={`/az/kredit-yoxlama/analiz?id=${result.calculationId}`}
                      block
                      className="mt-5"
                      icon={<ArrowRight size={15} />}
                    >
                      Ətraflı analiz
                    </LinkButton>
                  )}
                </div>
              )}
            </Card>

            <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-gray-600">
              <Info size={14} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
              Bu nəticə ilkin qiymətləndirmədir. Yekun qərarı bank və ya BOKT verir. Navio kredit vermir.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function KreditYoxlamaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <KreditYoxlamaContent />
    </Suspense>
  );
}
