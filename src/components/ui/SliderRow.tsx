"use client";

export function SliderRow({
  label, value, min, max, step, format, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-base font-bold text-gray-900">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #2563eb ${pct}%, #e5e7eb ${pct}%)`,
          accentColor: "#2563eb",
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">{format(min)}</span>
        <span className="text-xs text-gray-400">{format(max)}</span>
      </div>
    </div>
  );
}
