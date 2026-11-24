
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Role } from "@/lib/types";

type Counts = { students: number; teachers?: number; pending?: number };

export default function DashboardNav({ role }: { role: Role }) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const allowed = role === "ADMIN" || role === "TEACHER";

  useEffect(() => {
    if (!allowed) return;

    api<Counts>("/admin/people/counts")
      .then(setCounts)
      .catch(() => setCounts(null)); // if it fails, the buttons just show without numbers
  }, [allowed]);

  if (!allowed) return null;

  return (
    <div className="mb-6 flex flex-wrap gap-3">

      {/* STUDENT LIST */}
      <Link
        href="/admin/students"
        className="group inline-flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        style={{
          background: "#ffffff",
          borderColor: "#ccfbf1",
          color: "#0f172a",
        }}
      >
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
          style={{
            background: "#ccfbf1",
            color: "#0f766e",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </span>

        <span className="flex flex-col">
          <span className="text-sm font-bold">Student List</span>
          <span className="text-xs text-slate-500">
            Manage students
          </span>
        </span>

        {counts && (
          <span
            className="ml-2 rounded-full px-3 py-1 text-xs font-bold"
            style={{
              background: "#0f172a",
              color: "#5eead4",
            }}
          >
            {counts.students}
          </span>
        )}

        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="ml-1 h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Link>

      {/* TEACHER LIST - ADMIN ONLY */}
      {role === "ADMIN" && (
        <Link
          href="/admin/teachers"
          className="group inline-flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          style={{
            background: "#ffffff",
            borderColor: "#bfdbfe",
            color: "#0f172a",
          }}
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "#dbeafe",
              color: "#1d4ed8",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3 2 8l10 5 10-5-10-5Z" />
              <path d="m6 10 6 6 6-6M2 8v8m20-8v8M6 18c3 2 9 2 12 0" />
            </svg>
          </span>

          <span className="flex flex-col">
            <span className="text-sm font-bold">Teacher List</span>
            <span className="text-xs text-slate-500">
              Manage teachers
            </span>
          </span>

          {counts && counts.teachers !== undefined && (
            <span
              className="ml-2 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                background: "#0f172a",
                color: "#93c5fd",
              }}
            >
              {counts.teachers}
            </span>
          )}

          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="ml-1 h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      )}
    </div>
  );
}
