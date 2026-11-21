// frontend/components/UsersPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { errMsg } from "@/lib/format";
import { Badge, Notice } from "@/components/ui";

type User = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  status: string;
  createdAt: string;
  targetExam?: string | null;
  institute?: string | null;
};

const CATEGORIES = [
  "All Students",
  "Class 9-10",
  "HSC 11-12",
  "English (Basic to Advance)",
  "Admission",
  "Nursing",
  "Primary Teacher",
  "BCS",
  "Bank Job",
  "Niyogon",
  "All Job Preparation",
];

export default function UsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<"ALL" | "STUDENT" | "TEACHER">("ALL");
  const [selectedCategory, setSelectedCategory] = useState("All Students");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  
  // State for the download category
  const [downloadCategory, setDownloadCategory] = useState("All");

  async function loadUsers() {
    try {
      const { users } = await api<{ users: User[] }>("/users");
      setUsers(users);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateStatus(id: number, role: string, newStatus: string) {
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      await api(`/users/${id}/status`, {
        method: "PATCH",
        body: { role, status: newStatus },
      });
      setNotice(`Status updated to ${newStatus}.`);
      await loadUsers();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(id: number, role: string) {
    if (!confirm("Are you sure? This will permanently delete the user and all their data.")) return;
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      await api(`/users/${id}?role=${role}`, {
        method: "DELETE",
      });
      setNotice("User deleted.");
      await loadUsers();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusyId(null);
    }
  }

  // Filter logic for the table
  const filteredUsers = users.filter((u) => {
    if (filterRole !== "ALL" && u.role !== filterRole) return false;
    
    if (filterRole === "STUDENT" || filterRole === "ALL") {
      if (u.role === "STUDENT" && selectedCategory !== "All Students") {
        if (!u.targetExam || !u.targetExam.includes(selectedCategory)) {
          return false;
        }
      } else if (u.role !== "STUDENT" && selectedCategory !== "All Students") {
        return false;
      }
    }

    const query = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.targetExam && u.targetExam.toLowerCase().includes(query)) ||
      (u.institute && u.institute.toLowerCase().includes(query))
    );
  });

  if (loading) return <div className="panel p-6 text-sm">Loading users...</div>;

  return (
    <div className="panel p-6">
      {/* Top Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Manage Users</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* DOWNLOAD SECTION */}
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 bg-slate-50">
            <select
              className="bg-transparent text-sm font-medium text-slate-700 outline-none px-2 py-1"
              value={downloadCategory}
              onChange={(e) => setDownloadCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.filter(c => c !== "All Students").map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <a 
              href={`${process.env.NEXT_PUBLIC_API_URL || "/api"}/users/download?targetExam=${encodeURIComponent(downloadCategory)}`}
              className="bg-teal-700 text-white hover:bg-teal-800 text-xs px-3 py-1.5 rounded-md font-semibold transition-colors"
              download
            >
              ⬇️ Download CSV
            </a>
          </div>

          {/* Role Tabs */}
          <div style={{ display: "flex", gap: "8px", background: "var(--bg)", padding: "4px", borderRadius: "8px" }}>
            {(["ALL", "STUDENT", "TEACHER"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setFilterRole(r);
                  setSelectedCategory("All Students");
                }}
                style={{
                  padding: "6px 12px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", border: "none",
                  cursor: "pointer",
                  background: filterRole === r ? "var(--surface)" : "transparent",
                  color: filterRole === r ? "var(--accent)" : "var(--muted)",
                  boxShadow: filterRole === r ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {r === "ALL" ? "All Users" : r === "STUDENT" ? "Students" : "Teachers"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="mb-4"><Notice tone="bad">{error}</Notice></div>}
      {notice && <div className="mb-4"><Notice tone="good">{notice}</Notice></div>}

      {/* Category Filter Tabs */}
      {(filterRole === "STUDENT" || filterRole === "ALL") && (
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", marginBottom: "16px", whiteSpace: "nowrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "6px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "20px", 
                border: selectedCategory === cat ? "1px solid var(--accent)" : "1px solid var(--line)",
                cursor: "pointer",
                background: selectedCategory === cat ? "var(--accent)" : "var(--surface)",
                color: selectedCategory === cat ? "#fff" : "var(--muted)",
                display: "flex", alignItems: "center", gap: "6px",
                transition: "all 0.2s",
              }}
            >
              {cat}
              <span style={{ fontSize: "14px" }}>→</span>
            </button>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="input w-full max-w-sm"
          placeholder="Search by name, email, institute, or target exam..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Target Exam / Institute</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-slate-500">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={`${u.role}-${u.id}`}>
                  <td>
                    <div className="font-medium flex items-center gap-2">
                      {u.role === "STUDENT" && <span className="text-lg">👨‍🎓</span>}
                      {u.role === "TEACHER" && <span className="text-lg">👨‍🏫</span>}
                      {u.role === "ADMIN" && <span className="text-lg">👑</span>}
                      {u.name}
                    </div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td>
                    <Badge tone={u.role === "ADMIN" ? "bad" : u.role === "TEACHER" ? "warn" : "good"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td>
                    {u.role === "STUDENT" ? (
                      <div>
                        {u.targetExam ? (
                          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded inline-block">
                            {u.targetExam}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">⚠ No target</span>
                        )}
                        {u.institute && <div className="text-xs text-slate-400 mt-1">{u.institute}</div>}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      u.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                      u.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      {u.status === "PENDING" && (
                        <button
                          onClick={() => updateStatus(u.id, u.role, "ACTIVE")}
                          disabled={busyId === u.id}
                          className="btn btn-sm btn-primary"
                        >
                          Approve
                        </button>
                      )}
                      {u.status === "ACTIVE" && u.role !== "ADMIN" && (
                        <button
                          onClick={() => updateStatus(u.id, u.role, "DEACTIVATED")}
                          disabled={busyId === u.id}
                          className="btn btn-sm"
                        >
                          Deactivate
                        </button>
                      )}
                      {u.status === "DEACTIVATED" && (
                        <button
                          onClick={() => updateStatus(u.id, u.role, "ACTIVE")}
                          disabled={busyId === u.id}
                          className="btn btn-sm btn-primary"
                        >
                          Activate
                        </button>
                      )}
                      {u.role !== "ADMIN" && (
                        <button
                          onClick={() => deleteUser(u.id, u.role)}
                          disabled={busyId === u.id}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}