"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig, navLinks } from "@/lib/siteConfig";
import AuthButton from "@/components/landing/AuthButton";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo + tagline */}
        <Link href="/#home" className="flex flex-col leading-tight">
          <span className="text-xl font-extrabold text-indigo-600">
            {siteConfig.name}
          </span>
          <span className="text-[11px] text-slate-500">{siteConfig.tagline}</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-5 text-sm font-medium text-slate-600 xl:flex">
          {navLinks.map((l) => (
            <li key={l.label}>
              <Link href={l.href} className="hover:text-indigo-600">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop buttons */}
        <div className="hidden items-center gap-3 xl:flex">
          <Link
            href="/#demo"
            className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            🎬 Request Demo
          </Link>
          <AuthButton className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700" />
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xl xl:hidden"
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 xl:hidden">
          <ul className="flex flex-col py-2">
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-slate-700"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-3">
            <Link
              href="/#demo"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-indigo-600 py-2 text-center text-sm font-semibold text-indigo-600"
            >
              🎬 Request Demo
            </Link>
            <AuthButton className="flex-1 rounded-lg bg-indigo-600 py-2 text-center text-sm font-semibold text-white" />
          </div>
        </div>
      )}
    </header>
  );
}