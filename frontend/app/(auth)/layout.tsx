// frontend/app/(auth)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // If we are on the admin or teacher login page, render full-width (no white card)
  if (pathname.includes("/admin") || pathname.includes("/teacher")) {
    return <>{children}</>;
  }

  // Otherwise, render the normal Student login layout
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg, #f8f9fa)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{
              fontSize: "32px", fontWeight: 800, color: "var(--accent, #0d5c5c)",
              letterSpacing: "-0.5px", fontFamily: "serif",
            }}>
              Mr Exam Mentor Mainul
            </div>
          </Link>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>
            Your smart exam preparation platform
          </p>
        </div>

        <div style={{
          background: "#ffffff", border: "1px solid var(--line, #eaeaea)",
          borderRadius: "16px", padding: "36px 32px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}