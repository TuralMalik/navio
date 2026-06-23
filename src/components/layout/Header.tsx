"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Kredit yoxlaması", href: "/az/credit-check" },
  { label: "Kredit kalkulyatoru", href: "/az/calculators" },
  { label: "Maliyyə köməkçisi", href: "/az/financial-assistant" },
  { label: "Haqqımızda", href: "/az/about" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/az" className="flex flex-col leading-tight">
            <span className="text-xl font-bold text-navy-900 tracking-tight" style={{ color: "#0f1f3d" }}>
              Navio
            </span>
            <span className="text-xs text-gray-400 font-medium tracking-wide">
              Sizin maliyyə bələdçiniz
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm font-medium text-gray-400 cursor-default select-none">
              AZ
            </span>
            <Link
              href="/az/login"
              className="text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors"
            >
              Giriş
            </Link>
            <Link
              href="/az/register"
              className="text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors"
            >
              Qeydiyyat
            </Link>
            <Link
              href="/az/credit-check"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all"
              style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b5fc0 100%)" }}
            >
              İlkin yoxlama
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600"
            onClick={() => setOpen(!open)}
            aria-label="Menyu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-700 py-2"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <Link href="/az/login" className="text-sm font-medium text-gray-600 py-2">
              Giriş
            </Link>
            <Link href="/az/register" className="text-sm font-medium text-gray-600 py-2">
              Qeydiyyat
            </Link>
            <Link
              href="/az/credit-check"
              className="text-sm font-semibold px-4 py-3 rounded-lg text-white text-center"
              style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b5fc0 100%)" }}
            >
              İlkin yoxlama
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
