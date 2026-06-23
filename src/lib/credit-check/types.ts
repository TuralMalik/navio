export type EmploymentStatus =
  | "daimi"
  | "ferdi"
  | "muvevqqeti"
  | "islemirm"
  | "diger";

export type WorkExperience =
  | "lt3m"
  | "3to6m"
  | "6to12m"
  | "1to3y"
  | "gt3y";

export type LoanType =
  | "istehlak"
  | "ipoteka"
  | "avtokredit"
  | "kredit-xetti";

export type MaritalStatus = "subay" | "evli" | "diger";

export interface CreditCheckInput {
  monthlyIncome: number;
  employmentStatus: EmploymentStatus;
  workExperience: WorkExperience;
  existingMonthlyPayments: number;
  activeCreditLineLimit: number;
  currentDelinquencyDays: number;
  maxDelinquencyLast6Months: number;
  loanType: LoanType;
  requestedAmount: number;
  loanTermMonths: number;
  estimatedInterestRate: number;
  age: number;
  maritalStatus: MaritalStatus;
}

export type HardStopReason =
  | "age"
  | "debt_ratio"
  | "work_experience"
  | "credit_line_limit";

export interface HardStop {
  reason: HardStopReason;
  label: string;
  detail: string;
  metrics?: Record<string, string | number>;
}

export type ScoreCategory = "cox-yaxshi" | "yaxshi" | "orta" | "zeif";

export interface ScoreFactor {
  label: string;
  status: "yaxshi" | "orta" | "pis";
  description: string;
}

export interface CreditCheckResult {
  hardStops: HardStop[];
  score: number;
  scoreCategory: ScoreCategory;
  currentDebtRatio: number;
  newDebtRatio: number;
  estimatedMonthlyPayment: number;
  remainingAfterLoan: number;
  positiveFactors: string[];
  riskFactors: string[];
  recommendations: string[];
  scoreFactors: ScoreFactor[];
}
