import { AlertTriangle } from "lucide-react";

interface Props {
  title: string;
  detail: string;
  metrics?: Record<string, string | number>;
}

export function WarningCard({ title, detail, metrics }: Props) {
  return (
    <div className="rounded-xl bg-red-50 border border-red-200 p-4">
      <div className="flex gap-3">
        <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-700">{title}</p>
          <p className="text-sm text-red-600 mt-0.5">{detail}</p>
          {metrics && (
            <div className="mt-3 space-y-1">
              {Object.entries(metrics).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-red-600">{k}</span>
                  <span className="font-semibold text-red-700">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
