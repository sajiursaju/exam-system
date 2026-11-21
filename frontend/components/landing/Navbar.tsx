// components/landing/Navbar.tsx
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
        <Link href="/" className="flex items-center gap-3 group">
          {/* M Badge */}
          <div
            style={{
              width: "38px",
              height: "38px",
              background: "var(--accent, #0d5c5c)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px -4px rgba(0, 0, 0, 0.2)",
              transition: "transform 0.2s ease",
            }}
            className="group-hover:scale-105"
          >
            <span
              style={{
                fontFamily: "serif",
                fontSize: "20px",
                fontWeight: 900,
                color: "#fff",
                marginTop: "-2px",
              }}
            >
              M
            </span>
          </div>
          
          {/* Text (Using the slug for the tagline!) */}
          <div className="flex flex-col leading-tight">
            <span 
              className="text-lg font-extrabold"
              style={{ color: "var(--accent, #0d5c5c)", fontFamily: "serif", letterSpacing: "-0.3px" }}
            >
              Mr Exam Mentor Mainul
            </span>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5">
              Empowering students to conquer every exam.
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-5 text-sm font-medium text-slate-600 xl:flex">
          {navLinks.map((l) => (
            <li key={l.label}>
              <Link href={l.href} className="hover:text-teal-700 transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop buttons */}
        <div className="hidden items-center gap-3 xl:flex">
          <Link
            href="/#demo"
            className="rounded-lg border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-colors"
          >
            🎬 Request Demo
          </Link>
          <AuthButton className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 transition-colors" />
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xl xl:hidden text-slate-700"
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
                  className="block py-2 text-slate-700 hover:text-teal-700"
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
              className="flex-1 rounded-lg border border-teal-600 py-2 text-center text-sm font-semibold text-teal-700"
            >
              🎬 Request Demo
            </Link>
            <AuthButton className="flex-1 rounded-lg bg-teal-700 py-2 text-center text-sm font-semibold text-white" />
          </div>
        </div>
      )}
    </header>
  );
}