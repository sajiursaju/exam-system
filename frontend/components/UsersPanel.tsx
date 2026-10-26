"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { errMsg, fmtDateTime } from "@/lib/format";
import type { User, UserStatus } from "@/lib/types";
import { Badge, Loading, Notice, type Tone } from "@/components/ui";
import { useUser } from "@/components/Shell";

const STATUS_TONE: Record<UserStatus, Tone> = { PENDING: "warn", ACTIVE: "good", DEACTIVATED: "neutral" };

// Admin only: approve new accounts, deactivate or re-activate people.
export default function UsersPanel() {
  const me = useUser();
  const [users, setUsers] = useState<User[] | null>(null);
  const [filter, setFilter] = useState<"" | UserStatus>("PENDING");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const q = filter ? `?status=${filter}` : "";
      const d = await api<{ users: User[] }>(`/users${q}`);
      setUsers(d.users);
      setError("");
    } catch (e) {
      setError(errMsg(e));
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: number, status: "ACTIVE" | "DEACTIVATED") {
    setBusyId(id);
    try {
      await api(`/users/${id}/status`, { method: "PATCH", body: { status } });
      await load();
    } catch (e) {
      setError(errMsg(e));
    }
    setBusyId(null);
  }

  return (
    <section className="mt-10">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">People</h2>
        <select className="input" style={{ width: "auto" }} value={filter}
          onChange={(e) => setFilter(e.target.value as "" | UserStatus)} aria-label="Filter people by status">
          <option value="PENDING">Waiting for approval</option>
          <option value="ACTIVE">Active</option>
          <option value="DEACTIVATED">Deactivated</option>
          <option value="">Everyone</option>
        </select>
      </div>

      {error && <Notice tone="bad">{error}</Notice>}
      {!users && !error && <Loading />}

      {users && users.length === 0 && (
        <p className="panel p-4 text-sm" style={{ color: "var(--muted)" }}>
          {filter === "PENDING" ? "No accounts are waiting for approval." : "No people match this filter."}
        </p>
      )}

      {users && users.length > 0 && (
        <div className="panel overflow-x-auto">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role.toLowerCase()}</td>
                  <td><Badge tone={STATUS_TONE[u.status ?? "PENDING"]}>{(u.status ?? "").toLowerCase()}</Badge></td>
                  <td>{u.createdAt ? fmtDateTime(u.createdAt) : ""}</td>
                  <td className="text-right">
                    {u.id === me.id ? (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>You</span>
                    ) : u.status === "ACTIVE" ? (
                      <button className="btn btn-sm btn-danger" disabled={busyId === u.id}
                        onClick={() => setStatus(u.id, "DEACTIVATED")}>Deactivate</button>
                    ) : (
                      <button className="btn btn-sm btn-primary" disabled={busyId === u.id}
                        onClick={() => setStatus(u.id, "ACTIVE")}>
                        {u.status === "PENDING" ? "Approve" : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
