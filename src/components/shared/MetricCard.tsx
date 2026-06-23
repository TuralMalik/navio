import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  sub?: string;
  variant?: "default" | "warning" | "success";
  className?: string;
}

export function MetricCard({ label, value, sub, variant = "default", className }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 border",
        variant === "default" && "bg-white border-gray-100",
        variant === "warning" && "bg-amber-50 border-amber-200",
        variant === "success" && "bg-emerald-50 border-emerald-200",
        className
      )}
    >
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p
        className={cn(
          "text-2xl font-bold",
          variant === "default" && "text-gray-900",
          variant === "warning" && "text-amber-700",
          variant === "success" && "text-emerald-700"
        )}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
