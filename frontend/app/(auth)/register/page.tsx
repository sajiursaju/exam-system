// frontend/app/(auth)/register/page.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { errMsg } from "@/lib/format";
import { Notice } from "@/components/ui";


function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [institute, setInstitute] = useState("");
  const [targetExam, setTargetExam] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Photo must be under 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarBase64(result);
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetExam) { setError("Please select your class or exam category."); return; }
    setError("");
    setBusy(true);
    try {
      const res = await api<{ message: string }>("/auth/register", {
        body: {
          name,
          email,
          password,
          role: "STUDENT",
          phone: phone || undefined,
          institute: institute || undefined,
          targetExam,
          avatarUrl: avatarBase64 || undefined,
        },
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
      <h1 className="mb-1 text-xl font-semibold">Create Student Account</h1>
      <p className="mb-5 text-sm" style={{ color: "var(--muted)" }}>
        Fill in your details. Admin will approve your account before you can log in.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">

        {/* Profile photo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: 80, height: 80, borderRadius: "50%",
              background: avatarPreview ? "transparent" : "var(--accent)",
              border: "2px dashed var(--line)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", overflow: "hidden",
            }}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "28px", color: "#fff" }}>
                {name ? getInitials(name) : "📷"}
              </span>
            )}
          </div>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="btn btn-sm" style={{ fontSize: "12px" }}>
            Upload Photo
          </button>
          <input ref={fileRef} type="file" accept="image/*"
            style={{ display: "none" }} onChange={onAvatarChange} />
        </div>

        {/* Full name */}
        <div>
          <label className="label" htmlFor="name">Full Name *</label>
          <input id="name" required minLength={2} maxLength={100} className="input"
            placeholder="Your full name"
            value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Email */}
        <div>
          <label className="label" htmlFor="email">Email *</label>
          <input id="email" type="email" required autoComplete="email" className="input"
            placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {/* Password */}
        <div>
          <label className="label" htmlFor="password">Password *</label>
          <input id="password" type="password" required minLength={8} maxLength={72}
            autoComplete="new-password" className="input"
            placeholder="At least 8 characters"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {/* Phone */}
        <div>
          <label className="label" htmlFor="phone">Phone Number</label>
          <input id="phone" type="tel" className="input"
            placeholder="01XXXXXXXXX"
            value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        {/* Institute */}
        <div>
          <label className="label" htmlFor="institute">School / College / Institution</label>
          <input id="institute" className="input"
            placeholder="Where do you study?"
            value={institute} onChange={(e) => setInstitute(e.target.value)} />
        </div>

        {/* Class / Category */}
        <div>
          <label className="label" htmlFor="targetExam">
            Your Class / Exam Category *
            <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "6px", fontWeight: 400 }}>
              You will only see exams for this category
            </span>
          </label>
          <select
  id="targetExam"
  name="targetExam"
  required
  className="input" // (or whatever class your input uses)
  value={targetExam} // Make sure this matches your state variable
  onChange={(e) => setTargetExam(e.target.value)} // Make sure this matches your state setter
>
  <option value="">— Select your class or exam —</option>
  <option value="Class 9-10">SSC (Class 9-10)</option>
  <option value="HSC 11-12">HSC (11-12)</option>
  <option value="English (Basic to Advance)">English (Basic to Advance)</option>
  <option value="Admission">Admission</option>
  <option value="Nursing">Nursing</option>
  <option value="Primary Teacher">Primary Teacher</option>
  <option value="BCS">BCS Preparation</option>
  <option value="Bank Job">Bank Job</option>
  <option value="Niyogon">Niyogon Poriksha</option>
  <option value="All Job Preparation">All Job Preparation</option>
  <option value="Other">Other</option>
</select>
        </div>

        {error && <Notice tone="bad">{error}</Notice>}

        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Creating account…" : "Register as Student"}
        </button>
      </form>

      <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
        Already registered?{" "}
        <Link href="/login" className="font-semibold underline">Log in</Link>
      </p>
    </>
  );
}