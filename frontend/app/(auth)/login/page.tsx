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
      const { user } = await api<{ user: User }>("/auth/login", { body: { email, password } });
      router.replace(user.role === "STUDENT" ? "/student/dashboard" : "/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" className="input"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required autoComplete="current-password" className="input"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <Notice tone="bad">{error}</Notice>}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
        No account yet? <Link href="/register" className="font-semibold underline">Register</Link>
      </p>
    </>
  );
}
