
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
    let alive = true;

    api<{ user: User }>("/profile/me")
      .then(({ user }) => {
        if (!alive) return;

        if (user.role !== "STUDENT") {
          router.replace("/admin/dashboard");
          return;
        }

        setUser(user);
      })
      .catch((e) => {
        if (!alive) return;

        if (e instanceof ApiError && e.status === 401) {
          router.replace("/login");
        } else {
          setError("Could not load your profile.");
        }
      });

    return () => {
      alive = false;
    };
  }, [router]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Back link */}
      <Link
        href="/student/dashboard"
        className="text-sm font-medium text-indigo-600 hover:underline"
      >
        ← Back to Dashboard
      </Link>

      {/* Heading */}
      <div className="mb-6 mt-5">
        <h1 className="text-2xl font-bold text-slate-800">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and update your personal information.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {!user && !error && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            Loading your profile...
          </p>
        </div>
      )}

      {/* Profile form */}
      {user && <ProfileForm user={user} onSaved={setUser} />}
    </div>
  );
}
