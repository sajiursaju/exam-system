"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { errMsg, fmtDateTime } from "@/lib/format";
import type { Exam } from "@/lib/types";
import { Badge, Loading, Notice, STATE_LABEL, stateTone } from "@/components/ui";
import { useUser } from "@/components/Shell";

export default function AdminExamsPage() {
  const me = useUser();
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    api<{ exams: Exam[] }>("/exams")
      .then((d) => setExams(d.exams))
      .catch((e) => setError(errMsg(e)));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this exam? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api(`/exams/${id}`, { method: "DELETE" });
      setExams((prev) => prev?.filter((e) => e.id !== id) ?? null);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setDeletingId(null);
    }
  }

  const staff = me.role === "ADMIN" || me.role === "TEACHER";

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>📝 Exams</h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
            {me.role === "TEACHER" ? "Exams you created." : "All exams in the system."}
          </p>
        </div>
        {staff && (
          <Link href="/admin/exams/new" className="btn btn-primary">
            + New Exam
          </Link>
        )}
      </div>

      {error && <Notice tone="bad">{error}</Notice>}
      {!exams && !error && <Loading />}

      {exams && exams.length === 0 && (
        <div className="panel p-6 text-sm">
          <p className="mb-3">No exams yet.</p>
          {staff && (
            <Link href="/admin/exams/new" className="btn btn-primary">
              Create your first exam
            </Link>
          )}
        </div>
      )}

      {exams && exams.length > 0 && (
        <div className="panel overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Target</th>
                <th>Status</th>
                <th>Opens</th>
                <th>Closes</th>
                <th>Questions</th>
                <th>Submissions</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e, i) => (
                <tr key={e.id}>
                  <td style={{ color: "var(--muted)", fontSize: "13px" }}>{i + 1}</td>
                  <td className="font-medium">{e.title}</td>
                  <td style={{ fontSize: "13px", color: "var(--muted)" }}>
                    {e.targetExam ?? <span style={{ color: "var(--muted)" }}>—</span>}
                  </td>
                  <td>
                    <Badge tone={stateTone(e.state)}>{STATE_LABEL[e.state]}</Badge>
                  </td>
                  <td>{fmtDateTime(e.startTime)}</td>
                  <td>{fmtDateTime(e.endTime)}</td>
                  <td>{e._count?.questions ?? 0}</td>
                  <td>{e._count?.attempts ?? 0}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      {/* Manage button — goes to existing exam detail page */}
                      <Link href={`/admin/exams/${e.id}`} className="btn btn-sm">
                        Manage
                      </Link>

                      {/* Delete — only admin or the teacher who owns it */}
                      {staff && (
                        <button
                          onClick={() => handleDelete(e.id)}
                          disabled={deletingId === e.id}
                          className="btn btn-sm"
                          style={{
                            color: "#b91c1c",
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            opacity: deletingId === e.id ? 0.5 : 1,
                          }}
                        >
                          {deletingId === e.id ? "..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}