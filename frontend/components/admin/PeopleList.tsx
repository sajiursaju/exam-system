// frontend/components/admin/PeopleList.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
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

const badgeStyle: Record<UserStatus, { background: string; color: string }> = {
  PENDING:     { background: "#fef3c7", color: "#b45309" },
  ACTIVE:      { background: "#dcfce7", color: "#15803d" },
  DEACTIVATED: { background: "#f1f5f9", color: "#64748b" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

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
  const extraHeader = role === "STUDENT" ? "Institute / Target Exam" : "Subject / Designation";

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 400);
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
      if (e instanceof ApiError && e.status === 401) { router.replace("/login"); return; }
      setError(e instanceof ApiError ? e.message : "Could not load the list.");
    } finally {
      setLoading(false);
    }
  }, [role, page, status, search, router]);

  useEffect(() => { load(); }, [load]);

  // ✅ FIX: send role in body so backend knows which table to update
  async function changeStatus(user: User, next: "ACTIVE" | "DEACTIVATED") {
    if (next === "DEACTIVATED" && !window.confirm(`Deactivate ${user.name}? They won't be able to log in.`)) return;
    setBusyId(user.id);
    setError("");
    try {
      await api(`/admin/people/${user.id}/status`, {
        method: "PATCH",
        body: { role, status: next }, // ✅ role added here
      });
      await load();
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
    <div>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>{title}</h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
            {data ? `${data.total} total` : "Loading…"}
          </p>
        </div>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, email or phone…"
          style={{
            padding: "8px 14px",
            fontSize: "14px",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            background: "var(--surface)",
            color: "var(--fg)",
            width: "260px",
            outline: "none",
          }}
        />
      </div>

      {/* Status tabs */}
      {isAdmin && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
          {statusTabs.map((t) => (
            <button key={t.label} type="button"
              onClick={() => { setStatus(t.value); setPage(1); }}
              style={{
                padding: "5px 16px",
                fontSize: "13px",
                borderRadius: "20px",
                border: "1px solid var(--line)",
                background: status === t.value ? "var(--accent)" : "var(--surface)",
                color: status === t.value ? "#fff" : "var(--fg)",
                cursor: "pointer",
                fontWeight: status === t.value ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div style={{ marginBottom: "12px", padding: "10px 14px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", fontSize: "13px" }}>
          {error}
        </div>
      )}

      {/* Cards grid */}
      {loading && !data ? (
        <p style={{ color: "var(--muted)", fontSize: "14px" }}>Loading…</p>
      ) : data?.users.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: "14px" }}>No {title.toLowerCase()} found.</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}>
          {data?.users.map((u) => {
            const [line1, line2] = extraLines(u);
            const st = (u.status ?? "PENDING") as UserStatus;
            const badge = badgeStyle[st];
            return (
              <div key={u.id} style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "12px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                {/* Top: avatar + name + status */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {u.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarUrl} alt={u.name}
                      style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: "var(--accent)", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px", fontWeight: 700, flexShrink: 0,
                    }}>
                      {getInitials(u.name)}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email}
                    </div>
                  </div>
                  <span style={{
                    ...badge,
                    fontSize: "11px", fontWeight: 600,
                    padding: "3px 10px", borderRadius: "20px", flexShrink: 0,
                  }}>
                    {st}
                  </span>
                </div>

                {/* Info rows */}
                <div style={{ fontSize: "13px", color: "var(--muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {u.phone && <div>📞 {u.phone}</div>}
                  {line1 && <div>🏫 {line1}</div>}
                  {line2 && (
                    <div style={{ fontWeight: 600, color: "var(--fg)", fontSize: "12px" }}>
                      🎯 {line2}
                    </div>
                  )}
                  {u.createdAt && (
                    <div>📅 Joined {new Date(u.createdAt).toLocaleDateString("en-GB")}</div>
                  )}
                </div>

                {/* Action button (admin only) */}
                {isAdmin && (
                  <div style={{ marginTop: "auto" }}>
                    {st === "ACTIVE" ? (
                      <button type="button" disabled={busyId === u.id}
                        onClick={() => changeStatus(u, "DEACTIVATED")}
                        style={{
                          width: "100%", padding: "7px", fontSize: "13px", fontWeight: 600,
                          border: "1px solid #fca5a5", borderRadius: "8px",
                          background: "#fef2f2", color: "#b91c1c", cursor: "pointer",
                        }}>
                        {busyId === u.id ? "Updating…" : "Deactivate"}
                      </button>
                    ) : (
                      <button type="button" disabled={busyId === u.id}
                        onClick={() => changeStatus(u, "ACTIVE")}
                        style={{
                          width: "100%", padding: "7px", fontSize: "13px", fontWeight: 600,
                          border: "none", borderRadius: "8px",
                          background: "var(--accent)", color: "#fff", cursor: "pointer",
                        }}>
                        {busyId === u.id ? "Updating…" : st === "PENDING" ? "✓ Approve" : "Activate"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "14px", color: "var(--muted)" }}>
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="btn" style={{ opacity: page <= 1 ? 0.4 : 1 }}>
            ← Previous
          </button>
          <span>Page {data.page} of {data.pages}</span>
          <button type="button" disabled={page >= data.pages} onClick={() => setPage(page + 1)}
            className="btn" style={{ opacity: page >= data.pages ? 0.4 : 1 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}