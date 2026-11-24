// frontend/components/landing/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { siteConfig, navLinks } from "@/lib/siteConfig";
import AuthButton from "@/components/landing/AuthButton";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10); }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: scrolled ? "rgba(255,255,255,0.97)" : "#fff",
      borderBottom: "1.5px solid #e2e8f0",
      boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
      backdropFilter: "blur(12px)",
      transition: "box-shadow 0.2s ease",
    }}>
      <nav style={{
        maxWidth: "1280px", // Increased from 1200px to give more room
        margin: "0 auto",
        padding: "0 24px", 
        height: "72px", // Slightly taller for better breathing room
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "20px",
      }}>

        {/* ── Logo ── */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px",
            background: "linear-gradient(135deg, #0d5c5c, #0f766e)",
            borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(13,92,92,0.35)",
          }}>
            <span style={{ fontSize: "22px", fontFamily: "serif", fontWeight: 900, color: "#fff" }}>M</span>
          </div>
          <div style={{ lineHeight: 1.2, whiteSpace: "nowrap" }}>
            <div style={{
              fontSize: "18px", fontWeight: 800,
              color: "#0d5c5c", fontFamily: "serif",
              letterSpacing: "-0.3px",
            }}>
              Mr Exam Mentor Mainul
            </div>
            {/* Tagline removed from here to save space */}
          </div>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <ul style={{
          display: "flex", alignItems: "center", gap: "2px", // Tighter gap
          listStyle: "none", margin: 0, padding: 0,
          flexWrap: "nowrap", // Ensure links stay on one line
        }} className="desktop-nav">
          {navLinks.map((l) => (
            <li key={l.label}>
              <Link href={l.href} style={{
                padding: "8px 12px", borderRadius: "8px",
                fontSize: "14px", fontWeight: 500,
                color: "#475569", textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
                display: "block",
                whiteSpace: "nowrap", // CRITICAL FIX: Stops 2-line wrapping
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "#f0fdfa";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#0d5c5c";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#475569";
                }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Desktop Buttons ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }} className="desktop-nav">
          <Link href="/#demo" style={{
            padding: "9px 16px", borderRadius: "9px",
            border: "1.5px solid #0d5c5c",
            fontSize: "14px", fontWeight: 600,
            color: "#0d5c5c", textDecoration: "none",
            transition: "all 0.15s",
            display: "inline-block",
            whiteSpace: "nowrap", // Keep button text on one line
            height: "40px", // Force height to match AuthButton
            alignItems: "center", justifyContent: "center",
            lineHeight: "22px"
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#f0fdfa";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
          >
            🎬 Request Demo
          </Link>
          <AuthButton className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-2 text-sm font-semibold text-white hover:from-teal-700 hover:to-teal-800 transition-all shadow-sm h-[40px] flex items-center justify-center whitespace-nowrap" />
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: "none", border: "1.5px solid #e2e8f0",
            borderRadius: "8px", padding: "8px 12px",
            fontSize: "18px", cursor: "pointer", color: "#475569",
          }}
          className="mobile-only"
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {/* ── Mobile Menu ── */}
      {/* (Mobile menu remains unchanged) */}
      {open && (
        <div style={{
          borderTop: "1.5px solid #e2e8f0",
          background: "#fff", padding: "12px 24px 20px",
        }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block", padding: "11px 12px",
                    fontSize: "15px", color: "#334155",
                    textDecoration: "none", borderRadius: "8px",
                    fontWeight: 500,
                  }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <Link
              href="/#demo"
              onClick={() => setOpen(false)}
              style={{
                flex: 1, textAlign: "center",
                padding: "11px", borderRadius: "9px",
                border: "1.5px solid #0d5c5c",
                fontSize: "14px", fontWeight: 600,
                color: "#0d5c5c", textDecoration: "none",
              }}
            >
              🎬 Request Demo
            </Link>
            <AuthButton className="flex-1 rounded-xl bg-teal-700 py-2.5 text-center text-sm font-semibold text-white" />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1100px) { /* Increased breakpoint slightly */
          .desktop-nav { display: none !important; }
          .mobile-only { display: block !important; }
        }
        @media (min-width: 1101px) {
          .mobile-only { display: none !important; }
          .desktop-nav { display: flex !important; }
        }
      `}</style>
    </header>
  );
}