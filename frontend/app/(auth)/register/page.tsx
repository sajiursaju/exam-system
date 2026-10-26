"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { errMsg } from "@/lib/format";
import { Notice } from "@/components/ui";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api<{ message: string }>("/auth/register", {
        body: { name, email, password, role },
      });
      setDone(res.message);
    } catch (err) {
      setError(errMsg(err));
    }
    setBusy(false);
  }

  if (done) {
    return (
      <div className="space-y-4">
        <Notice tone="good">{done}</Notice>
        <p className="text-sm">
          An admin has to approve your account before you can log in.{" "}
          <Link href="/login" className="font-semibold underline">Back to log in</Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Create an account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" required minLength={2} maxLength={100} className="input"
            value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" className="input"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8} maxLength={72}
            autoComplete="new-password" className="input"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="hint">At least 8 characters.</p>
        </div>
        <div>
          <label className="label" htmlFor="role">I am a</label>
          <select id="role" className="input" value={role}
            onChange={(e) => setRole(e.target.value as "STUDENT" | "TEACHER")}>
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
          </select>
        </div>
        {error && <Notice tone="bad">{error}</Notice>}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Creating account…" : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
        Already registered? <Link href="/login" className="font-semibold underline">Log in</Link>
      </p>
    </>
  );
}
