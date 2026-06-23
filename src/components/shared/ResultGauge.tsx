interface Props {
  score: number;
  category: string;
  categoryLabel: string;
}

export function ResultGauge({ score, categoryLabel }: Props) {
  const pct = (score / 95) * 100;
  const color =
    score >= 80 ? "#10b981" : score >= 65 ? "#3b82f6" : score >= 50 ? "#f59e0b" : "#ef4444";

  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ * 0.75;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="100" viewBox="0 0 140 100">
        <path
          d="M 14 84 A 56 56 0 0 1 126 84"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 14 84 A 56 56 0 0 1 126 84"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 176} 176`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        <text x="70" y="72" textAnchor="middle" fontSize="26" fontWeight="700" fill="#0f1f3d">
          {score}
        </text>
        <text x="70" y="86" textAnchor="middle" fontSize="10" fill="#9ca3af">
          / 100
        </text>
      </svg>
      <span
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{ background: color + "22", color }}
      >
        {categoryLabel}
      </span>
    </div>
  );
}
