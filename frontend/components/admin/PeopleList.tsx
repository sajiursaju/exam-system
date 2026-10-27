"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Role, User, UserStatus } from "@/lib/types";

type ListResponse = {
  users: User[];
  total: number;
  page: number;
  pages: number;
  viewerRole: Role;
};

const statusTabs: { label: string; value: "" | UserStatus }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Deactivated", value: "DEACTIVATED" },
];

const badgeClass: Record<UserStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  ACTIVE: "bg-green-50 text-green-700",
  DEACTIVATED: "bg-slate-100 text-slate-500",
};

export default function PeopleList({ role }: { role: "STUDENT" | "TEACHER" }) {
  const router = useRouter();
  const [data, setData] = useState<ListResponse | null>(null);
  const [status, setStatus] = useState<"" | UserStatus>("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const isAdmin = data?.viewerRole === "ADMIN";
  const title = role === "STUDENT" ? "Students" : "Teachers";
  const extraHeader = role === "STUDENT" ? "Institute / Target exam" : "Subject / Designation";
  const columnCount = isAdmin ? 6 : 4;

  // Wait 400 ms after typing stops before searching
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ role, page: String(page) });
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      setData(await api<ListResponse>(`/admin/people?${params.toString()}`));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        router.replace("/login");
        return;
      }
      setError(e instanceof ApiError ? e.message : "Could not load the list.");
    } finally {
      setLoading(false);
    }
  }, [role, page, status, search, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(user: User, next: "ACTIVE" | "DEACTIVATED") {
    if (
      next === "DEACTIVATED" &&
      !window.confirm(`Deactivate ${user.name}? They will not be able to log in.`)
    ) {
      return;
    }
    setBusyId(user.id);
    setError("");
    try {
      await api(`/admin/people/${user.id}/status`, {
        method: "PATCH",
        body: { status: next },
      });
      await load(); // reload so the filter and the totals stay correct
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not update the user.");
    } finally {
      setBusyId(null);
    }
  }

  function extraLines(u: User): [string | null | undefined, string | null | undefined] {
    return role === "STUDENT" ? [u.institute, u.targetExam] : [u.subject, u.designation];
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/admin/dashboard" className="text-sm text-indigo-600 hover:underline">
        ← Back to Dashboard
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500">{data ? `${data.total} total` : "Loading..."}</p>
        </div>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, email or phone"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:w-72"
        />
      </div>

      {/* Status tabs (admin only) */}
      {isAdmin && (
        <div className="mt-4 flex flex-wrap gap-2">
          {statusTabs.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => {
                setStatus(t.value);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                status === t.value
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">{extraHeader}</th>
              {isAdmin && <th className="px-4 py-3">Status</th>}
              <th className="px-4 py-3">Joined</th>
              {isAdmin && <th className="px-4 py-3 text-right">Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading && !data && (
              <tr>
                <td colSpan={columnCount} className="px-4 py-8 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}

            {data && data.users.length === 0 && (
              <tr>
                <td colSpan={columnCount} className="px-4 py-8 text-center text-slate-500">
                  No {title.toLowerCase()} found.
                </td>
              </tr>
            )}

            {data?.users.map((u) => {
              const [line1, line2] = extraLines(u);
              const st = (u.status ?? "PENDING") as UserStatus;
              return (
                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">{u.name}</p>
                        <p className="truncate text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {u.phone || <span className="text-slate-400">Not added</span>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700">
                      {line1 || <span className="text-slate-400">Not added</span>}
                    </p>
                    <p className="text-xs text-slate-500">{line2 || ""}</p>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass[st]}`}
                      >
                        {st}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-slate-600">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB") : "-"}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      {st === "ACTIVE" ? (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => changeStatus(u, "DEACTIVATED")}
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => changeStatus(u, "ACTIVE")}
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                          {st === "PENDING" ? "Approve" : "Activate"}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span>
            Page {data.page} of {data.pages}
          </span>
          <button
            type="button"
            disabled={page >= data.pages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}