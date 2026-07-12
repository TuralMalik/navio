"use client";

import { useState, useEffect } from "react";

export function SliderRow({
  label, value, min, max, step, format, onChange, accentColor = "#2563eb", unit = "",
}: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void; accentColor?: string; unit?: string;
}) {
  const [inputVal, setInputVal] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setInputVal(String(value));
  }, [value, focused]);

  const pct = ((value - min) / (max - min)) * 100;

  function commitInput(raw: string) {
    const n = parseFloat(raw);
    if (!isNaN(n)) {
      const clamped = Math.min(max, Math.max(min, Math.round(n / step) * step));
      onChange(clamped);
      setInputVal(String(clamped));
    } else {
      setInputVal(String(value));
    }
    setFocused(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={inputVal}
            onFocus={() => setFocused(true)}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={(e) => commitInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitInput((e.target as HTMLInputElement).value); }}
            className="w-24 text-right text-base font-bold text-gray-900 bg-transparent border-b-2 border-transparent focus:border-blue-400 focus:outline-none transition-colors"
            step={step}
          />
          {unit && <span className="text-sm text-gray-500 shrink-0">{unit}</span>}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${accentColor} ${pct}%, #e5e7eb ${pct}%)`,
          accentColor,
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">{format(min)}</span>
        <span className="text-xs text-gray-500">{format(max)}</span>
      </div>
    </div>
  );
}
