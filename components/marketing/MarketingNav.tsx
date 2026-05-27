"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function MarketingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-stone-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/findingnami-logo.png"
            alt="Finding Nami"
            width={160}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm text-stone-500 hover:text-stone-700 font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-brand-orange text-white rounded-full px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Join free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-stone-600 hover:text-stone-900"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-6 py-4 flex flex-col gap-4">
          <Link
            href="/login"
            className="text-sm text-stone-500 font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-brand-orange text-white rounded-full px-5 py-2 text-sm font-semibold text-center hover:opacity-90 transition-opacity"
            onClick={() => setMenuOpen(false)}
          >
            Join free
          </Link>
        </div>
      )}
    </nav>
  );
}
