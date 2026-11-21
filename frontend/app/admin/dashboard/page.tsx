// frontend/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Added this
import { api } from "@/lib/api";
import { errMsg, fmtDateTime } from "@/lib/format";
import type { Exam } from "@/lib/types";
import { Badge, Loading, Notice, STATE_LABEL, stateTone } from "@/components/ui";
import { useUser } from "@/components/Shell";
import UsersPanel from "@/components/UsersPanel";

type Counts = { students: number; teachers: number; pending: number };

function StatCard({ label, value, icon, href }: { label: string; value: number | string; icon: string; href?: string }) {
  const inner = (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--line)",
      borderRadius: "10px",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      transition: "box-shadow 0.15s",
      cursor: href ? "pointer" : "default",
    }}>
      <div style={{
        fontSize: "28px",
        width: 48, height: 48,
        background: "var(--accent-soft, #f0f4ff)",
        borderRadius: "10px",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>{label}</div>
      </div>
    </div>
  );
  if (href) return <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>{inner}</Link>;
  return inner;
}

export default function AdminDashboard() {
  const me = useUser();
  const pathname = usePathname(); // Get the current pathname
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ exams: Exam[] }>("/exams")
      .then((d) => setExams(d.exams))
      .catch((e) => setError(errMsg(e)));

    if (me.role === "ADMIN" || me.role === "TEACHER") {
      api<Counts>("/admin/people/counts")
        .then(setCounts)
        .catch(() => setCounts(null));
    }
  }, [me.role]);

  // SCROLL LOGIC: Automatically scroll to #users if it's in the URL
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#users") {
      // Small timeout to ensure the UsersPanel table has time to render
      const timer = setTimeout(() => {
        const element = document.getElementById("users");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const open = exams?.filter((e) => e.state === "ONGOING").length ?? 0;
  const submissions = exams?.reduce((n, e) => n + (e._count?.attempts ?? 0), 0) ?? 0;

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
            {me.role === "TEACHER" ? "You see only your exams." : "Overview of all activity."}
          </p>
        </div>
        <Link href="/admin/exams/new" className="btn btn-primary">+ New Exam</Link>
      </div>

      {/* Stat cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "16px",
        marginBottom: "32px",
      }}>
        {me.role === "ADMIN" && (
          <StatCard label="Total Students" value={counts?.students ?? "—"} icon="🎓" href="/admin/dashboard#users" />
        )}
        {me.role === "ADMIN" && (
          <StatCard label="Teachers" value={counts?.teachers ?? "—"} icon="👨‍🏫" href="/admin/dashboard#users" />
        )}
        {me.role === "ADMIN" && counts?.pending ? (
          <StatCard label="Pending Approval" value={counts.pending} icon="⏳" href="/admin/dashboard#users" />
        ) : null}
        <StatCard label="Total Exams" value={exams?.length ?? "—"} icon="📝" />
        <StatCard label="Live Now" value={open} icon="🟢" />
        <StatCard label="Submissions" value={submissions} icon="📋" />
      </div>

      {error && <Notice tone="bad">{error}</Notice>}
      {!exams && !error && <Loading />}

      {/* Exams table */}
      {exams && (
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
            All Exams
          </h2>

          {exams.length === 0 ? (
            <div className="panel p-6 text-sm">
              <p className="mb-3">No exams yet.</p>
              <Link href="/admin/exams/new" className="btn btn-primary">Create your first exam</Link>
            </div>
          ) : (
            <div className="panel overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Opens</th>
                    <th>Closes</th>
                    <th>Questions</th>
                    <th>Submissions</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((e) => (
                    <tr key={e.id}>
                      <td className="font-medium">{e.title}</td>
                      <td><Badge tone={stateTone(e.state)}>{STATE_LABEL[e.state]}</Badge></td>
                      <td>{fmtDateTime(e.startTime)}</td>
                      <td>{fmtDateTime(e.endTime)}</td>
                      <td>{e._count?.questions ?? 0}</td>
                      <td>{e._count?.attempts ?? 0}</td>
                      <td className="text-right">
                        <Link href={`/admin/exams/${e.id}`} className="btn btn-sm">Manage</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users panel (admin only) */}
      {me.role === "ADMIN" && (
        <div id="users" style={{ marginTop: "40px" }}> {/* <-- ADDED id="users" HERE */}
          <UsersPanel />
        </div>
      )}
    </div>
  );
}