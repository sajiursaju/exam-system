// frontend/app/admin/exams/new/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { errMsg, toIso, toLocalInput } from "@/lib/format";
import type { Exam } from "@/lib/types";
import { Notice, PageTitle } from "@/components/ui";

export default function NewExamPage() {
  const router = useRouter();
  const now = new Date();
  const [title, setTitle] = useState("");
  const [targetExam, setTargetExam] = useState(""); // Changed from category
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [start, setStart] = useState(toLocalInput(now));
  const [end, setEnd] = useState(toLocalInput(new Date(now.getTime() + 7 * 24 * 3600 * 1000)));
  const [total, setTotal] = useState("10");
  const [passing, setPassing] = useState("4");
  const [shuffle, setShuffle] = useState(true);
  const [tabs, setTabs] = useState("3");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!targetExam) return setError("Please select a target exam so the right students see this exam.");
    if (!start || !end) return setError("Choose when the exam opens and closes.");
    setBusy(true);
    try {
      const { exam } = await api<{ exam: Exam }>("/exams", {
        body: {
          title: title.trim(),
          targetExam, // Send targetExam instead of category
          description: description.trim() || null,
          durationMinutes: Number(duration),
          startTime: toIso(start),
          endTime: toIso(end),
          totalMarks: Number(total),
          passingMarks: Number(passing),
          shuffleQuestions: shuffle,
          maxTabSwitches: Number(tabs),
        },
      });
      router.replace(`/admin/exams/${exam.id}`);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle title="New Exam">
        <Link href="/admin/dashboard" className="btn">Cancel</Link>
      </PageTitle>

      <form onSubmit={onSubmit} className="panel max-w-2xl space-y-5 p-6">

        {/* Title */}
        <div>
          <label className="label" htmlFor="title">Title *</label>
          <input id="title" required minLength={3} maxLength={200} className="input"
            placeholder="e.g. SSC Class 9 Math Mock Test"
            value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        {/* Target Exam */}
        <div>
          <label className="label" htmlFor="targetExam">
            Target Exam Category *
            <span style={{ fontSize: "12px", color: "var(--muted)", marginLeft: "8px", fontWeight: 400 }}>
              Only students with this Target Exam will see this exam
            </span>
          </label>
          <select id="targetExam" required className="input"
            value={targetExam} onChange={(e) => setTargetExam(e.target.value)}>
            <option value="">— Select category —</option>
            <option value="Class 9-10">Class 9-10</option>
            <option value="HSC 11-12">HSC 11-12</option>
            <option value="English (Basic to Advance)">English (Basic to Advance)</option>
            <option value="Admission">Admission</option>
            <option value="Nursing">Nursing</option>
            <option value="Primary Teacher">Primary Teacher</option>
            <option value="BCS">BCS</option>
            <option value="Bank Job">Bank Job</option>
            <option value="Niyogon">Niyogon</option>
            <option value="All Job Preparation">All Job Preparation</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="label" htmlFor="desc">Description (optional)</label>
          <textarea id="desc" rows={3} maxLength={2000} className="input"
            placeholder="Brief info about this exam…"
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {/* Open / Close */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="start">Opens</label>
            <input id="start" type="datetime-local" required className="input"
              value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="end">Closes</label>
            <input id="end" type="datetime-local" required className="input"
              value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>

        {/* Marks + duration */}
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="dur">Time allowed (minutes)</label>
            <input id="dur" type="number" min={1} max={600} required className="input"
              value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="total">Total marks</label>
            <input id="total" type="number" min={1} required className="input"
              value={total} onChange={(e) => setTotal(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="pass">Passing marks</label>
            <input id="pass" type="number" min={0} required className="input"
              value={passing} onChange={(e) => setPassing(e.target.value)} />
          </div>
        </div>

        {/* Tab switches + shuffle */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="tabs">Tab switches allowed</label>
            <input id="tabs" type="number" min={0} max={20} required className="input"
              value={tabs} onChange={(e) => setTabs(e.target.value)} />
            <p className="hint">Going over this submits automatically. 0 = off.</p>
          </div>
          <label className="flex items-start gap-2 pt-6 text-sm">
            <input type="checkbox" className="mt-1" checked={shuffle}
              onChange={(e) => setShuffle(e.target.checked)} />
            <span>
              <span className="font-semibold">Shuffle questions</span>
              <span className="hint block">Each student sees questions in a different order.</span>
            </span>
          </label>
        </div>

        {error && <Notice tone="bad">{error}</Notice>}

        <div className="flex items-center gap-3">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Create Exam"}
          </button>
          <span className="hint">You add questions on the next screen.</span>
        </div>
      </form>
    </>
  );
}