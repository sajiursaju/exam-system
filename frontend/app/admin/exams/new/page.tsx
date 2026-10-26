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
    if (!start || !end) return setError("Choose when the exam opens and closes.");
    setBusy(true);
    try {
      const { exam } = await api<{ exam: Exam }>("/exams", {
        body: {
          title: title.trim(),
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
      <PageTitle title="New exam">
        <Link href="/admin/dashboard" className="btn">Cancel</Link>
      </PageTitle>

      <form onSubmit={onSubmit} className="panel max-w-2xl space-y-5 p-6">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" required minLength={3} maxLength={200} className="input"
            value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="desc">Description (optional)</label>
          <textarea id="desc" rows={3} maxLength={2000} className="input"
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

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

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="tabs">Tab switches allowed</label>
            <input id="tabs" type="number" min={0} max={20} required className="input"
              value={tabs} onChange={(e) => setTabs(e.target.value)} />
            <p className="hint">Going over this submits the exam automatically. Use 0 to turn the check off.</p>
          </div>
          <label className="flex items-start gap-2 pt-6 text-sm">
            <input type="checkbox" className="mt-1" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} />
            <span>
              <span className="font-semibold">Shuffle questions</span>
              <span className="hint block">Each student sees the questions in a different order.</span>
            </span>
          </label>
        </div>

        {error && <Notice tone="bad">{error}</Notice>}
        <div className="flex items-center gap-3">
          <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Create exam"}</button>
          <span className="hint">You add the questions on the next screen.</span>
        </div>
      </form>
    </>
  );
}
