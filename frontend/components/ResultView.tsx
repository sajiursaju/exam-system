
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { errMsg, fmtDateTime } from "@/lib/format";
import type { ResultData } from "@/lib/types";
import { ATTEMPT_LABEL, Badge, Notice, attemptTone } from "@/components/ui";

const TYPE_LABEL = {
  MCQ: "Multiple choice",
  TRUE_FALSE: "True or false",
  SHORT_ANSWER: "Short answer",
} as const;

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
    for (const a of answers) {
      if (a.questionType === "SHORT_ANSWER") {
        m[a.questionId] = String(a.marksObtained);
      }
    }
    return m;
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const shortAnswers = answers.filter(
    (a) => a.questionType === "SHORT_ANSWER"
  );

  async function saveGrades() {
    setError("");
    setSaved(false);

    const grades = [];

    for (const a of shortAnswers) {
      const value = Number(marks[a.questionId]);

      if (!Number.isFinite(value) || value < 0 || value > a.marks) {
        return setError(
          `Marks for “${a.questionText.slice(0, 40)}” must be between 0 and ${a.marks}.`
        );
      }

      grades.push({
        questionId: a.questionId,
        marks: value,
      });
    }

    setBusy(true);

    try {
      await api(`/attempts/${attempt.id}/grade`, {
        method: "PATCH",
        body: { grades },
      });

      setSaved(true);
      onGraded?.();
    } catch (e) {
      setError(errMsg(e));
    }

    setBusy(false);
  }

  const verdict =
    data.passed === null
      ? {
          tone: "warn" as const,
          text: "Waiting for short answers to be graded",
        }
      : data.passed
        ? {
            tone: "good" as const,
            text: "Passed",
          }
        : {
            tone: "bad" as const,
            text: "Did not reach the passing marks",
          };

  return (
    <div className="space-y-8">

      {/* RESULT SUMMARY */}
      <section
        className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0d5c5c 100%)",
        }}
      >
        {/* Decorative background elements */}
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-10"
          style={{ background: "#2dd4bf" }}
        />

        <div
          className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full opacity-10"
          style={{ background: "#2dd4bf" }}
        />

        <div className="relative grid gap-8 sm:grid-cols-[1fr_1.2fr] sm:items-center">

          {/* SCORE */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background: "rgba(45,212,191,0.15)",
                  color: "#5eead4",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M8 3h8M9 3v4l-5 9a3 3 0 0 0 3 4h10a3 3 0 0 0 3-4l-5-9V3" />
                  <path d="M7 14h10" />
                </svg>
              </span>

              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">
                Exam Result
              </span>
            </div>

            <p className="mb-2 text-sm font-medium text-slate-300">
              Your Score
            </p>

            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-serif text-6xl font-bold leading-none tracking-tight text-white sm:text-7xl">
                {attempt.totalScore}
              </span>

              <span className="text-2xl font-medium text-slate-300">
                / {exam.totalMarks}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1.5 text-sm font-medium text-teal-100">
                Passing marks: {exam.passingMarks}
              </span>
            </div>
          </div>

          {/* RESULT DETAILS */}
          <div
            className="rounded-2xl border p-5 sm:p-6"
            style={{
              background: "rgba(15,23,42,0.35)",
              borderColor: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge tone={verdict.tone}>{verdict.text}</Badge>
              <Badge tone={attemptTone(attempt.status)}>
                {ATTEMPT_LABEL[attempt.status]}
              </Badge>
            </div>

            <div className="space-y-4 text-sm">

              {canGrade && (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-400">Student</span>
                  <span className="font-medium text-white sm:text-right">
                    {data.student.name} ({data.student.email})
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Started</span>
                <span className="text-right font-medium text-slate-100">
                  {fmtDateTime(attempt.startTime)}
                </span>
              </div>

              {attempt.endTime && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">Finished</span>
                  <span className="text-right font-medium text-slate-100">
                    {fmtDateTime(attempt.endTime)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Tab switches</span>
                <span className="font-semibold text-teal-300">
                  {attempt.tabSwitchCount}
                </span>
              </div>

              {attempt.status === "AUTO_SUBMITTED" && (
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-amber-200">
                  This exam was submitted automatically (time ran out or too many tab switches).
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ANSWERS SECTION */}
      <section>

        {/* SECTION HEADING */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              Performance Review
            </p>

            <h2
              className="font-serif text-2xl font-bold sm:text-3xl"
              style={{ color: "#0f172a" }}
            >
              Answer Review
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review your submitted answers and marks.
            </p>
          </div>

          <span
            className="rounded-full px-4 py-2 text-sm font-semibold"
            style={{
              background: "#ccfbf1",
              color: "#0f766e",
            }}
          >
            {answers.length} Questions
          </span>
        </div>

        {/* ANSWER CARDS */}
        <ol className="space-y-4">
          {answers.map((a, i) => {
            const isShort = a.questionType === "SHORT_ANSWER";

            const border = isShort
              ? "#d97706"
              : a.isCorrect
                ? "#059669"
                : "#dc2626";

            const statusText = isShort
              ? "Manual review"
              : a.isCorrect
                ? "Correct"
                : "Incorrect";

            const statusColor = isShort
              ? "#b45309"
              : a.isCorrect
                ? "#047857"
                : "#b91c1c";

            const statusBg = isShort
              ? "#fef3c7"
              : a.isCorrect
                ? "#d1fae5"
                : "#fee2e2";

            return (
              <li
                key={a.questionId}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: "#e2e8f0",
                  borderLeft: `5px solid ${border}`,
                }}
              >
                <div className="p-5 sm:p-6">

                  {/* QUESTION HEADER */}
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-lg px-3 py-1.5 text-xs font-bold"
                        style={{
                          background: "#0f172a",
                          color: "#ffffff",
                        }}
                      >
                        Question {i + 1}
                      </span>

                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {TYPE_LABEL[a.questionType]}
                      </span>

                      <span className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
                        {a.marks} mark{a.marks === 1 ? "" : "s"}
                      </span>
                    </div>

                    <span
                      className="rounded-full px-3 py-1.5 text-xs font-bold"
                      style={{
                        background: statusBg,
                        color: statusColor,
                      }}
                    >
                      {statusText}
                    </span>
                  </div>

                  {/* QUESTION TEXT */}
                  <p className="whitespace-pre-wrap text-base font-semibold leading-relaxed text-slate-900 sm:text-lg">
                    {a.questionText}
                  </p>

                  {/* ANSWER DETAILS */}
                  <div className="mt-5 space-y-4">

                    {/* STUDENT ANSWER */}
                    <div
                      className="rounded-xl border p-4"
                      style={{
                        background: "#f8fafc",
                        borderColor: "#e2e8f0",
                      }}
                    >
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Student’s Answer
                      </p>

                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                        {a.selectedAnswer || (
                          <em className="font-normal text-slate-400">
                            No answer
                          </em>
                        )}
                      </p>
                    </div>

                    {/* CORRECT ANSWER */}
                    {!isShort && (
                      <div
                        className="rounded-xl border p-4"
                        style={{
                          background: "#ecfdf5",
                          borderColor: "#a7f3d0",
                        }}
                      >
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                          Correct Answer
                        </p>

                        <p className="whitespace-pre-wrap text-sm font-semibold leading-relaxed text-emerald-900">
                          {a.correctAnswer}
                        </p>
                      </div>
                    )}

                    {/* MARKS */}
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"
                      style={{ borderColor: "#e2e8f0" }}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Marks Obtained
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Maximum marks: {a.marks}
                        </p>
                      </div>

                      <div>
                        {isShort && canGrade ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={a.marks}
                              step="0.5"
                              className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-center text-sm font-bold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                              aria-label={`Marks for question ${i + 1}`}
                              value={marks[a.questionId] ?? "0"}
                              onChange={(e) =>
                                setMarks((m) => ({
                                  ...m,
                                  [a.questionId]: e.target.value,
                                }))
                              }
                            />

                            <span className="text-sm font-medium text-slate-500">
                              / {a.marks}
                            </span>
                          </div>
                        ) : isShort &&
                          a.isCorrect === null &&
                          a.selectedAnswer ? (
                          <span className="text-sm font-medium text-amber-600">
                            Waiting for your teacher to grade this
                          </span>
                        ) : (
                          <span className="rounded-xl bg-teal-50 px-4 py-2 text-sm font-bold text-teal-800">
                            {a.marksObtained} / {a.marks}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* SAVE GRADES */}
        {canGrade && shortAnswers.length > 0 && (
          <div
            className="mt-6 rounded-2xl border p-5 sm:p-6"
            style={{
              background: "#f0fdfa",
              borderColor: "#99f6e4",
            }}
          >
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Manual Grading
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                Review the short answers and save the marks when finished.
              </p>
            </div>

            {error && (
              <div className="mb-3">
                <Notice tone="bad">{error}</Notice>
              </div>
            )}

            {saved && (
              <div className="mb-3">
                <Notice tone="good">
                  Marks saved. The total score is updated.
                </Notice>
              </div>
            )}

            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #0d5c5c, #0f766e)",
              }}
              onClick={saveGrades}
              disabled={busy}
            >
              {busy ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                    />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12l4 4L19 6" />
                  </svg>
                  Save Marks
                </>
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
