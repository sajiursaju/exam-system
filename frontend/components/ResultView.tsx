"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { errMsg, fmtDateTime } from "@/lib/format";
import type { ResultData } from "@/lib/types";
import { ATTEMPT_LABEL, Badge, Notice, attemptTone } from "@/components/ui";

const TYPE_LABEL = { MCQ: "Multiple choice", TRUE_FALSE: "True or false", SHORT_ANSWER: "Short answer" } as const;

// Shows a finished attempt. Staff (canGrade) can also give marks to short answers.
export default function ResultView({
  data,
  canGrade = false,
  onGraded,
}: {
  data: ResultData;
  canGrade?: boolean;
  onGraded?: () => void;
}) {
  const { attempt, exam, answers } = data;
  const [marks, setMarks] = useState<Record<number, string>>(() => {
    const m: Record<number, string> = {};
    for (const a of answers) if (a.questionType === "SHORT_ANSWER") m[a.questionId] = String(a.marksObtained);
    return m;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const shortAnswers = answers.filter((a) => a.questionType === "SHORT_ANSWER");

  async function saveGrades() {
    setError("");
    setSaved(false);
    const grades = [];
    for (const a of shortAnswers) {
      const value = Number(marks[a.questionId]);
      if (!Number.isFinite(value) || value < 0 || value > a.marks) {
        return setError(`Marks for “${a.questionText.slice(0, 40)}” must be between 0 and ${a.marks}.`);
      }
      grades.push({ questionId: a.questionId, marks: value });
    }
    setBusy(true);
    try {
      await api(`/attempts/${attempt.id}/grade`, { method: "PATCH", body: { grades } });
      setSaved(true);
      onGraded?.();
    } catch (e) {
      setError(errMsg(e));
    }
    setBusy(false);
  }

  const verdict =
    data.passed === null ? { tone: "warn" as const, text: "Waiting for short answers to be graded" }
    : data.passed ? { tone: "good" as const, text: "Passed" }
    : { tone: "bad" as const, text: "Did not reach the passing marks" };

  return (
    <div className="space-y-8">
      <section className="panel grid gap-6 p-6 sm:grid-cols-[auto_1fr]">
        <div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Score</p>
          <p className="font-serif text-5xl font-semibold leading-none">
            {attempt.totalScore}
            <span className="text-2xl" style={{ color: "var(--muted)" }}> / {exam.totalMarks}</span>
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Passing marks: {exam.passingMarks}</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={verdict.tone}>{verdict.text}</Badge>
            <Badge tone={attemptTone(attempt.status)}>{ATTEMPT_LABEL[attempt.status]}</Badge>
          </div>
          {canGrade && <p><span style={{ color: "var(--muted)" }}>Student:</span> {data.student.name} ({data.student.email})</p>}
          <p><span style={{ color: "var(--muted)" }}>Started:</span> {fmtDateTime(attempt.startTime)}</p>
          {attempt.endTime && <p><span style={{ color: "var(--muted)" }}>Finished:</span> {fmtDateTime(attempt.endTime)}</p>}
          <p><span style={{ color: "var(--muted)" }}>Tab switches:</span> {attempt.tabSwitchCount}</p>
          {attempt.status === "AUTO_SUBMITTED" && (
            <p style={{ color: "var(--warn)" }}>This exam was submitted automatically (time ran out or too many tab switches).</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Answers</h2>
        <ol className="space-y-3">
          {answers.map((a, i) => {
            const isShort = a.questionType === "SHORT_ANSWER";
            const border = isShort ? "var(--warn)" : a.isCorrect ? "var(--good)" : "var(--bad)";
            return (
              <li key={a.questionId} className="panel p-4" style={{ borderLeft: `4px solid ${border}` }}>
                <p className="mb-1 text-xs" style={{ color: "var(--muted)" }}>
                  Question {i + 1} · {TYPE_LABEL[a.questionType]} · {a.marks} mark{a.marks === 1 ? "" : "s"}
                </p>
                <p className="whitespace-pre-wrap font-medium">{a.questionText}</p>

                <dl className="mt-3 space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-32 flex-none" style={{ color: "var(--muted)" }}>Student’s answer</dt>
                    <dd className="whitespace-pre-wrap">{a.selectedAnswer || <em style={{ color: "var(--muted)" }}>No answer</em>}</dd>
                  </div>
                  {!isShort && (
                    <div className="flex gap-2">
                      <dt className="w-32 flex-none" style={{ color: "var(--muted)" }}>Correct answer</dt>
                      <dd className="font-medium" style={{ color: "var(--good)" }}>{a.correctAnswer}</dd>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <dt className="w-32 flex-none" style={{ color: "var(--muted)" }}>Marks</dt>
                    <dd>
                      {isShort && canGrade ? (
                        <span className="inline-flex items-center gap-2">
                          <input type="number" min={0} max={a.marks} step="0.5" className="input" style={{ width: "5.5rem" }}
                            aria-label={`Marks for question ${i + 1}`}
                            value={marks[a.questionId] ?? "0"}
                            onChange={(e) => setMarks((m) => ({ ...m, [a.questionId]: e.target.value }))} />
                          <span>out of {a.marks}</span>
                        </span>
                      ) : isShort && a.isCorrect === null && a.selectedAnswer ? (
                        <span style={{ color: "var(--warn)" }}>Waiting for your teacher to grade this</span>
                      ) : (
                        <span>{a.marksObtained} out of {a.marks}</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ol>

        {canGrade && shortAnswers.length > 0 && (
          <div className="mt-4 space-y-3">
            {error && <Notice tone="bad">{error}</Notice>}
            {saved && <Notice tone="good">Marks saved. The total score is updated.</Notice>}
            <button className="btn btn-primary" onClick={saveGrades} disabled={busy}>
              {busy ? "Saving…" : "Save marks"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
