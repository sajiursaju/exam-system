"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { Loading } from "@/components/ui";

const UserContext = createContext<User | null>(null);

export function useUser(): User {
  const user = useContext(UserContext);
  if (!user) throw new Error("useUser must be used inside <Shell>");
  return user;
}

// Wraps the admin area ("staff") or the student area ("student").
// Checks who you are, sends you to the right area, and draws the header.
export default function Shell({
  area,
  children,
}: {
  area: "staff" | "student";
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let alive = true;
    api<{ user: User }>("/auth/me")
      .then(({ user }) => {
        if (!alive) return;
        const isStaff = user.role !== "STUDENT";
        if (area === "staff" && !isStaff) router.replace("/student/dashboard");
        else if (area === "student" && isStaff) router.replace("/admin/dashboard");
        else setUser(user);
      })
      .catch(() => {
        if (alive) router.replace("/login");
      });
    return () => {
      alive = false;
    };
  }, [area, router]);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  if (!user) return <div className="mx-auto max-w-5xl px-4"><Loading /></div>;

  // While answering an exam, hide the menu so nothing pulls the student away.
  const focusMode = pathname.startsWith("/student/exam/");
  const home = area === "staff" ? "/admin/dashboard" : "/student/dashboard";

  return (
    <UserContext.Provider value={user}>
      {!focusMode && (
        <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <Link href={home} className="font-serif text-lg font-semibold" style={{ color: "var(--accent)" }}>
              Exam Portal
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href={home} className="font-medium hover:underline">Dashboard</Link>
              {area === "staff" && (
                <Link href="/admin/exams/new" className="font-medium hover:underline">New exam</Link>
              )}
            </nav>
            <div className="ml-auto flex items-center gap-3 text-sm">
              <span style={{ color: "var(--muted)" }}>
                {user.name} ({user.role.toLowerCase()})
              </span>
              <button onClick={logout} className="btn btn-sm">Log out</button>
            </div>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </UserContext.Provider>
  );
}
