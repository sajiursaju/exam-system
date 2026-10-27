"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { errMsg, fmtDateTime } from "@/lib/format";
import type { Exam } from "@/lib/types";
import { Badge, Loading, Notice, PageTitle, STATE_LABEL, stateTone } from "@/components/ui";
import { useUser } from "@/components/Shell";
import UsersPanel from "@/components/UsersPanel";
import DashboardNav from "@/components/admin/DashboardNav";

export default function AdminDashboard() {
  const me = useUser();
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ exams: Exam[] }>("/exams")
      .then((d) => setExams(d.exams))
      .catch((e) => setError(errMsg(e)));
  }, []);

  const open = exams?.filter((e) => e.state === "ONGOING").length ?? 0;
  const submissions = exams?.reduce((n, e) => n + (e._count?.attempts ?? 0), 0) ?? 0;

  return (
    <>
      <PageTitle title="Exams">
        <Link href="/admin/exams/new" className="btn btn-primary">New exam</Link>
      </PageTitle>

      <DashboardNav role={me.role} />

      {error && <Notice tone="bad">{error}</Notice>}
      {!exams && !error && <Loading />}

      {exams && (
        <>
          <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>
            {exams.length} exam{exams.length === 1 ? "" : "s"}, {open} open now, {submissions} submission
            {submissions === 1 ? "" : "s"} in total.
            {me.role === "TEACHER" && " You see only the exams you created."}
          </p>

          {exams.length === 0 ? (
            <div className="panel p-6 text-sm">
              <p className="mb-3">You have not created an exam yet.</p>
              <Link href="/admin/exams/new" className="btn btn-primary">Create your first exam</Link>
            </div>
          ) : (
            <div className="panel overflow-x-auto">
              <table className="table">
                <thead>
                  <tr><th>Title</th><th>Status</th><th>Opens</th><th>Closes</th><th>Questions</th><th>Submissions</th><th></th></tr>
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
        </>
      )}

      {me.role === "ADMIN" && <UsersPanel />}
    </>
  );
}