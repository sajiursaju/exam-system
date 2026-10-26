"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { errMsg } from "@/lib/format";
import type { Question, QuestionType } from "@/lib/types";
import { Notice } from "@/components/ui";

// Adds a new question, or edits one when `question` is given.
export default function QuestionForm({
  examId,
  question,
  onDone,
  onCancel,
}: {
  examId: number;
  question?: Question;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(question?.questionText ?? "");
  const [type, setType] = useState<QuestionType>(question?.questionType ?? "MCQ");
  const [options, setOptions] = useState<string[]>(
    question?.questionType === "MCQ" && question.options ? question.options : ["", "", "", ""]
  );
  const [correct, setCorrect] = useState<number>(() => {
    if (question?.questionType === "MCQ" && question.options) {
      const i = question.options.indexOf(question.correctAnswer ?? "");
      return i >= 0 ? i : 0;
    }
    return 0;
  });
  const [tf, setTf] = useState(question?.questionType === "TRUE_FALSE" ? question.correctAnswer ?? "True" : "True");
  const [marks, setMarks] = useState(String(question?.marks ?? 1));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function removeOption(i: number) {
    setOptions((o) => o.filter((_, idx) => idx !== i));
    setCorrect((c) => (i < c ? c - 1 : i === c ? 0 : c));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const m = Number(marks);
    if (!text.trim()) return setError("Write the question text.");
    if (!Number.isInteger(m) || m < 1) return setError("Marks must be a whole number, at least 1.");

    const body: Record<string, unknown> = { questionText: text.trim(), questionType: type, marks: m };

    if (type === "MCQ") {
      const opts = options.map((o) => o.trim());
      if (opts.some((o) => !o)) return setError("Fill in every option, or remove the empty ones.");
      if (new Set(opts).size !== opts.length) return setError("Each option must be different.");
      body.options = opts;
      body.correctAnswer = opts[correct];
    }
    if (type === "TRUE_FALSE") body.correctAnswer = tf;

    setBusy(true);
    try {
      if (question) await api(`/questions/${question.id}`, { method: "PUT", body });
      else await api(`/exams/${examId}/questions`, { method: "POST", body });
      onDone();
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel space-y-4 p-5">
      <h3 className="text-lg font-semibold">{question ? "Edit question" : "Add a question"}</h3>

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div>
          <label className="label" htmlFor="qtype">Type</label>
          <select id="qtype" className="input" value={type} onChange={(e) => setType(e.target.value as QuestionType)}>
            <option value="MCQ">Multiple choice</option>
            <option value="TRUE_FALSE">True or false</option>
            <option value="SHORT_ANSWER">Short answer (you grade it)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="qmarks">Marks</label>
          <input id="qmarks" type="number" min={1} className="input" value={marks} onChange={(e) => setMarks(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="qtext">Question</label>
        <textarea id="qtext" rows={3} className="input" value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      {type === "MCQ" && (
        <fieldset>
          <legend className="label">Options (select the correct one)</legend>
          <div className="space-y-2">
            {options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="correct" checked={correct === i} onChange={() => setCorrect(i)}
                  aria-label={`Option ${i + 1} is correct`} />
                <input className="input" placeholder={`Option ${i + 1}`} value={o}
                  onChange={(e) => setOptions((all) => all.map((x, idx) => (idx === i ? e.target.value : x)))} />
                {options.length > 2 && (
                  <button type="button" className="btn btn-sm" onClick={() => removeOption(i)} aria-label={`Remove option ${i + 1}`}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button type="button" className="btn btn-sm mt-2" onClick={() => setOptions((o) => [...o, ""])}>
              Add option
            </button>
          )}
        </fieldset>
      )}

      {type === "TRUE_FALSE" && (
        <div>
          <label className="label" htmlFor="tf">Correct answer</label>
          <select id="tf" className="input" style={{ width: "auto" }} value={tf} onChange={(e) => setTf(e.target.value)}>
            <option>True</option>
            <option>False</option>
          </select>
        </div>
      )}

      {type === "SHORT_ANSWER" && (
        <p className="hint">Students type an answer. You give the marks later from the submission screen.</p>
      )}

      {error && <Notice tone="bad">{error}</Notice>}
      <div className="flex gap-2">
        <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : question ? "Save changes" : "Add question"}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
