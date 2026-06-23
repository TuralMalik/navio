import { cn } from "@/lib/utils";

type Status = "yaxshi" | "orta" | "pis" | "info";

interface Props {
  status: Status;
  label: string;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  yaxshi: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  orta: "bg-amber-50 text-amber-700 border border-amber-200",
  pis: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
};

export function StatusBadge({ status, label, className }: Props) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", statusStyles[status], className)}>
      {label}
    </span>
  );
}
