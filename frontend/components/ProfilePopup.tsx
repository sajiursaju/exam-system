// frontend/components/ProfilePopup.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type { User } from "@/lib/types";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`truncate text-right ${value ? "text-slate-800" : "text-slate-400"}`}>
        {value || "Not added"}
      </span>
    </div>
  );
}

export default function ProfilePopup({
  user,
  dashboardHref,
  onClose,
  onLogout,
}: {
  user: User;
  dashboardHref: string;
  onClose: () => void;
  onLogout: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const linkBtn = "block rounded-lg px-3 py-2 text-center text-sm font-semibold";
  
  // Routes to the correct profile page based on role
  const profileHref = user.role === "STUDENT" ? "/student/profile" : "/admin/profile";

  // Since you don't have a dedicated "all results" page yet, 
  // we just send them to the dashboard where their attempts are listed.
  const resultsHref = user.role === "STUDENT" ? "/student/dashboard" : "/admin/dashboard";

  return (
    <div
      role="dialog"
      className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
    >
      {/* Top: photo, name, role */}
      <div className="flex items-center gap-3">
        {user.avatarUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-14 w-14 rounded-full border border-slate-200 object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-bold text-slate-800">{user.name}</p>
          <span className="inline-block rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
            {user.role}
          </span>
        </div>
      </div>

      {/* Short summary */}
      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
        <Row label="Email" value={user.email} />
        <Row label="Phone" value={user.phone} />
        {user.role === "STUDENT" && (
          <>
            <Row label="Institute" value={user.institute} />
            <Row label="Target exam" value={user.targetExam} />
          </>
        )}
        {user.role === "TEACHER" && (
          <>
            <Row label="Designation" value={user.designation} />
            <Row label="Subject" value={user.subject} />
          </>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-4 space-y-2">
        <Link
          href={profileHref}
          onClick={onClose}
          className={`${linkBtn} bg-teal-700 text-white hover:bg-teal-800`}
        >
          ✏️ Edit Profile
        </Link>

        {user.role === "STUDENT" && (
          <Link
            href={resultsHref}
            onClick={onClose}
            className={`${linkBtn} border border-teal-700 text-teal-700 hover:bg-teal-50`}
          >
            📄 View Results
          </Link>
        )}

        <Link
          href={dashboardHref}
          onClick={onClose}
          className={`${linkBtn} border border-slate-300 text-slate-700 hover:bg-slate-50`}
        >
          📊 Dashboard
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className={`${linkBtn} w-full text-red-600 hover:bg-red-50`}
        >
          Logout
        </button>
      </div>
    </div>
  );
}