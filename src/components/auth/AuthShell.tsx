"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const NAVY = "#0A1F44";
const MUTED = "#5B6577";
const LINE = "#E3E8F1";

export const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

export function AuthShell({
  crumb, title, subtitle, children,
}: {
  crumb: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="bg-gray-50 min-h-screen py-10 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/az" className="hover:text-blue-600">Ana səhifə</Link>
          <ChevronRight size={14} />
          <span className="text-gray-600">{crumb}</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-1.5" style={{ color: NAVY }}>{title}</h1>
          <p className="text-sm mb-7" style={{ color: MUTED }}>{subtitle}</p>
          {children}
        </div>

        <p className="text-[12px] text-center mt-5 leading-relaxed" style={{ color: MUTED }}>
          Navio bank deyil. Qeydiyyat üçün FIN, pasport və ya bank məlumatları tələb olunmur.
        </p>
      </div>
    </main>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white text-sm transition-all shadow-md disabled:opacity-70 hover:brightness-110"
      style={{ background: "linear-gradient(135deg, #2447F0 0%, #1B36BE 100%)" }}>
      {loading && (
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{message}</div>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <span className="flex-1 h-px" style={{ background: LINE }} />
      <span className="text-xs" style={{ color: MUTED }}>{label}</span>
      <span className="flex-1 h-px" style={{ background: LINE }} />
    </div>
  );
}

/** Официальная кнопка Google: логотип обязателен по их brand guidelines. */
export function GoogleButton({ onClick, loading, label }: { onClick: () => void; loading: boolean; label: string }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-semibold text-sm bg-white transition-colors disabled:opacity-70 hover:bg-gray-50"
      style={{ border: `1px solid ${LINE}`, color: NAVY }}>
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
        <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
      </svg>
      {label}
    </button>
  );
}
