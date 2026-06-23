import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "yaxshi" | "orta" | "pis";

interface Props {
  label: string;
  description: string;
  status: Status;
}

const icons = {
  yaxshi: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />,
  orta: <AlertCircle size={16} className="text-amber-500 shrink-0" />,
  pis: <XCircle size={16} className="text-red-500 shrink-0" />,
};

const labels: Record<Status, string> = {
  yaxshi: "Yaxşı",
  orta: "Orta",
  pis: "Zəif",
};

export function FactorRow({ label, description, status }: Props) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2">
        {icons[status]}
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <span
        className={cn(
          "text-xs font-semibold px-2 py-0.5 rounded-full",
          status === "yaxshi" && "bg-emerald-50 text-emerald-700",
          status === "orta" && "bg-amber-50 text-amber-700",
          status === "pis" && "bg-red-50 text-red-700"
        )}
      >
        {labels[status]}
      </span>
    </div>
  );
}
