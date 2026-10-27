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
    <div className="mb-4 flex flex-wrap gap-2">
      <Link href="/admin/students" className="btn">
        Student List{counts ? ` (${counts.students})` : ""}
      </Link>

      {role === "ADMIN" && (
        <Link href="/admin/teachers" className="btn">
          Teacher List{counts && counts.teachers !== undefined ? ` (${counts.teachers})` : ""}
        </Link>
      )}
    </div>
  );
}