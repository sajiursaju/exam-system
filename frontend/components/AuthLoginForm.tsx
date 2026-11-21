// frontend/components/AuthLoginForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { errMsg } from "@/lib/format";
import type { Role, User } from "@/lib/types";
import { Notice } from "@/components/ui";

export default function AuthLoginForm({
  allowedRoles,
  themeColor,
  title,
  subtitle,
  redirectPath,
  studentLoginPath,
}: {
  allowedRoles: Role[];
  themeColor: string;
  title: string;
  subtitle: string;
  redirectPath: string;
  studentLoginPath?: string;
}) {
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

      // Block roles not allowed here
      if (!allowedRoles.includes(user.role)) {
        await api("/auth/logout", { method: "POST" }).catch(() => {});
        setError(
          user.role === "STUDENT"
            ? "Students must use the student login page."
            : `Access denied for role: ${user.role}`
        );
        setBusy(false);
        return;
      }

      router.replace(redirectPath);
      router.refresh();
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: "400px", padding: "0 16px" }}>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2 style={{
          fontSize: "26px", fontWeight: 800,
          color: "#0f172a", margin: 0, fontFamily: "serif",
        }}>
          {title}
        </h2>
        <p style={{ fontSize: "14px", color: "#64748b", marginTop: "8px" }}>
          {subtitle}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{
            display: "block", fontSize: "13px",
            fontWeight: 600, color: "#374151", marginBottom: "6px",
          }}>
            Email Address
          </label>
          <input
            type="email" required autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px",
              fontSize: "15px",
              border: "1.5px solid #e2e8f0",
              borderRadius: "8px",
              background: "#fff",
              color: "#0f172a",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label style={{
            display: "block", fontSize: "13px",
            fontWeight: 600, color: "#374151", marginBottom: "6px",
          }}>
            Password
          </label>
          <input
            type="password" required autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px",
              fontSize: "15px",
              border: "1.5px solid #e2e8f0",
              borderRadius: "8px",
              background: "#fff",
              color: "#0f172a",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && <Notice tone="bad">{error}</Notice>}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: "100%", padding: "13px",
            fontSize: "15px", fontWeight: 700,
            background: busy ? "#a5b4fc" : themeColor,
            color: "#fff", border: "none",
            borderRadius: "8px",
            cursor: busy ? "not-allowed" : "pointer",
            transition: "background 0.15s",
            marginTop: "4px",
          }}
        >
          {busy ? "Signing in…" : "Sign In →"}
        </button>
      </form>

      {/* Footer links */}
      <div style={{
        textAlign: "center", marginTop: "28px",
        display: "flex", flexDirection: "column", gap: "8px",
      }}>
        {studentLoginPath && (
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            Are you a student?{" "}
            <Link href={studentLoginPath} style={{ color: themeColor, fontWeight: 600, textDecoration: "none" }}>
              Go to student login →
            </Link>
          </p>
        )}
        <Link href="/" style={{ fontSize: "13px", color: "#94a3b8", textDecoration: "none" }}>
          ← Back to Home
        </Link>
      </div>

    </div>
  );
}