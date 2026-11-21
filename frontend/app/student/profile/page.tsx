"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";
import ProfileForm from "@/components/ProfileForm";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ user: User }>("/profile/me")
      .then(({ user }) => setUser(user))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/login"); // not logged in
        } else {
          setError("Could not load your profile.");
        }
      });
  }, [router]);

  const dashboardHref =
    user && user.role === "STUDENT" ? "/student/dashboard" : "/admin/dashboard";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href={user ? dashboardHref : "/"} className="text-sm text-indigo-600 hover:underline">
        ← Back to {user ? "Dashboard" : "Home"}
      </Link>

      <div className="mt-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        {!user && !error && <p className="text-slate-500">Loading...</p>}
        {user && <ProfileForm user={user} onSaved={setUser} />}
      </div>
    </main>
  );
}