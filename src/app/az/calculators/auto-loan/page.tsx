"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Trash2, ChevronDown } from "lucide-react";
import { calcAnnuityPayment } from "@/lib/calculators/annuity";
import { formatCurrency } from "@/lib/utils";

const inputClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition";
const selectClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition appearance-none";

type ErkenRejim = "muddət" | "odəniş";
interface OneTimePayment { id: number; month: number; amount: number; }
interface ScheduleRow { month: number; payment: number; extra: number; interest: number; principal: number; balance: number; }

export default function AutoLoanPage() {
  const [carPrice, setCarPrice] = useState(30000);
  const [carType, setCarType] = useState("passenger");
  const [isNew, setIsNew] = useState("new");
  const [carAge, setCarAge] = useState(0);
  const [downPaymentPctInput, setDownPaymentPctInput] = useState(20);
  const [downPayment, setDownPayment] = useState(6000);
  const [months, setMonths] = useState(60);
  const [rate, setRate] = useState(15);

  const [showExtra, setShowExtra] = useState(false);
  const [erkenRejim, setErkenRejim] = useState<ErkenRejim>("muddət");
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringAmount, setRecurringAmount] = useState(100);
  const [recurringFrom, setRecurringFrom] = useState(1);
  const [recurringTo, setRecurringTo] = useState<number | "">("");
  const [oneTimePayments, setOneTimePayments] = useState<OneTimePayment[]>([{ id: 1, month: 1, amount: 0 }]);
  const [penalty, setPenalty] = useState(0);

  const [showBgn, setShowBgn] = useState(false);
  const [bgnGelir, setBgnGelir] = useState(0);
  const [bgnMovcud, setBgnMovcud] = useState(0);

  const [showAllRows, setShowAllRows] = useState(false);

  const handleCarPriceChange = (val: number) => {
    setCarPrice(val);
    setDownPayment(Math.round((downPaymentPctInput / 100) * val));
  };
  const handleDownPctChange = (pct: number) => {
    setDownPaymentPctInput(pct);
    setDownPayment(Math.round((pct / 100) * carPrice));
  };
  const handleDownAmtChange = (amt: number) => {
    setDownPayment(amt);
    setDownPaymentPctInput(carPrice > 0 ? Math.round((amt / carPrice) * 1000) / 10 : 0);
  };

  const addOneTime = () => setOneTimePayments((p) => [...p, { id: Date.now(), month: 1, amount: 0 }]);
  const removeOneTime = (id: number) => setOneTimePayments((p) => p.filter((x) => x.id !== id));
  const updateOneTime = (id: number, field: "month" | "amount", value: number) =>
    setOneTimePayments((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const loanAmount = Math.max(0, carPrice - downPayment);
  const baseMonthly = calcAnnuityPayment(loanAmount, rate, months);

  const { schedule, extraResult } = useMemo(() => {
    const r = rate / 100 / 12;

    if (!showExtra) {
      const rows: ScheduleRow[] = [];
      let balance = loanAmount;
      const pmt = baseMonthly;
      for (let i = 1; i <= months; i++) {
        const interest = balance * r;
        const principal = Math.min(pmt - interest, balance);
        balance = Math.max(0, balance - principal);
        rows.push({ month: i, payment: pmt, extra: 0, interest, principal, balance });
        if (balance <= 0) break;
      }
      return { schedule: rows, extraResult: null };
    }

    const toMonth = recurringTo === "" ? months : Number(recurringTo);
    let balance = loanAmount;
    let totalPaid = 0;
    let totalInterest = 0;
    let totalPenalty = 0;
    let actualMonths = 0;
    let currentPayment = baseMonthly;
    let remainingMonths = months;
    const rows: ScheduleRow[] = [];

    for (let i = 1; i <= months * 2; i++) {
      if (balance <= 0) break;
      actualMonths = i;
      const interest = balance * r;
      const schedPayment = Math.min(currentPayment, balance + interest);
      const principalPart = schedPayment - interest;
      totalInterest += interest;
      totalPaid += schedPayment;
      balance -= principalPart;
      remainingMonths = Math.max(1, remainingMonths - 1);

      let extra = 0;
      if (recurringEnabled && i >= recurringFrom && i <= toMonth) extra += recurringAmount;
      oneTimePayments.forEach((op) => { if (op.month === i) extra += op.amount; });

      let actualExtra = 0;
      if (extra > 0 && balance > 0) {
        actualExtra = Math.min(extra, balance);
        const pen = (actualExtra * penalty) / 100;
        totalPenalty += pen;
        totalPaid += actualExtra + pen;
        balance -= actualExtra;
        if (balance > 0 && erkenRejim === "odəniş" && remainingMonths > 0) {
          const newN = remainingMonths;
          currentPayment = (balance * r * Math.pow(1 + r, newN)) / (Math.pow(1 + r, newN) - 1);
        }
      }

      rows.push({ month: i, payment: schedPayment, extra: actualExtra, interest, principal: principalPart, balance: Math.max(0, balance) });
      if (balance <= 0) break;
    }

    return {
      schedule: rows,
      extraResult: {
        finalMonths: actualMonths,
        lastPayment: currentPayment,
        totalInterest,
        penaltyCost: totalPenalty,
        savings: Math.max(0, baseMonthly * months - totalPaid),
      },
    };
  }, [loanAmount, rate, months, baseMonthly, showExtra, recurringEnabled, recurringAmount,
      recurringFrom, recurringTo, oneTimePayments, penalty, erkenRejim]);

  const bgn = showBgn && bgnGelir > 0
    ? ((bgnMovcud + baseMonthly) / bgnGelir) * 100
    : null;

  const displayedRows = showAllRows ? schedule : schedule.slice(0, 10);
  const hasExtra = showExtra && (recurringEnabled || oneTimePayments.some((op) => op.amount > 0));

  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
            <ChevronRight size={14} />
            <Link href="/az/calculators" className="hover:text-blue-600">Kalkulyatorlar</Link>
            <ChevronRight size={14} />
            <span className="text-gray-600">Avtokredit</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Avtokredit kalkulyatoru</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5">

            {/* Avtomobil məlumatları */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Avtomobil məlumatları</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Avtomobilin qiyməti (₼)</label>
                  <input type="number" min={0} className={inputClass} value={carPrice}
                    onChange={(e) => handleCarPriceChange(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Avtomobil tipi</label>
                  <select className={selectClass} value={carType} onChange={(e) => setCarType(e.target.value)}>
                    <option value="passenger">Minik avtomobili</option>
                    <option value="suv">SUV / Krossover</option>
                    <option value="commercial">Kommersiya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni və ya işlənmiş</label>
                  <select className={selectClass} value={isNew} onChange={(e) => setIsNew(e.target.value)}>
                    <option value="new">Yeni</option>
                    <option value="used">İşlənmiş</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Avtomobilin yaşı (il)</label>
                  <input type="number" min={0} max={30} className={inputClass} value={carAge}
                    onChange={(e) => setCarAge(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">İlkin ödəniş faizi (%)</label>
                  <input type="number" min={0} max={100} step={0.5} className={inputClass} value={downPaymentPctInput}
                    onChange={(e) => handleDownPctChange(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">İlkin ödəniş məbləği (₼)</label>
                  <input type="number" min={0} className={inputClass} value={downPayment}
                    onChange={(e) => handleDownAmtChange(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kredit müddəti (ay)</label>
                  <input type="number" min={1} max={84} className={inputClass} value={months}
                    onChange={(e) => setMonths(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">İllik faiz dərəcəsi (%)</label>
                  <input type="number" min={0} step={0.1} className={inputClass} value={rate}
                    onChange={(e) => setRate(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Əlavə ödənişlər */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="font-bold text-gray-900">Əlavə ödənişlər planlaşdırırsınız?</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Krediti daha tez bağlamaq və ya aylıq ödənişi azaltmaq üçün.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowExtra(false)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${!showExtra ? "bg-gray-200 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}>
                    Xeyr
                  </button>
                  <button onClick={() => setShowExtra(true)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${showExtra ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-600"}`}>
                    Bəli
                  </button>
                </div>
              </div>

              {showExtra && (
                <div className="mt-5 space-y-5">
                  <div className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <input type="checkbox" id="rec-a" checked={recurringEnabled}
                        onChange={(e) => setRecurringEnabled(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                      <label htmlFor="rec-a" className="font-semibold text-gray-800 text-sm cursor-pointer">
                        Daimi əlavə ödəniş istifadə edilsin?
                      </label>
                    </div>
                    {recurringEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Aylıq əlavə məbləğ</label>
                          <input type="number" min={0} className={inputClass} value={recurringAmount}
                            onChange={(e) => setRecurringAmount(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Hansı aydan başlasın</label>
                          <input type="number" min={1} max={months} className={inputClass} value={recurringFrom}
                            onChange={(e) => setRecurringFrom(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Nəyə qədər davam etsin</label>
                          <input type="number" min={recurringFrom} max={months} className={inputClass}
                            placeholder="Kredit bitənə qədər" value={recurringTo}
                            onChange={(e) => setRecurringTo(e.target.value === "" ? "" : Number(e.target.value))} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-100 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 text-sm mb-4">Birdəfəlik əlavə ödənişlər</h4>
                    <div className="space-y-3">
                      {oneTimePayments.map((op) => (
                        <div key={op.id} className="grid grid-cols-5 gap-3 items-end">
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Ödəniş ayı</label>
                            <input type="number" min={1} max={months} className={inputClass} value={op.month}
                              onChange={(e) => updateOneTime(op.id, "month", Number(e.target.value))} />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Məbləğ (₼)</label>
                            <input type="number" min={0} className={inputClass} value={op.amount}
                              onChange={(e) => updateOneTime(op.id, "amount", Number(e.target.value))} />
                          </div>
                          <button onClick={() => removeOneTime(op.id)}
                            className="h-10 flex items-center justify-center px-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={addOneTime}
                      className="mt-3 flex items-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                      <Plus size={16} /> Ödəniş əlavə et
                    </button>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 text-sm mb-3">Erkən ödəniş kompensasiyası</h4>
                    <div className="max-w-xs">
                      <select className={selectClass} value={penalty} onChange={(e) => setPenalty(Number(e.target.value))}>
                        <option value={0}>0%</option>
                        <option value={1}>1%</option>
                        <option value={2}>2%</option>
                        <option value={3}>3%</option>
                        <option value={5}>5%</option>
                      </select>
                    </div>
                  </div>

                  <div className="border border-blue-100 rounded-xl p-4 bg-blue-50">
                    <h4 className="font-semibold text-gray-800 text-sm mb-3">Əlavə ödənişdən sonra nə azalsın?</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { key: "muddət", icon: "⏱️", label: "Müddət azalsın", note: "Aylıq ödəniş eyni" },
                        { key: "odəniş", icon: "💸", label: "Aylıq ödəniş azalsın", note: "Müddət eyni qalır" },
                      ] as { key: ErkenRejim; icon: string; label: string; note: string }[]).map(({ key, icon, label, note }) => (
                        <button key={key} onClick={() => setErkenRejim(key)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                            erkenRejim === key
                              ? "border-blue-600 bg-white text-blue-700 shadow-sm"
                              : "border-transparent bg-white/60 text-gray-500 hover:bg-white"
                          }`}>
                          <span className="text-lg">{icon}</span>
                          <span className="text-center leading-tight">{label}</span>
                          <span className="text-xs font-normal text-gray-400">{note}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BGN yoxlaması */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="font-bold text-gray-900">BGN yoxlamasını da göstər</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Aylıq gəlirinizə əsasən borc-gəlir nisbətini hesablayır.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowBgn(false)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${!showBgn ? "bg-gray-200 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}>
                    Xeyr
                  </button>
                  <button onClick={() => setShowBgn(true)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${showBgn ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-600"}`}>
                    Bəli
                  </button>
                </div>
              </div>
              {showBgn && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Aylıq xalis gəlir (₼)</label>
                    <input type="number" min={0} className={inputClass} value={bgnGelir}
                      onChange={(e) => setBgnGelir(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Aylıq digər kredit ödənişləri (₼)</label>
                    <input type="number" min={0} className={inputClass} value={bgnMovcud}
                      onChange={(e) => setBgnMovcud(Number(e.target.value))} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-xs text-gray-500 font-medium mb-1">Aylıq ödəniş</p>
                <p className="text-4xl font-bold text-gray-900 mb-5">{formatCurrency(baseMonthly)}</p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Kredit məbləği</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(loanAmount)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">İlkin ödəniş</p>
                    <p className="text-xl font-bold text-gray-900">
                      {(carPrice > 0 ? (downPayment / carPrice) * 100 : 0).toFixed(1)}%
                    </p>
                  </div>
                  {extraResult && (
                    <>
                      <div className="bg-emerald-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Yeni müddət</p>
                        <p className="text-xl font-bold text-emerald-700">{extraResult.finalMonths} ay</p>
                        {extraResult.finalMonths < months && (erkenRejim === "muddət") && (
                          <p className="text-xs text-emerald-600 font-semibold mt-0.5">−{months - extraResult.finalMonths} ay</p>
                        )}
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3">
                        {erkenRejim === "odəniş" ? (
                          <>
                            <p className="text-xs text-gray-400 mb-1">Qənaət edilmiş məbləğ</p>
                            <p className="text-xl font-bold text-emerald-700">{formatCurrency(extraResult.savings)}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-gray-400 mb-1">Qənaət</p>
                            <p className="text-xl font-bold text-emerald-700">{formatCurrency(extraResult.savings)}</p>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-gray-900 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Ümumi ödəniş</p>
                  <p className="text-2xl font-bold text-white mb-4">{formatCurrency(baseMonthly * months)}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Faizlər</span>
                      <span className="text-white font-medium">{formatCurrency(baseMonthly * months - loanAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Əsas borc</span>
                      <span className="text-white font-medium">{formatCurrency(loanAmount)}</span>
                    </div>
                    {extraResult && extraResult.savings > 0 && (
                      <div className="flex justify-between text-sm border-t border-gray-700 pt-2 mt-2">
                        <span className="text-emerald-400">Əlavə ödənişlə qənaət</span>
                        <span className="text-emerald-400 font-medium">{formatCurrency(extraResult.savings)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {bgn !== null && (
                <div className={`rounded-2xl border p-5 ${bgn > 70 ? "bg-red-50 border-red-100" : bgn > 50 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"}`}>
                  <p className="text-sm font-bold mb-1" style={{ color: bgn > 70 ? "#b91c1c" : bgn > 50 ? "#92400e" : "#065f46" }}>
                    BGN: {bgn.toFixed(1)}%
                  </p>
                  <p className="text-xs" style={{ color: bgn > 70 ? "#dc2626" : bgn > 50 ? "#d97706" : "#059669" }}>
                    {bgn > 70 ? "Borc yükü çox yüksəkdir." : bgn > 50 ? "Borc yükü yüksəkdir." : "Borc yükü normaldadır."}
                  </p>
                </div>
              )}

              {isNew === "used" && carAge > 10 && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    İşlənmiş avtomobillər üçün yaş məhdudiyyəti bankdan banka dəyişir.
                    10 ildən köhnə nəqliyyat vasitələri üçün banklar fərqli şərtlər qoya bilər.
                  </p>
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-700 leading-relaxed">
                  Hesablama annuitet üsulu ilə aparılır. Faktiki bank şərtləri fərqli ola bilər.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ödəniş cədvəli */}
        {schedule.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Ödəniş cədvəli</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="pb-3 pr-4 font-medium">Ay</th>
                    <th className="pb-3 pr-4 font-medium">Aylıq ödəniş</th>
                    {hasExtra && <th className="pb-3 pr-4 font-medium">Əlavə ödəniş</th>}
                    <th className="pb-3 pr-4 font-medium">Faiz hissəsi</th>
                    <th className="pb-3 pr-4 font-medium">Əsas borc</th>
                    <th className="pb-3 font-medium">Qalıq borc</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((row) => (
                    <tr key={row.month} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-4 font-medium text-gray-700">{row.month}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{formatCurrency(row.payment)}</td>
                      {hasExtra && <td className="py-2.5 pr-4 text-blue-600 font-medium">{row.extra > 0 ? formatCurrency(row.extra) : "—"}</td>}
                      <td className="py-2.5 pr-4 text-orange-600">{formatCurrency(row.interest)}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{formatCurrency(row.principal)}</td>
                      <td className="py-2.5 text-gray-900 font-medium">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {schedule.length > 10 && (
              <button onClick={() => setShowAllRows(!showAllRows)}
                className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                <ChevronDown size={16} className={`transition-transform ${showAllRows ? "rotate-180" : ""}`} />
                {showAllRows ? "Yığ" : `Bütün cədvəli göstər (${schedule.length} ay)`}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
