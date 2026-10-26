"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { errMsg, fmtDateTime } from "@/lib/format";
import type { Exam, MyAttempt } from "@/lib/types";
import {
  ATTEMPT_LABEL, Badge, Loading, Notice, PageTitle, STATE_LABEL, attemptTone, stateTone,
} from "@/components/ui";

export default function StudentDashboard() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [history, setHistory] = useState<MyAttempt[]>([]);
  const [error, setError] = useState("");
  const [startingId, setStartingId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api<{ exams: Exam[] }>("/exams"),
      api<{ attempts: MyAttempt[] }>("/attempts/mine"),
    ])
      .then(([e, a]) => {
        setExams(e.exams);
        setHistory(a.attempts);
      })
      .catch((err) => setError(errMsg(err)));
  }, []);

  async function start(exam: Exam, resuming: boolean) {
    if (!resuming) {
      const ok = confirm(
        `Start “${exam.title}”?\n\nYou have ${exam.durationMinutes} minutes and only one attempt. The timer starts now.`
      );
      if (!ok) return;
    }
    setError("");
    setStartingId(exam.id);
    try {
      const res = await api<{ attempt: { id: number } }>("/attempts/start", { body: { examId: exam.id } });
      router.push(`/student/exam/${res.attempt.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.data?.attemptId) {
        router.push(`/student/results/${err.data.attemptId}`);
        return;
      }
      setError(errMsg(err));
      setStartingId(null);
    }
  }

  return (
    <>
      <PageTitle title="Your exams" />
      {error && <div className="mb-4"><Notice tone="bad">{error}</Notice></div>}
      {!exams && !error && <Loading />}

      {exams && exams.length === 0 && (
        <p className="panel p-6 text-sm">No exams have been published yet. Check back later.</p>
      )}

      {exams && exams.length > 0 && (
        <ul className="panel divide-y" style={{ borderColor: "var(--line)" }}>
          {exams.map((exam) => {
            const attempt = exam.attempts?.[0];
            return (
              <li key={exam.id} className="flex flex-wrap items-center justify-between gap-4 p-4"
                style={{ borderColor: "var(--line)" }}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{exam.title}</h2>
                    <Badge tone={stateTone(exam.state)}>{STATE_LABEL[exam.state]}</Badge>
                  </div>
                  {exam.description && <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{exam.description}</p>}
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    {exam.durationMinutes} minutes · {exam.totalMarks} marks (pass {exam.passingMarks}) ·{" "}
                    {exam._count?.questions ?? 0} questions
                  </p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Open {fmtDateTime(exam.startTime)} to {fmtDateTime(exam.endTime)}
                  </p>
                </div>

                <div className="text-right">
                  {attempt && attempt.status === "IN_PROGRESS" ? (
                    <button className="btn btn-primary" disabled={startingId === exam.id} onClick={() => start(exam, true)}>
                      Resume exam
                    </button>
                  ) : attempt ? (
                    <Link href={`/student/results/${attempt.id}`} className="btn">View result</Link>
                  ) : exam.state === "ONGOING" ? (
                    <button className="btn btn-primary" disabled={startingId === exam.id} onClick={() => start(exam, false)}>
                      {startingId === exam.id ? "Starting…" : "Start exam"}
                    </button>
                  ) : exam.state === "UPCOMING" ? (
                    <span className="text-sm" style={{ color: "var(--muted)" }}>Opens {fmtDateTime(exam.startTime)}</span>
                  ) : (
                    <span className="text-sm" style={{ color: "var(--muted)" }}>Closed, not attempted</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-xl font-semibold">Your attempts</h2>
        {history.length === 0 ? (
          <p className="panel p-4 text-sm" style={{ color: "var(--muted)" }}>You have not taken an exam yet.</p>
        ) : (
          <div className="panel overflow-x-auto">
            <table className="table">
              <thead>
                <tr><th>Exam</th><th>Status</th><th>Score</th><th>Started</th><th></th></tr>
              </thead>
              <tbody>
                {history.map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.exam.title}</td>
                    <td><Badge tone={attemptTone(a.status)}>{ATTEMPT_LABEL[a.status]}</Badge></td>
                    <td>{a.status === "IN_PROGRESS" ? "—" : `${a.totalScore} / ${a.exam.totalMarks}`}</td>
                    <td>{fmtDateTime(a.startTime)}</td>
                    <td className="text-right">
                      {a.status === "IN_PROGRESS" ? (
                        <Link href={`/student/exam/${a.id}`} className="btn btn-sm btn-primary">Resume</Link>
                      ) : (
                        <Link href={`/student/results/${a.id}`} className="btn btn-sm">View result</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
