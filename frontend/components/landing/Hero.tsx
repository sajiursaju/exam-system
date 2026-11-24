"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    badge: "🎓 BCS & Government Job Preparation",
    title: "Crack the BCS",
    highlight: "With Confidence",
    desc: "Bangladesh's most focused BCS prep platform. Timed exams, instant results, and deep analytics.",
    cta: "/login",
    ctaLabel: "Start Preparing",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0d5c5c 100%)",
    accent: "#2dd4bf",
    img: "🏛️",
  },
  {
    badge: "📚 School & College",
    title: "SSC & HSC",
    highlight: "Master Every Topic",
    desc: "Class 9-10 and HSC 11-12 full syllabus coverage with subject-wise practice exams and solutions.",
    cta: "/tutorials/class-9-10",
    ctaLabel: "Explore Syllabus",
    bg: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #6d28d9 100%)",
    accent: "#a78bfa",
    img: "📖",
  },
  {
    badge: "🏥 Nursing Preparation",
    title: "Nursing Entrance",
    highlight: "Exam Ready",
    desc: "Comprehensive nursing exam prep with MCQs, mock tests, and performance tracking.",
    cta: "/tutorials/nursing",
    ctaLabel: "Start Now",
    bg: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0891b2 100%)",
    accent: "#7dd3fc",
    img: "🏥",
  },
  {
    badge: "🏦 Bank & Job Preparation",
    title: "Get Your Dream",
    highlight: "Government Job",
    desc: "Bank job, Niyogon, and all government job preparation with expert-curated question banks.",
    cta: "/tutorials/bank-job",
    ctaLabel: "Explore Courses",
    bg: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
    accent: "#6ee7b7",
    img: "💼",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [current]);

  function goTo(idx: number) {
    if (animating || idx === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 300);
  }

  const slide = slides[current];

  return (
    <section
      id="home"
      style={{
        background: slide.bg,
        transition: "background 0.6s ease",
        minHeight: "520px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative circles */}
      <div style={{
        position: "absolute", top: "-80px", right: "-80px",
        width: "360px", height: "360px", borderRadius: "50%",
        background: "rgba(255,255,255,0.04)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-60px", left: "-60px",
        width: "280px", height: "280px", borderRadius: "50%",
        background: "rgba(255,255,255,0.04)", pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: "1200px", margin: "0 auto", padding: "60px 24px",
        width: "100%", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "40px",
      }}>
        {/* Left content */}
        <div style={{
          flex: 1, opacity: animating ? 0 : 1,
          transform: animating ? "translateY(16px)" : "translateY(0)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}>
          <span style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "999px", padding: "6px 16px",
            fontSize: "13px", fontWeight: 600, color: "#fff",
            marginBottom: "24px",
          }}>
            {slide.badge}
          </span>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 58px)",
            fontWeight: 900, color: "#fff",
            lineHeight: 1.1, margin: 0,
            fontFamily: "serif",
          }}>
            {slide.title}
            <br />
            <span style={{ color: slide.accent }}>{slide.highlight}</span>
          </h1>

          <p style={{
            fontSize: "17px", color: "rgba(255,255,255,0.75)",
            marginTop: "20px", maxWidth: "520px", lineHeight: 1.7,
          }}>
            {slide.desc}
          </p>

          <div style={{ display: "flex", gap: "14px", marginTop: "36px", flexWrap: "wrap" }}>
            <Link href={slide.cta} style={{
              background: slide.accent, color: "#0f172a",
              padding: "14px 32px", borderRadius: "10px",
              fontWeight: 700, fontSize: "15px", textDecoration: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              display: "inline-block",
            }}>
              {slide.ctaLabel} →
            </Link>
            <Link href="/#demo" style={{
              background: "rgba(255,255,255,0.12)",
              border: "1.5px solid rgba(255,255,255,0.3)",
              color: "#fff", padding: "14px 32px",
              borderRadius: "10px", fontWeight: 600,
              fontSize: "15px", textDecoration: "none",
              display: "inline-block",
            }}>
              Request Demo
            </Link>
          </div>

          {/* Dots */}
          <div style={{ display: "flex", gap: "8px", marginTop: "36px" }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === current ? "28px" : "8px",
                  height: "8px", borderRadius: "999px",
                  background: i === current ? slide.accent : "rgba(255,255,255,0.3)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* Right emoji */}
        <div style={{
          fontSize: "clamp(80px, 12vw, 160px)",
          opacity: animating ? 0 : 0.9,
          transform: animating ? "scale(0.8)" : "scale(1)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          flexShrink: 0, userSelect: "none",
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))",
        }}>
          {slide.img}
        </div>
      </div>
    </section>
  );
}