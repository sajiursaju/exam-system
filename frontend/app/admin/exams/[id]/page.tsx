"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { errMsg, fmtDateTime } from "@/lib/format";
import type { AttemptRow, Exam, Question } from "@/lib/types";
import {
  ATTEMPT_LABEL, Badge, Loading, Notice, PageTitle, STATE_LABEL, attemptTone, stateTone,
} from "@/components/ui";
import QuestionForm from "@/components/QuestionForm";

const TYPE_LABEL = { MCQ: "Multiple choice", TRUE_FALSE: "True or false", SHORT_ANSWER: "Short answer" } as const;

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [editing, setEditing] = useState<Question | "new" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [e, q, a] = await Promise.all([
        api<{ exam: Exam }>(`/exams/${id}`),
        api<{ questions: Question[] }>(`/exams/${id}/questions`),
        api<{ attempts: AttemptRow[] }>(`/attempts/exam/${id}`),
      ]);
      setExam(e.exam);
      setQuestions(q.questions);
      setAttempts(a.attempts);
      setError("");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function removeQuestion(q: Question) {
    if (!confirm("Delete this question?")) return;
    setNotice("");
    try {
      await api(`/questions/${q.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setNotice(errMsg(err));
    }
  }

  async function removeExam() {
    if (!confirm("Delete this exam, its questions and every submission? This cannot be undone.")) return;
    try {
      await api(`/exams/${id}`, { method: "DELETE" });
      router.replace("/admin/dashboard");
    } catch (err) {
      setNotice(errMsg(err));
    }
  }

  if (loading) return <Loading />;
  if (error || !exam) {
    return (
      <>
        <Notice tone="bad">{error || "Exam not found."}</Notice>
        <p className="mt-4"><Link href="/admin/dashboard" className="btn">Back to exams</Link></p>
      </>
    );
  }

  const locked = attempts.length > 0;
  const marksSum = questions.reduce((n, q) => n + q.marks, 0);

  return (
    <>
      <PageTitle title={exam.title}>
        <Badge tone={stateTone(exam.state)}>{STATE_LABEL[exam.state]}</Badge>
        <button className="btn btn-danger" onClick={removeExam}>Delete exam</button>
      </PageTitle>

      {notice && <div className="mb-4"><Notice tone="bad">{notice}</Notice></div>}

      <dl className="panel mb-8 grid gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-3">
        <div><dt style={{ color: "var(--muted)" }}>Opens</dt><dd className="font-medium">{fmtDateTime(exam.startTime)}</dd></div>
        <div><dt style={{ color: "var(--muted)" }}>Closes</dt><dd className="font-medium">{fmtDateTime(exam.endTime)}</dd></div>
        <div><dt style={{ color: "var(--muted)" }}>Time allowed</dt><dd className="font-medium">{exam.durationMinutes} minutes</dd></div>
        <div><dt style={{ color: "var(--muted)" }}>Total / passing marks</dt><dd className="font-medium">{exam.totalMarks} / {exam.passingMarks}</dd></div>
        <div><dt style={{ color: "var(--muted)" }}>Tab switches allowed</dt><dd className="font-medium">{exam.maxTabSwitches === 0 ? "Not checked" : exam.maxTabSwitches}</dd></div>
        <div><dt style={{ color: "var(--muted)" }}>Question order</dt><dd className="font-medium">{exam.shuffleQuestions ? "Shuffled per student" : "Fixed"}</dd></div>
        {exam.description && <div className="sm:col-span-3"><dt style={{ color: "var(--muted)" }}>Description</dt><dd>{exam.description}</dd></div>}
      </dl>

      {/* ---------- Questions ---------- */}
      <section className="mb-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
          {!locked && editing === null && (
            <button className="btn btn-primary" onClick={() => setEditing("new")}>Add question</button>
          )}
        </div>

        {locked && (
          <div className="mb-3">
            <Notice tone="warn">
              Students have already started this exam, so the questions are locked.
            </Notice>
          </div>
        )}

        {questions.length > 0 && marksSum !== exam.totalMarks && (
          <div className="mb-3">
            <Notice tone="warn">
              The questions add up to {marksSum} marks, but the exam total is {exam.totalMarks}.
            </Notice>
          </div>
        )}

        {editing !== null && (
          <div className="mb-4">
            <QuestionForm
              key={editing === "new" ? "new" : editing.id}
              examId={exam.id}
              question={editing === "new" ? undefined : editing}
              onCancel={() => setEditing(null)}
              onDone={() => {
                setEditing(null);
                load();
              }}
            />
          </div>
        )}

        {questions.length === 0 ? (
          <p className="panel p-4 text-sm" style={{ color: "var(--muted)" }}>
            No questions yet. Students cannot start the exam until you add at least one.
          </p>
        ) : (
          <ol className="space-y-3">
            {questions.map((q, i) => (
              <li key={q.id} className="panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs" style={{ color: "var(--muted)" }}>
                      Question {i + 1} · {TYPE_LABEL[q.questionType]} · {q.marks} mark{q.marks === 1 ? "" : "s"}
                    </p>
                    <p className="whitespace-pre-wrap font-medium">{q.questionText}</p>
                    {q.options && (
                      <ul className="mt-2 space-y-1 text-sm">
                        {q.options.map((o) => (
                          <li key={o} className={o === q.correctAnswer ? "font-semibold" : ""}
                            style={{ color: o === q.correctAnswer ? "var(--good)" : "var(--muted)" }}>
                            {o === q.correctAnswer ? "✓ " : "• "}{o}
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.questionType === "SHORT_ANSWER" && (
                      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Graded by hand after submission.</p>
                    )}
                  </div>
                  {!locked && (
                    <div className="flex gap-2">
                      <button className="btn btn-sm" onClick={() => setEditing(q)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => removeQuestion(q)}>Delete</button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ---------- Submissions ---------- */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Submissions ({attempts.length})</h2>
          {attempts.length > 0 && (
            <a className="btn" href={`/api/attempts/exam/${exam.id}/export`}>Download CSV for Excel</a>
          )}
        </div>

        {attempts.length === 0 ? (
          <p className="panel p-4 text-sm" style={{ color: "var(--muted)" }}>
            Nobody has started this exam yet.
          </p>
        ) : (
          <div className="panel overflow-x-auto">
            <table className="table">
              <thead>
                <tr><th>Student</th><th>Status</th><th>Score</th><th>Tab switches</th><th>Started</th><th></th></tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className="font-medium">{a.student.name}</span>
                      <span className="block text-xs" style={{ color: "var(--muted)" }}>{a.student.email}</span>
                    </td>
                    <td><Badge tone={attemptTone(a.status)}>{ATTEMPT_LABEL[a.status]}</Badge></td>
                    <td>{a.status === "IN_PROGRESS" ? "—" : `${a.totalScore} / ${exam.totalMarks}`}</td>
                    <td>{a.tabSwitchCount}</td>
                    <td>{fmtDateTime(a.startTime)}</td>
                    <td className="text-right">
                      {a.status === "IN_PROGRESS" ? (
                        <span className="text-xs" style={{ color: "var(--muted)" }}>Still answering</span>
                      ) : (
                        <Link href={`/admin/attempts/${a.id}`} className="btn btn-sm">Review and grade</Link>
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
