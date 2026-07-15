"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Kredit yoxlaması", href: "/az/kredit-yoxlama" },
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
          <Link href="/az" className="flex items-center gap-2">
            <svg width="40" height="38" viewBox="0 0 104 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ng" gradientUnits="userSpaceOnUse" x1="5" y1="0" x2="99" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="48%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
              </defs>
              <path d="M 5,70 L 27,55 Q 33,55 33,61 L 33,88 Q 33,94 27,94 L 11,94 Q 5,94 5,88 Z" fill="url(#ng)" />
              <path d="M 38,48 L 60,33 Q 66,33 66,39 L 66,88 Q 66,94 60,94 L 44,94 Q 38,94 38,88 Z" fill="url(#ng)" />
              <path d="M 71,20 L 93,5 Q 99,5 99,11 L 99,88 Q 99,94 93,94 L 77,94 Q 71,94 71,88 Z" fill="url(#ng)" />
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold tracking-tight" style={{ color: "#0f1f3d" }}>
                Navio
              </span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">
                Sizin maliyyə köməkçiniz
              </span>
            </div>
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
            <span className="text-sm font-medium text-gray-500 cursor-default select-none">
              AZ
            </span>
            <Link
              href="/az/login"
              className="text-sm font-medium text-gray-600 hover:text-blue-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-blue-300 transition-colors"
            >
              Giriş / Qeydiyyat
            </Link>
            <Link
              href="/az/kredit-yoxlama"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all"
              style={{ background: "linear-gradient(135deg, #2447F0 0%, #1B36BE 100%)" }}
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
              Giriş / Qeydiyyat
            </Link>
            <Link
              href="/az/kredit-yoxlama"
              className="text-sm font-semibold px-4 py-3 rounded-lg text-white text-center"
              style={{ background: "linear-gradient(135deg, #2447F0 0%, #1B36BE 100%)" }}
            >
              İlkin yoxlama
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
