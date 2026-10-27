"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export default function AuthButton({ className = "" }: { className?: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api<{ user: User }>("/auth/me")
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null));
  }, []);

  if (user) {
    const href = user.role === "STUDENT" ? "/student/dashboard" : "/admin/dashboard";
    return (
      <Link href={href} className={className}>
        📊 Dashboard
      </Link>
    );
  }

  return (
    <Link href="/login" className={className}>
      🔐 Login
    </Link>
  );
}