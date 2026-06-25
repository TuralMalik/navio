"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bar1g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#93c5fd" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="bar2g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="bar3g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
              </defs>
              <rect x="3" y="20" width="8" height="13" rx="2" fill="url(#bar1g)" />
              <rect x="14" y="12" width="8" height="21" rx="2" fill="url(#bar2g)" />
              <rect x="25" y="4" width="8" height="29" rx="2" fill="url(#bar3g)" />
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold tracking-tight" style={{ color: "#0f1f3d" }}>
                Navio
              </span>
              <span className="text-xs text-gray-400 font-medium tracking-wide">
                Sizin maliyyə bələdçiniz
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
              href="/az/kredit-yoxlama"
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
              href="/az/kredit-yoxlama"
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
