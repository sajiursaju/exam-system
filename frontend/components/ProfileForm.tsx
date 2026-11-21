// frontend/components/ProfileForm.tsx
"use client";

import { useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

type Field = {
  key: string;
  label: string;
  type?: "text" | "tel" | "date" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
};

const baseFields: Field[] = [
  { key: "phone", label: "Phone", type: "tel", placeholder: "01XXXXXXXXX" },
  { key: "address", label: "Address", type: "textarea", placeholder: "Your address" },
];

const studentFields: Field[] = [
  { key: "studentCode", label: "Student ID", placeholder: "e.g. ST-1001" },
  { key: "institute", label: "Institute", placeholder: "School / college / university" },
  { 
    key: "targetExam", 
    label: "Target Exam", 
    type: "select", 
    options: [
      "Class 9-10",
      "HSC 11-12",
      "English (Basic to Advance)",
      "Admission",
      "Nursing",
      "Primary Teacher",
      "BCS",
      "Bank Job",
      "Niyogon",
      "All Job Preparation",
    ] 
  },
  { key: "dateOfBirth", label: "Date of Birth", type: "date" },
];

const teacherFields: Field[] = [
  { key: "designation", label: "Designation", placeholder: "e.g. Senior Lecturer" },
  { key: "subject", label: "Subject", placeholder: "e.g. Bangla, Math" },
  { key: "qualification", label: "Qualification", placeholder: "e.g. MSc in Physics" },
  { key: "bio", label: "About", type: "textarea", placeholder: "A short introduction" },
];

function fieldsFor(user: User): Field[] {
  if (user.role === "STUDENT") return [...baseFields, ...studentFields];
  if (user.role === "TEACHER") return [...baseFields, ...teacherFields];
  return baseFields;
}

function getVal(user: User, key: string): string {
  const v = (user as unknown as Record<string, unknown>)[key];
  if (typeof v !== "string") return "";
  return key === "dateOfBirth" ? v.slice(0, 10) : v;
}

function showVal(user: User, f: Field): string {
  const v = getVal(user, f.key);
  if (!v) return "Not added";
  if (f.key === "dateOfBirth") {
    return new Date(v).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
    });
  }
  return v;
}

const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600";

export default function ProfileForm({ user, onSaved }: { user: User; onSaved: (user: User) => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [imgError, setImgError] = useState(false); // Track if image fails to load
  const fileRef = useRef<HTMLInputElement>(null);

  const fields = fieldsFor(user);

  function startEdit() {
    const initial: Record<string, string> = { name: user.name };
    for (const f of fields) initial[f.key] = getVal(user, f.key);
    setForm(initial);
    setError("");
    setNotice("");
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError("");
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const { user: updated } = await api<{ user: User }>("/profile/me", {
        method: "PUT",
        body: form,
      });
      onSaved(updated);
      setEditing(false);
      setNotice("Profile saved.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; 
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPG, PNG or WebP images are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be 2 MB or smaller.");
      return;
    }

    setUploading(true);
    setError("");
    setNotice("");
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const { user: updated } = await api<{ user: User }>("/profile/me/avatar", {
        method: "POST",
        body: fd,
      });
      onSaved(updated);
      setNotice("Photo updated.");
      setImgError(false); // Reset image error on new upload
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Photo upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* SHOW IMAGE IF URL EXISTS AND NO ERROR */}
            {user.avatarUrl && !imgError ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="h-24 w-24 rounded-full border border-slate-200 object-cover" 
                onError={() => setImgError(true)}
              />
            ) : (
              /* FALLBACK TO INITIALS */
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 text-3xl font-bold text-teal-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="absolute -bottom-1 -right-1 rounded-full bg-teal-700 px-2.5 py-1 text-xs font-semibold text-white shadow hover:bg-teal-800 disabled:opacity-60">
              {uploading ? "..." : "📷"}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickPhoto} className="hidden" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">{user.role}</span>
          </div>
        </div>

        {!editing ? (
          <button type="button" onClick={startEdit} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
            ✏️ Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={cancelEdit} disabled={saving} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {notice && !error && <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Name</label>
          {editing ? (
            <input className={inputClass} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          ) : (
            <p className="text-sm text-slate-800">{user.name}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Email</label>
          <p className="text-sm text-slate-800">{user.email}</p>
        </div>

        {fields.map((f) => (
          <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">{f.label}</label>
            {editing ? (
              f.type === "select" ? (
                <select 
                  className={inputClass} 
                  value={form[f.key] ?? ""} 
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                >
                  <option value="">— Select —</option>
                  {f.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea rows={3} className={inputClass} placeholder={f.placeholder} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              ) : (
                <input type={f.type ?? "text"} className={inputClass} placeholder={f.placeholder} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              )
            ) : (
              <p className={`whitespace-pre-line text-sm ${getVal(user, f.key) ? "text-slate-800" : "text-slate-400"}`}>
                {showVal(user, f)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}