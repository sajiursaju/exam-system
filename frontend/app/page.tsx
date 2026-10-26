"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

// "/" sends you to the right place for your role.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    api<{ user: User }>("/auth/me")
      .then(({ user }) =>
        router.replace(user.role === "STUDENT" ? "/student/dashboard" : "/admin/dashboard")
      )
      .catch(() => router.replace("/login"));
  }, [router]);

  return <p className="p-8 text-sm" style={{ color: "var(--muted)" }}>Loading…</p>;
}
