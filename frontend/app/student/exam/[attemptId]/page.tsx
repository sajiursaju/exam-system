"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { clock, errMsg } from "@/lib/format";
import type { AttemptPayload, ExamQuestion } from "@/lib/types";
import { Loading, Notice } from "@/components/ui";

type Local = { selected: string; review: boolean };
type SaveState = "idle" | "saving" | "saved" | "error";

export default function TakeExamPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();

  const [data, setData] = useState<AttemptPayload | null>(null);
  const [answers, setAnswers] = useState<Record<number, Local>>({});
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [fatal, setFatal] = useState("");
  const [notice, setNotice] = useState("");
  const [warning, setWarning] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [submitting, setSubmitting] = useState(false);

  const endsAt = useRef(0); // moment the exam ends, on THIS computer's clock
  const finished = useRef(false);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const pending = useRef<Record<number, string>>({}); // typed text not saved yet

  const goResults = useCallback(() => {
    finished.current = true;
    router.replace(`/student/results/${attemptId}`);
  }, [router, attemptId]);

  // ---------- load ----------
  useEffect(() => {
    api<AttemptPayload>(`/attempts/${attemptId}`)
      .then((d) => {
        setData(d);
        endsAt.current = Date.now() + d.secondsLeft * 1000;
        setSecondsLeft(d.secondsLeft);
        const map: Record<number, Local> = {};
        for (const a of d.answers) map[a.questionId] = { selected: a.selectedAnswer ?? "", review: a.markedReview };
        setAnswers(map);
      })
      .catch((e) => {
        if (e instanceof ApiError && e.data?.finished) {
          finished.current = true;
          router.replace(`/student/results/${attemptId}`);
        } else {
          setFatal(errMsg(e));
        }
      });
  }, [attemptId, router]);

  // ---------- saving ----------
  const saveNow = useCallback(
    async (questionId: number, body: { selectedAnswer?: string | null; markedReview?: boolean }) => {
      setSaveState("saving");
      try {
        await api(`/attempts/${attemptId}/answer`, { method: "PUT", body: { questionId, ...body } });
        setSaveState("saved");
        setNotice("");
      } catch (e) {
        if (e instanceof ApiError && e.data?.finished) return goResults();
        setSaveState("error");
        setNotice(`Your last change was not saved: ${errMsg(e)}`);
      }
    },
    [attemptId, goResults]
  );

  // Sends any typed text that is still waiting for its short delay.
  const flush = useCallback(async () => {
    const entries = Object.entries(pending.current);
    pending.current = {};
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
    await Promise.all(
      entries.map(([qid, text]) =>
        api(`/attempts/${attemptId}/answer`, {
          method: "PUT",
          body: { questionId: Number(qid), selectedAnswer: text === "" ? null : text },
        }).catch(() => {})
      )
    );
  }, [attemptId]);

  const submit = useCallback(async () => {
    if (finished.current) return;
    setSubmitting(true);
    await flush();
    try {
      await api(`/attempts/${attemptId}/submit`, { method: "POST" });
    } catch (e) {
      if (!(e instanceof ApiError && e.data?.finished)) {
        setNotice(errMsg(e));
        setSubmitting(false);
        return;
      }
    }
    goResults();
  }, [attemptId, flush, goResults]);

  // ---------- countdown ----------
  useEffect(() => {
    if (!data) return;
    const t = setInterval(() => {
      const left = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(t);
        submit();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [data, submit]);

  // ---------- tab switch check ----------
  useEffect(() => {
    if (!data || data.exam.maxTabSwitches === 0) return;
    const max = data.exam.maxTabSwitches;

    function onVisibility() {
      if (document.visibilityState !== "hidden" || finished.current) return;
      api<{ tabSwitchCount: number; max: number; autoSubmitted: boolean }>(
        `/attempts/${attemptId}/tab-switch`,
        { method: "POST" }
      )
        .then((r) => {
          if (r.autoSubmitted) return goResults();
          setWarning(
            `You left the exam tab ${r.tabSwitchCount} time${r.tabSwitchCount === 1 ? "" : "s"}. ` +
              `You may do this ${max} time${max === 1 ? "" : "s"}; after that the exam is submitted automatically.`
          );
        })
        .catch((e) => {
          if (e instanceof ApiError && e.data?.finished) goResults();
        });
    }

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [data, attemptId, goResults]);

  // Ask before closing the tab by accident.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!finished.current) e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // ---------- actions ----------
  function choose(q: ExamQuestion, value: string) {
    // clicking the selected option again clears it
    const next = answers[q.id]?.selected === value ? "" : value;
    setAnswers((a) => ({ ...a, [q.id]: { selected: next, review: a[q.id]?.review ?? false } }));
    saveNow(q.id, { selectedAnswer: next === "" ? null : next });
  }

  function typeText(q: ExamQuestion, text: string) {
    setAnswers((a) => ({ ...a, [q.id]: { selected: text, review: a[q.id]?.review ?? false } }));
    pending.current[q.id] = text;
    setSaveState("saving");
    clearTimeout(timers.current[q.id]);
    timers.current[q.id] = setTimeout(() => {
      const t = pending.current[q.id];
      if (t === undefined) return;
      delete pending.current[q.id];
      saveNow(q.id, { selectedAnswer: t === "" ? null : t });
    }, 800);
  }

  function toggleReview(q: ExamQuestion) {
    const next = !(answers[q.id]?.review ?? false);
    setAnswers((a) => ({ ...a, [q.id]: { selected: a[q.id]?.selected ?? "", review: next } }));
    saveNow(q.id, { markedReview: next });
  }

  function confirmSubmit() {
    if (!data) return;
    const open = data.questions.filter((q) => !answers[q.id]?.selected).length;
    const msg = open > 0
      ? `You have ${open} unanswered question${open === 1 ? "" : "s"}. Submit anyway?`
      : "Submit your exam now? You cannot change answers afterwards.";
    if (confirm(msg)) submit();
  }

  // ---------- render ----------
  if (fatal) {
    return (
      <>
        <Notice tone="bad">{fatal}</Notice>
        <p className="mt-4"><Link href="/student/dashboard" className="btn">Back to your exams</Link></p>
      </>
    );
  }
  if (!data) return <Loading text="Loading your exam…" />;

  const { questions, exam } = data;
  if (questions.length === 0) {
    return <Notice tone="warn">This exam has no questions yet. Ask your teacher.</Notice>;
  }
  const q = questions[index];
  const current = answers[q.id];
  const answered = questions.filter((x) => answers[x.id]?.selected).length;
  const timerColor = secondsLeft < 60 ? "var(--bad)" : secondsLeft < 300 ? "var(--warn)" : "var(--ink)";
  const saveText = { idle: "", saving: "Saving…", saved: "All changes saved", error: "Not saved" }[saveState];

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-6 px-4 py-3"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{exam.title}</h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {answered} of {questions.length} answered {saveText && `· ${saveText}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div role="timer" aria-label="Time left" className="font-mono text-2xl font-semibold tabular-nums"
              style={{ color: timerColor }}>
              {clock(secondsLeft)}
            </div>
            <button className="btn btn-primary" onClick={confirmSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit exam"}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        {warning && <Notice tone="warn">{warning}</Notice>}
        {notice && <Notice tone="bad">{notice}</Notice>}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
        <section aria-live="off">
          <p className="mb-2 text-sm" style={{ color: "var(--muted)" }}>
            Question {index + 1} of {questions.length} · {q.marks} mark{q.marks === 1 ? "" : "s"}
          </p>
          <h2 className="mb-5 whitespace-pre-wrap text-xl font-semibold leading-snug">{q.questionText}</h2>

          {q.questionType === "SHORT_ANSWER" ? (
            <div>
              <label className="label" htmlFor="short">Your answer</label>
              <textarea id="short" rows={8} className="input" maxLength={5000}
                value={current?.selected ?? ""} onChange={(e) => typeText(q, e.target.value)} />
              <p className="hint">Saved automatically. A teacher will mark this answer.</p>
            </div>
          ) : (
            <div className="space-y-2" role="radiogroup" aria-label="Answer options">
              {(q.options ?? []).map((opt) => {
                const on = current?.selected === opt;
                return (
                  <button key={opt} type="button" role="radio" aria-checked={on}
                    className={`choice ${on ? "choice-on" : ""}`} onClick={() => choose(q, opt)}>
                    <span className="choice-mark" />
                    <span>{opt}</span>
                  </button>
                );
              })}
              <p className="hint">Click the chosen option again to clear it.</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button className="btn" onClick={() => toggleReview(q)}>
              {current?.review ? "Remove review flag" : "Flag for review"}
            </button>
            <div className="flex gap-2">
              <button className="btn" disabled={index === 0} onClick={() => setIndex(index - 1)}>Previous</button>
              {index < questions.length - 1 ? (
                <button className="btn btn-primary" onClick={() => setIndex(index + 1)}>Next</button>
              ) : (
                <button className="btn btn-primary" onClick={confirmSubmit} disabled={submitting}>Finish and submit</button>
              )}
            </div>
          </div>
        </section>

        <aside aria-label="Question navigator" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-sm font-semibold">Answer sheet</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((x, i) => {
              const a = answers[x.id];
              const cls = ["bubble", a?.selected ? "bubble-done" : "", a?.review ? "bubble-review" : "", i === index ? "bubble-current" : ""]
                .filter(Boolean).join(" ");
              return (
                <button key={x.id} type="button" className={cls} onClick={() => setIndex(i)}
                  aria-label={`Question ${i + 1}${a?.selected ? ", answered" : ""}${a?.review ? ", flagged" : ""}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <ul className="mt-4 space-y-1 text-xs" style={{ color: "var(--muted)" }}>
            <li><span className="bubble bubble-done mr-2" style={{ width: "1rem", height: "1rem" }} />Answered</li>
            <li><span className="bubble mr-2" style={{ width: "1rem", height: "1rem" }} />Not answered</li>
            <li><span className="bubble bubble-review mr-2" style={{ width: "1rem", height: "1rem" }} />Flagged for review</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
