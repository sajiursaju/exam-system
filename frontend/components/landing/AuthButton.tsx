"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import ProfilePopup from "@/components/ProfilePopup";

export default function AuthButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Load the logged-in user (GET /api/auth/me now returns the full profile)
  useEffect(() => {
    api<{ user: User }>("/auth/me")
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null));
  }, []);

  // Close the popup on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // even if the call fails, we still reset the screen below
    }
    setUser(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  // Not logged in: the normal Login button (same look as before)
  if (!user) {
    return (
      <Link href="/login" className={className}>
        🔐 Login
      </Link>
    );
  }

  const dashboardHref = user.role === "STUDENT" ? "/student/dashboard" : "/admin/dashboard";

  // Logged in: small avatar + name, click to open the popup
  return (
    <div ref={boxRef} className="relative flex-1 xl:flex-none">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 hover:bg-slate-50"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="max-w-[120px] truncate text-sm font-semibold text-slate-700">
          {user.name}
        </span>
      </button>

      {open && (
        <ProfilePopup
          user={user}
          dashboardHref={dashboardHref}
          onClose={() => setOpen(false)}
          onLogout={logout}
        />
      )}
    </div>
  );
}