import { calcAnnuityPayment } from "../calculators/annuity";
import type {
  CreditCheckInput,
  CreditCheckResult,
  HardStop,
  ScoreCategory,
  ScoreFactor,
} from "./types";

function workExpMonths(exp: string): number {
  switch (exp) {
    case "lt3m": return 1;
    case "3to6m": return 4;
    case "6to12m": return 9;
    case "1to3y": return 18;
    case "gt3y": return 42;
    default: return 0;
  }
}

function scoreCategory(score: number): ScoreCategory {
  if (score >= 80) return "cox-yaxshi";
  if (score >= 65) return "yaxshi";
  if (score >= 50) return "orta";
  return "zeif";
}

export function runCreditCheck(input: CreditCheckInput): CreditCheckResult {
  const {
    monthlyIncome,
    employmentStatus,
    workExperience,
    existingMonthlyPayments,
    activeCreditLineLimit,
    currentDelinquencyDays,
    maxDelinquencyLast6Months,
    loanType,
    requestedAmount,
    loanTermMonths,
    estimatedInterestRate,
    age,
  } = input;

  const estimatedMonthlyPayment = calcAnnuityPayment(
    requestedAmount,
    estimatedInterestRate,
    loanTermMonths
  );

  const currentDebtRatio =
    monthlyIncome > 0
      ? (existingMonthlyPayments / monthlyIncome) * 100
      : 0;

  const newDebtRatio =
    monthlyIncome > 0
      ? ((existingMonthlyPayments + estimatedMonthlyPayment) / monthlyIncome) * 100
      : 0;

  const remainingAfterLoan = monthlyIncome - existingMonthlyPayments - estimatedMonthlyPayment;

  // --- Hard stops ---
  const hardStops: HardStop[] = [];

  if (age < 18) {
    hardStops.push({
      reason: "age",
      label: "Uyğun deyil",
      detail: "Minimum yaş tələbi ödənilmir",
    });
  }

  if (newDebtRatio > 70) {
    hardStops.push({
      reason: "debt_ratio",
      label: "Uyğun deyil",
      detail: "Yeni kreditdən sonra borc yükü 70%-dən yuxarıdır",
      metrics: {
        "Cari borc yükü": `${currentDebtRatio.toFixed(1)}%`,
        "Yeni kreditdən sonra borc yükü": `${newDebtRatio.toFixed(1)}%`,
        "Maksimum hədd": "70%",
      },
    });
  }

  const expMonths = workExpMonths(workExperience);
  if (expMonths < 6) {
    hardStops.push({
      reason: "work_experience",
      label: "Uyğun deyil",
      detail: "Cari iş yerində minimum 6 aylıq staj tələb olunur",
    });
  }

  if (loanType === "kredit-xetti") {
    const maxLimit = monthlyIncome * 5;
    if (activeCreditLineLimit + requestedAmount > maxLimit) {
      hardStops.push({
        reason: "credit_line_limit",
        label: "Uyğun deyil",
        detail: "Kredit xətti üzrə gəlirə əsaslanan limit aşılır",
        metrics: {
          "Mövcud limit": activeCreditLineLimit,
          "Gəlirə əsaslanan hədd": maxLimit,
          "Təxmini əlavə limit": Math.max(0, maxLimit - activeCreditLineLimit),
        },
      });
    }
  }

  // --- Scoring ---
  let score = 75;

  // Debt ratio factor
  if (newDebtRatio <= 30) score += 10;
  else if (newDebtRatio <= 50) score += 3;
  else if (newDebtRatio <= 60) score -= 5;
  else if (newDebtRatio <= 70) score -= 12;
  else score -= 20;

  // Delinquency
  if (currentDelinquencyDays === 0 && maxDelinquencyLast6Months === 0) score += 8;
  else if (currentDelinquencyDays <= 5 && maxDelinquencyLast6Months <= 10) score += 2;
  else if (currentDelinquencyDays <= 15 || maxDelinquencyLast6Months <= 30) score -= 8;
  else score -= 18;

  // Work experience
  if (expMonths >= 36) score += 8;
  else if (expMonths >= 12) score += 4;
  else if (expMonths >= 6) score += 0;
  else score -= 10;

  // Employment status
  if (employmentStatus === "daimi") score += 5;
  else if (employmentStatus === "ferdi") score += 2;
  else if (employmentStatus === "muvevqqeti") score -= 3;
  else if (employmentStatus === "islemirm") score -= 15;

  // Age
  if (age >= 25 && age <= 50) score += 5;
  else if (age >= 18 && age < 25) score += 0;
  else if (age > 50 && age <= 60) score -= 2;
  else if (age > 60) score -= 8;

  // Loan term relative to age
  if (loanType === "ipoteka") {
    const endAge = age + loanTermMonths / 12;
    if (endAge > 70) score -= 5;
  }

  score = Math.min(95, Math.max(20, Math.round(score)));

  // --- Score factors ---
  const scoreFactors: ScoreFactor[] = [
    {
      label: "Borc yükü",
      status: newDebtRatio <= 40 ? "yaxshi" : newDebtRatio <= 60 ? "orta" : "pis",
      description: `${newDebtRatio.toFixed(1)}%`,
    },
    {
      label: "Kredit tarixçəsi",
      status:
        currentDelinquencyDays === 0 && maxDelinquencyLast6Months === 0
          ? "yaxshi"
          : currentDelinquencyDays <= 10
          ? "orta"
          : "pis",
      description:
        currentDelinquencyDays === 0
          ? "Gecikməsiz"
          : `${currentDelinquencyDays} gün cari gecikmə`,
    },
    {
      label: "İş stajı",
      status: expMonths >= 12 ? "yaxshi" : expMonths >= 6 ? "orta" : "pis",
      description: expMonths >= 36 ? "3 ildən çox" : expMonths >= 12 ? "1–3 il" : expMonths >= 6 ? "6–12 ay" : "6 aydan az",
    },
    {
      label: "Yaş",
      status: age >= 25 && age <= 55 ? "yaxshi" : "orta",
      description: `${age} yaş`,
    },
  ];

  // --- Positive factors ---
  const positiveFactors: string[] = [];
  if (newDebtRatio <= 40) positiveFactors.push("Borc yükü məqbul səviyyədədir");
  if (currentDelinquencyDays === 0 && maxDelinquencyLast6Months === 0)
    positiveFactors.push("Son 6 ayda gecikmə qeyd edilməyib");
  if (expMonths >= 12) positiveFactors.push("Cari iş yerindəki staj kifayət qədərdir");
  if (employmentStatus === "daimi") positiveFactors.push("Daimi məşğulluq sabitliyi artırır");
  if (age >= 25 && age <= 50) positiveFactors.push("Yaş kreditə uyğun diapazondadır");

  // --- Risk factors ---
  const riskFactors: string[] = [];
  if (currentDelinquencyDays > 0)
    riskFactors.push(`Cari ${currentDelinquencyDays} günlük gecikmə var`);
  if (maxDelinquencyLast6Months > 15)
    riskFactors.push("Son 6 ayda əhəmiyyətli gecikmə qeydə alınıb");
  if (newDebtRatio > 50) riskFactors.push("Yeni kreditdən sonra borc yükü yüksəkdir");
  if (employmentStatus === "muvevqqeti") riskFactors.push("Müvəqqəti məşğulluq risk faktoru sayılır");
  if (expMonths < 6) riskFactors.push("Cari iş yerindəki staj qısadır");

  // --- Recommendations ---
  const recommendations: string[] = [];
  if (newDebtRatio > 50)
    recommendations.push("Mövcud kredit ödənişlərini azaltmaq borc yükünü yaxşılaşdırar");
  if (currentDelinquencyDays > 0)
    recommendations.push("Cari gecikməni tez bir zamanda bağlamağı tövsiyə edirik");
  if (expMonths < 6)
    recommendations.push("Cari iş yerindəki stajınız artdıqca kredit profili güclənəcək");
  if (requestedAmount > monthlyIncome * 30)
    recommendations.push("Kredit məbləğini azaltmaq aylıq ödənişi azaldacaq");
  if (recommendations.length === 0)
    recommendations.push("Kredit profiliniz ümumən müsbət görünür. Bankla müraciəti davam etdirə bilərsiniz.");

  return {
    hardStops,
    score,
    scoreCategory: scoreCategory(score),
    currentDebtRatio,
    newDebtRatio,
    estimatedMonthlyPayment,
    remainingAfterLoan,
    positiveFactors,
    riskFactors,
    recommendations,
    scoreFactors,
  };
}
