// frontend/components/PdfImporter.tsx
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Notice } from "@/components/ui";

type DraftQuestion = {
  questionText: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  questionType: string;
};

export default function PdfImporter({ 
  examId, 
  onImportComplete 
}: { 
  examId: number; 
  onImportComplete: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    setFile(selected);
    setParsing(true);
    setError("");

    const formData = new FormData();
    formData.append("pdf", selected);

    try {
      const res = await api<{ totalFound: number; questions: DraftQuestion[] }>("/pdf/parse", {
        method: "POST",
        body: formData,
      });
      setDrafts(res.questions);
      if (res.totalFound === 0) {
        setError("Could not find any questions in this PDF. Please ensure it has numbered questions and A, B, C, D options.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to parse PDF.");
    } finally {
      setParsing(false);
    }
  }

  function updateDraft(index: number, field: string, value: string) {
    const updated = [...drafts];
    if (field === "questionText") updated[index].questionText = value;
    if (field === "correctAnswer") updated[index].correctAnswer = value;
    // Option update logic...
    setDrafts(updated);
  }

  async function saveAll() {
    setSaving(true);
    setError("");
    try {
      // Loop through drafts and save each one to the exam
      for (const draft of drafts) {
        if (!draft.correctAnswer) {
          throw new Error(`Question "${draft.questionText.substring(0, 20)}..." is missing a correct answer. Please fill it in.`);
        }
        await api(`/exams/${examId}/questions`, {
          method: "POST",
          body: draft,
        });
      }
      onImportComplete(); // Refresh the exam page
      setDrafts([]); // Clear drafts
    } catch (err: any) {
      setError(err.message || "Failed to save questions.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel p-6 mb-6 border-2 border-dashed border-teal-300 bg-teal-50/30">
      <h3 className="text-lg font-bold mb-2">✨ Bulk Import Questions from PDF</h3>
      <p className="text-sm text-slate-600 mb-4">
        Upload a PDF formatted with numbered questions and options (A, B, C, D). 
        We will convert them into drafts for you to review.
      </p>

      {error && <Notice tone="bad">{error}</Notice>}

      {!drafts.length ? (
        <div>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            disabled={parsing}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-700 file:text-white hover:file:bg-teal-800"
          />
          {parsing && <p className="mt-2 text-sm text-teal-700 font-semibold animate-pulse">Extracting text and parsing questions... please wait.</p>}
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <p className="font-semibold text-teal-800">Found {drafts.length} questions. Please review them below:</p>
            <button 
              onClick={saveAll} 
              disabled={saving}
              className="btn btn-primary bg-teal-700 hover:bg-teal-800"
            >
              {saving ? "Saving..." : `Save ${drafts.length} Questions`}
            </button>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {drafts.map((q, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="mb-2">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Question {i + 1}</label>
                  <textarea 
                    className="input w-full" 
                    value={q.questionText}
                    onChange={(e) => updateDraft(i, "questionText", e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex}>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Option {String.fromCharCode(65 + optIndex)}</label>
                      <input className="input w-full" value={opt} readOnly />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold text-red-500 mb-1 block">Correct Answer (Must match an option exactly)</label>
                  <select 
                    className="input w-full border-red-200" 
                    value={q.correctAnswer}
                    onChange={(e) => updateDraft(i, "correctAnswer", e.target.value)}
                  >
                    <option value="">— Select Correct Answer —</option>
                    {q.options.map((opt, optIndex) => (
                      <option key={optIndex} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}