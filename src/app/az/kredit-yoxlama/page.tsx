"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, XCircle, Info, ArrowRight, Building2, Landmark, Check, X } from "lucide-react";
import { track } from "@vercel/analytics";
import { formatNumber, formatPercent } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { NumberField, SelectField } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Segmented } from "@/components/ui/Segmented";
import { ScoreDial } from "@/components/score/ScoreDial";
import {
  type Mode, type GelirNovu, type KreditNovu, type IsStaji,
  type BankForm, type BoktForm,
  FORM_RANGES, clampToRange,
} from "@/lib/scoring-types";
import type { PublicScoreResult } from "@/lib/score-contract";
import { toneStyle } from "@/lib/tone";
import { useDebouncedCallback, useLatestRequest } from "@/lib/useDebouncedCallback";

const azn = (v: number) => `${formatNumber(v)} ₼`;

/** Группа полей: тонкая подпись сверху, без рамки. */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-[13px] font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

/** Строка проверки: сходится или нет. Ведёт статус, а не абзац текста. */
function CheckRow({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 py-1">
      <span
        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${
          ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
        }`}
      >
        {ok ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
      </span>
      <span className={`text-[13px] leading-snug ${ok ? "text-gray-700" : "text-gray-600"}`}>{children}</span>
    </li>
  );
}

function KreditYoxlamaContent() {
  const searchParams = useSearchParams();
  const initNov = (searchParams.get("nov") as KreditNovu) || "naqd";

  // Базовая ставка кредитной линии (карты) по типу дохода: официальный 27%, неофициальный 32%.
  const cardBaseFaiz = (g: GelirNovu) => (g === "qeyri_resmi" ? "32" : "27");

  const [mode, setMode] = useState<Mode>("bank");
  const [result, setResult] = useState<PublicScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bank, setBank] = useState<BankForm>({
    kreditNovu: initNov,
    mebleg: searchParams.get("mebleq") || "5000",
    muddət: searchParams.get("muddet") || "24",
    faiz: searchParams.get("faiz") || (initNov === "kart" ? cardBaseFaiz("resmi") : "24"),
    gelirNovu: "resmi",
    gelir: "",
    isStaji: "12_plus",
    yas: "30",
    movcudNaqdOdenis: "0",
    movcudKartLimit: "0",
    cariGecikmeGun: "0",
    maks12ay: "0",
  });

  const [bokt, setBokt] = useState<BoktForm>({ mebleg: "300", gelir: "", kreditTarixce: "yox" });

  const { next: nextRequest, isLatest } = useLatestRequest();

  /* Расчёт живёт на сервере: форма уходит в /api/score, обратно приходит только
     то, что можно показать. Пороги, веса и таблицы ставок в браузер не попадают. */
  const runScoring = useCallback(async () => {
    const income = mode === "bank" ? parseFloat(bank.gelir) : parseFloat(bokt.gelir);
    // Без дохода считать нечего: сервер вернул бы стоп «введите доход», и
    // пользователь видел бы красную панель ещё до того, как что-то ввёл.
    if (!Number.isFinite(income) || income <= 0) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }

    const reqId = nextRequest();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input: mode === "bank" ? bank : bokt }),
      });
      if (!isLatest(reqId)) return;
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

  /* Кнопки «Hesabla» больше нет: результат считается на лету.

     Раньше форма требовала доскроллить до конца и нажать кнопку, то есть
     работа пользователя заканчивалась в самом низу экрана, а результат жил
     наверху справа. Живой расчёт убирает и кнопку, и этот разрыв: любое
     изменение поля сразу видно в панели результата. 450 мс — пауза, за
     которую человек успевает дописать число, но не успевает заметить
     задержку. */
  const scheduleScoring = useDebouncedCallback(() => { void runScoring(); }, 450);

  const inputsKey = mode === "bank" ? JSON.stringify(bank) : JSON.stringify(bokt);
  useEffect(() => {
    scheduleScoring();
  }, [inputsKey, mode, scheduleScoring]);

  function switchMode(next: Mode) {
    if (next === "bokt") setBokt((n) => ({ ...n, mebleg: bank.mebleg, gelir: bank.gelir }));
    setMode(next);
    setResult(null);
    setError(null);
  }

  const setB = (patch: Partial<BankForm>) => setBank((b) => ({ ...b, ...patch }));
  const blocked = Boolean(result?.blocked);
  const hasIncome = (parseFloat(mode === "bank" ? bank.gelir : bokt.gelir) || 0) > 0;
  const meblegRange = FORM_RANGES.mebleg(bank.kreditNovu);
  const muddetRange = FORM_RANGES.muddet(bank.kreditNovu);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-3xl">
            Kredit şansınızı yoxlayın
          </h1>
          <p className="mt-2 max-w-xl text-sm text-gray-600">
            Məlumatları dəyişdikcə nəticə dərhal yenilənir. Sorğusuz və pulsuz, kredit tarixçənizə təsir etmir.
          </p>

          {/* Тот же контрол, что и вкладки калькуляторов: одинаковый вид и
              одинаковая едущая заливка. */}
          <div className="mt-5">
            <Segmented<Mode>
              ariaLabel="Kredit təşkilatının növü"
              activeKey={mode}
              onSelect={switchMode}
              items={[
                { key: "bank", label: "Bank", Icon: Landmark },
                { key: "bokt", label: "BOKT", Icon: Building2 },
              ]}
            />

            {/* Расшифровка вместо тултипа.

                Рядом с переключателем висела кнопка «i»: мелкая цель, которая
                прятала одну строку текста и при этом не помещалась внутрь
                самого переключателя — в role=tablist допустимы только вкладки,
                и посторонняя кнопка объявлялась третьей вкладкой.

                Тултип здесь вообще не нужен. BOKT — незнакомая аббревиатура,
                и её расшифровку нужно ВИДЕТЬ, а не открывать. Строка меняется
                вместе с выбором, поэтому в обоих режимах говорит по делу и на
                телефоне не требует наведения, которого там нет. */}
            <p className="mt-2 text-[13px] leading-snug text-gray-600">
              {mode === "bank"
                ? "Bank krediti üzrə ilkin qiymətləndirmə."
                : "BOKT, yəni banka olmayan kredit təşkilatı. Faizlər adətən bankdakından yüksək olur."}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 py-6 sm:px-6 lg:grid-cols-5">
        {/* ── Форма ── */}
        <div className="lg:col-span-3">
          <Card className="space-y-5">
            {mode === "bank" ? (
              <>
                <Group title="Kredit">
                  <div className="grid grid-cols-2 gap-3">
                    <SelectField
                      label="Kredit növü"
                      id="kredit-novu"
                      className="col-span-2"
                      value={bank.kreditNovu}
                      onChange={(e) => {
                          const nov = e.target.value as KreditNovu;
                          const m = FORM_RANGES.mebleg(nov);
                          const d = FORM_RANGES.muddet(nov);
                          setB({
                            kreditNovu: nov,
                            mebleg: String(clampToRange(parseFloat(bank.mebleg) || m.min, m.min, m.max)),
                          muddət: String(clampToRange(parseInt(bank.muddət) || d.min, d.min, d.max)),
                          ...(nov === "kart" ? { faiz: cardBaseFaiz(bank.gelirNovu) } : {}),
                        });
                      }}
                    >
                        <option value="naqd">Nağd kredit</option>
                        <option value="kart">Kredit kartı</option>
                        <option value="ipoteka" disabled={bank.gelirNovu === "qeyri_resmi"}>
                          İpoteka{bank.gelirNovu === "qeyri_resmi" ? " (rəsmi gəlir lazımdır)" : ""}
                        </option>
                        <option value="avto" disabled={bank.gelirNovu === "qeyri_resmi"}>
                          Avtomobil krediti{bank.gelirNovu === "qeyri_resmi" ? " (rəsmi gəlir lazımdır)" : ""}
                        </option>
                    </SelectField>

                    <NumberField
                      label="Məbləğ"
                      unit="₼"
                      value={bank.mebleg}
                      onChange={(v) => setB({ mebleg: v })}
                      min={meblegRange.min}
                      max={meblegRange.max}
                      clampMin={false}
                      error={
                        (parseFloat(bank.mebleg) || 0) > 0 && parseFloat(bank.mebleg) < meblegRange.min
                          ? `Banklar adətən ${meblegRange.min} ₼-dan aşağı kredit vermir.`
                          : null
                      }
                    />
                    <NumberField
                      label="Müddət"
                      unit="ay"
                      value={bank.muddət}
                      onChange={(v) => setB({ muddət: v })}
                      min={muddetRange.min}
                      max={muddetRange.max}
                      error={
                        (parseInt(bank.muddət) || 0) >= muddetRange.max
                          ? `Banklar adətən ${muddetRange.max} aydan uzun kredit vermir.`
                          : null
                      }
                    />
                    {bank.kreditNovu !== "naqd" && (
                      <NumberField
                        label="İllik faiz"
                        unit="%"
                        value={bank.faiz}
                        onChange={(v) => setB({ faiz: v })}
                        min={FORM_RANGES.faiz.min}
                        max={FORM_RANGES.faiz.max}
                        step={0.5}
                      />
                    )}
                  </div>
                </Group>

                {/* Доход идёт сразу за параметрами кредита: без него нет
                    расчёта вообще, поэтому он выше обязательств и истории. */}
                <Group title="Gəlir">
                  <div className="grid grid-cols-2 gap-3">
                    <SelectField
                      label="Gəlir növü"
                      id="gelir-novu"
                      value={bank.gelirNovu}
                      onChange={(e) => {
                          const nov = e.target.value as GelirNovu;
                          const nextKredit =
                            nov === "qeyri_resmi" && (bank.kreditNovu === "ipoteka" || bank.kreditNovu === "avto")
                              ? "naqd"
                              : bank.kreditNovu;
                          setB({
                            gelirNovu: nov,
                            kreditNovu: nextKredit,
                            // Кредитная линия: базовая ставка следует за типом дохода.
                            ...(nextKredit === "kart" ? { faiz: cardBaseFaiz(nov) } : {}),
                        });
                      }}
                    >
                        <option value="resmi">Rəsmi</option>
                        <option value="qeyri_resmi">Qeyri-rəsmi</option>
                        <option value="teqaud">Təqaüd</option>
                        <option value="fs">VÖEN / sahibkar</option>
                        <option value="xarici">Xaricdə qazanc</option>
                    </SelectField>

                    <NumberField
                      label="Aylıq gəlir (net)"
                      unit="₼"
                      value={bank.gelir}
                      onChange={(v) => setB({ gelir: v })}
                      min={0}
                      placeholder="1000"
                      autoFocus
                    />

                    {bank.gelirNovu !== "teqaud" && bank.gelirNovu !== "qeyri_resmi" && (
                      <SelectField
                        label="Cari iş yerində staj"
                        id="staj"
                        className="col-span-2"
                        value={bank.isStaji}
                        onChange={(e) => setB({ isStaji: e.target.value as IsStaji })}
                      >
                        <option value="0_2">0 - 2 ay</option>
                        <option value="3_5">3 - 5 ay</option>
                        <option value="6_11">6 - 11 ay</option>
                        <option value="12_plus">12 ay və daha çox</option>
                      </SelectField>
                    )}

                    <NumberField
                      label="Yaş"
                      unit="yaş"
                      value={bank.yas}
                      onChange={(v) => setB({ yas: v })}
                      min={FORM_RANGES.yas.min}
                      max={FORM_RANGES.yas.max}
                      clampMin={false}
                      error={
                        (parseInt(bank.yas) || 0) > 0 && parseInt(bank.yas) < FORM_RANGES.yas.min
                          ? `Kredit üçün minimum yaş adətən ${FORM_RANGES.yas.min}-dir.`
                          : null
                      }
                    />
                  </div>
                </Group>

                {/* Четыре поля, которые у большинства равны нулю, стоят
                    компактной сеткой 2x2 и занимают четыре строки вместо
                    двенадцати. Подсказки убраны в единственную строку под
                    группой: раньше каждое поле несло по два предложения. */}
                <Group title="Mövcud öhdəliklər və tarixçə">
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="Aylıq kredit ödənişi"
                      unit="₼"
                      value={bank.movcudNaqdOdenis}
                      onChange={(v) => setB({ movcudNaqdOdenis: v })}
                      min={0}
                    />
                    <NumberField
                      label="Kredit kartı limiti"
                      unit="₼"
                      value={bank.movcudKartLimit}
                      onChange={(v) => setB({ movcudKartLimit: v })}
                      min={0}
                    />
                    <NumberField
                      label="Cari gecikmə"
                      unit="gün"
                      value={bank.cariGecikmeGun}
                      onChange={(v) => setB({ cariGecikmeGun: v })}
                      min={0}
                    />
                    <NumberField
                      label="12 ayda maks. gecikmə"
                      unit="gün"
                      value={bank.maks12ay}
                      onChange={(v) => setB({ maks12ay: v })}
                      min={0}
                    />
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-gray-500">
                    Yoxdursa 0 saxlayın. Bir neçə krediti gecikdirmisinizsə, ən böyük gecikməni yazın.
                  </p>
                </Group>
              </>
            ) : (
              <Group title="BOKT krediti">
                <div className="grid grid-cols-2 gap-3">
                  <NumberField
                    label="Məbləğ"
                    unit="₼"
                    value={bokt.mebleg}
                    onChange={(v) => setBokt((n) => ({ ...n, mebleg: v }))}
                    min={50}
                    max={1000}
                  />
                  <NumberField
                    label="Aylıq gəlir"
                    unit="₼"
                    value={bokt.gelir}
                    onChange={(v) => setBokt((n) => ({ ...n, gelir: v }))}
                    min={0}
                    placeholder="400"
                    autoFocus
                  />
                  <SelectField
                    label="Kredit tarixçəsi"
                    id="bokt-tarixce"
                    className="col-span-2"
                    value={bokt.kreditTarixce}
                    onChange={(e) => setBokt((n) => ({ ...n, kreditTarixce: e.target.value as "yox" | "gecikme" }))}
                  >
                    <option value="yox">Gecikmə yoxdur</option>
                    <option value="gecikme">Gecikmələr var</option>
                  </SelectField>
                </div>

                {/* Потолок возврата — это ФАКТ про заём, а не проблема во
                    введённых данных, поэтому блок нейтральный, а не янтарный:
                    янтарный читается как «вы что-то сделали не так».

                    Ведёт одно число, и оно сразу привязано к сумме займа:
                    цифра «20 000 ₼» сама по себе ни о чём не говорит, а
                    «взяли 10 000, вернёте не больше 20 000» говорит.

                    Заодно ушёл суффикс после числа. В JSX между <strong> и
                    текстом вставлялся пробел, и на экране получалось
                    «10 000 ₼ -dan» с дыркой перед окончанием. */}
                {parseFloat(bokt.mebleg) > 0 && (
                  <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <p className="text-[11px] font-semibold text-gray-500">Ən çox qaytaracağınız məbləğ</p>
                    <p className="mt-0.5 text-xl font-extrabold tabular-nums text-ink">
                      {azn(parseFloat(bokt.mebleg) * 2)}
                    </p>
                    <p className="mt-1.5 text-[11px] leading-snug text-gray-600">
                      {azn(parseFloat(bokt.mebleg))} götürsəniz, faiz və komissiyalarla birlikdə ümumi borcunuz bu
                      məbləği keçə bilməz. Mərkəzi Bankın qaydası: borcun artımı əsas məbləğin 100%-ni aşmır.
                    </p>
                  </div>
                )}
              </Group>
            )}
          </Card>
        </div>

        {/* ── Результат ──
            max-height + собственная прокрутка: sticky-панель выше экрана
            иначе обрезается, и было видно только её низ, без балла. */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-2">
            <Card>
              {!hasIncome ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center px-2 text-center">
                  <p className="text-sm font-semibold text-ink">Aylıq gəlirinizi yazın</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">
                    Nəticə siz yazdıqca burada görünəcək. Düyməyə basmaq lazım deyil.
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <AlertTriangle size={22} className="mb-3 text-rose-500" aria-hidden />
                  <p className="mb-4 text-sm font-medium text-gray-700">{error}</p>
                  <Button variant="secondary" size="sm" onClick={() => void runScoring()} loading={loading}>
                    Yenidən cəhd et
                  </Button>
                </div>
              ) : !result ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center" role="status" aria-live="polite">
                  <span className="nv-spin block h-5 w-5 rounded-full border-2 border-gray-200 border-t-brand-600" />
                </div>
              ) : blocked ? (
                <div className="space-y-3">
                  <Badge tone="high" icon={<XCircle size={13} />}>Hazırkı şərtlərlə mümkün deyil</Badge>
                  {result.stops.map((s, i) => (
                    <p key={i} className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">
                      {s}
                    </p>
                  ))}
                  {mode === "bank" && (
                    <Button variant="secondary" block onClick={() => switchMode("bokt")} icon={<Building2 size={15} />}>
                      BOKT şərtləri ilə yoxla
                    </Button>
                  )}
                </div>
              ) : (
                <div
                  /* Панель обновляется на лету, поэтому вежливое aria-live:
                     скринридер сообщит новый балл, не перебивая набор. */
                  aria-live="polite"
                  aria-busy={loading}
                  className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}
                >
                  <ScoreDial score={result.score} tone={result.label?.tone ?? "na"} />

                  {result.label && (
                    <div className="mt-3 text-center">
                      <p className={`text-lg font-bold ${toneStyle(result.label.tone).text}`}>{result.label.text}</p>
                      <p className="mt-0.5 text-[13px] text-gray-600">{result.label.detail}</p>
                    </div>
                  )}

                  {/* Три числа, ради которых сюда пришли, одной строкой. */}
                  <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-200 pt-4">
                    {[
                      { k: "Aylıq ödəniş", v: result.yeniOdenis > 0 ? azn(result.yeniOdenis) : "yoxdur" },
                      {
                        k: "Borc yükü",
                        v: result.bgn != null ? formatPercent(result.bgn) : "yoxdur",
                        tone: result.bgnTone,
                      },
                      {
                        k: "Faiz",
                        v: formatPercent(result.estimatedRate ?? result.manualRate ?? 0),
                      },
                    ].map((x) => (
                      <div key={x.k}>
                        <dt className="text-[11px] font-semibold text-gray-400">{x.k}</dt>
                        <dd
                          className={`text-base font-extrabold tabular-nums ${
                            x.tone ? toneStyle(x.tone).text : "text-ink"
                          }`}
                        >
                          {x.v}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {result.bgn != null && (
                    <ul className="mt-4 border-t border-gray-200 pt-3">
                      <CheckRow ok={result.bgn <= result.bgnLimit}>
                        Borc yükü bank limitindən ({formatPercent(result.bgnLimit, 0)}) aşağıdır
                      </CheckRow>
                      <CheckRow ok={result.warnings.length === 0}>
                        {result.warnings.length === 0
                          ? "Diqqət çəkən hal yoxdur"
                          : `${result.warnings.length + result.extraWarningCount} qeyd var`}
                      </CheckRow>
                    </ul>
                  )}

                  {result.warnings.length > 0 && (
                    <ul className="mt-3 space-y-1.5 border-t border-gray-200 pt-3">
                      {result.warnings.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] leading-snug text-amber-900">
                          <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
                          {w}
                        </li>
                      ))}
                    </ul>
                  )}

                  {mode === "bank" && result.calculationId && (
                    <LinkButton
                      href={`/az/kredit-yoxlama/analiz?id=${result.calculationId}`}
                      block
                      className="mt-4"
                      icon={<ArrowRight size={15} />}
                    >
                      Ətraflı analiz
                    </LinkButton>
                  )}
                </div>
              )}
            </Card>

            <p className="mt-3 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-gray-500">
              <Info size={13} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
              İlkin qiymətləndirmədir. Yekun qərarı bank və ya BOKT verir. Navio kredit vermir.
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
