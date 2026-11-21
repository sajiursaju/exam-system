// frontend/app/admin/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";
import ProfileForm from "@/components/ProfileForm";
import { Loading, Notice } from "@/components/ui";

export default function AdminProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ user: User }>("/profile/me")
      .then(({ user }) => setUser(user))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/admin/login");
        } else {
          setError("Could not load your profile.");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/dashboard" className="text-sm text-teal-700 hover:underline font-medium">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold font-serif mt-2 text-slate-800">Admin Profile</h1>
        <p className="text-sm text-slate-500">Manage your personal account details.</p>
      </div>

      {error && <Notice tone="bad">{error}</Notice>}
      
      {user && (
        <div className="mt-4">
          <ProfileForm user={user} onSaved={setUser} />
        </div>
      )}
    </div>
  );
}