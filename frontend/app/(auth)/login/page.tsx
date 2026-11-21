// frontend/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { errMsg } from "@/lib/format";
import type { User } from "@/lib/types";
import { Notice } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { user } = await api<{ user: User }>("/auth/login", {
        body: { email, password },
      });

      // ✅ Block admin and teacher from student login
      if (user.role !== "STUDENT") {
        await api("/auth/logout", { method: "POST" }).catch(() => {});
        setError("This page is for students only. Staff must use the admin login.");
        setBusy(false);
        return;
      }

      router.replace("/student/dashboard");
      router.refresh();
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <>
      {/* Brand */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{
          fontSize: "28px", fontWeight: 900,
          fontFamily: "serif", color: "var(--accent)",
          lineHeight: 1.1, margin: 0,
        }}>
        Exam Portal
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "6px" }}>
          Student login
        </p>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          margin: "14px auto 0", maxWidth: "180px",
        }}>
          <div style={{ flex: 1, height: "1px", background: "var(--line)" }} />
          <span style={{ fontSize: "14px" }}>🎓</span>
          <div style={{ flex: 1, height: "1px", background: "var(--line)" }} />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input
            id="email" type="email" required autoComplete="email"
            className="input" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label className="label" htmlFor="password">Password</label>
            <Link href="/forgot-password" style={{
              fontSize: "13px", fontWeight: 600,
              color: "var(--accent)", textDecoration: "none",
            }}>
              Forgot password?
            </Link>
          </div>
          <input
            id="password" type="password" required autoComplete="current-password"
            className="input" placeholder="Enter your password"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <>
            <Notice tone="bad">{error}</Notice>
            {/* Show admin login link if staff tries here */}
            {error.includes("admin login") && (
              <div style={{ textAlign: "center" }}>
                <Link href="/admin/login" style={{
                  fontSize: "13px", fontWeight: 600,
                  color: "var(--accent)", textDecoration: "underline",
                }}>
                  Go to Admin Login →
                </Link>
              </div>
            )}
          </>
        )}

        <button
          className="btn btn-primary w-full" disabled={busy}
          style={{
            padding: "12px", fontSize: "15px",
            fontWeight: 600, marginTop: "8px",
          }}
        >
          {busy ? "Signing in…" : "Sign in →"}
        </button>
      </form>

      {/* Divider */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: "12px", margin: "24px 0",
      }}>
        <div style={{ flex: 1, height: "1px", background: "var(--line)" }} />
        <span style={{
          fontSize: "11px", fontWeight: 600,
          letterSpacing: "1.5px", textTransform: "uppercase",
          color: "var(--muted)",
        }}>
          New here
        </span>
        <div style={{ flex: 1, height: "1px", background: "var(--line)" }} />
      </div>

      {/* Register + Admin login links */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Link href="/register" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", padding: "11px", fontSize: "15px",
          fontWeight: 600, borderRadius: "8px",
          border: "1px solid var(--line)",
          color: "var(--fg)", textDecoration: "none",
          background: "transparent", textAlign: "center",
        }}>
          Create a free account
        </Link>

      
      </div>
    </>
  );
}