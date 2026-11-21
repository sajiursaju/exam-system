// frontend/app/student/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Added useRouter
import { api } from "@/lib/api";
import { errMsg, fmtDateTime } from "@/lib/format";
import { useUser } from "@/components/Shell";
import { Loading, Notice } from "@/components/ui";

type Exam = {
  id: number;
  title: string;
  targetExam: string | null;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  startTime: string;
  endTime: string;
  state: "UPCOMING" | "ONGOING" | "COMPLETED";
  _count: { questions: number };
  attempts?: { id: number; status: string; totalScore: number }[];
};

const CATEGORIES = [
  "All", "Class 9-10", "HSC 11-12", "English", "Admission", "Nursing", 
  "Primary Teacher", "BCS", "Bank Job", "Niyogon", "All Job Preparation"
];

export default function StudentDashboard() {
  const me = useUser();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startingId, setStartingId] = useState<number | null>(null); // Track which exam is loading

  useEffect(() => {
    api<{ exams: Exam[] }>("/exams")
      .then((d) => setExams(d.exams))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  // Directly start the exam and redirect to the attempt page
  async function handleStart(examId: number) {
    setStartingId(examId);
    setError("");
    try {
      const payload = await api<{ attempt: { id: number } }>("/attempts/start", {
        method: "POST",
        body: { examId },
      });
      router.push(`/student/attempt/${payload.attempt.id}`);
    } catch (err: any) {
      if (err.data?.attemptId) {
        // If already attempted, send them to their result/attempt page
        router.push(`/student/attempt/${err.data.attemptId}`);
      } else {
        setError(errMsg(err));
        setStartingId(null);
      }
    }
  }

  if (loading) return <Loading />;

  const filteredExams = exams.filter((e) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Admission") return e.targetExam?.toLowerCase().includes("admission");
    if (selectedCategory === "English") return e.targetExam?.toLowerCase().includes("english");
    return e.targetExam === selectedCategory;
  });

  const attempted = exams.filter((e) => e.attempts && e.attempts.length > 0).length;
  const passed = exams.filter((e) => e.attempts?.[0]?.status === "GRADED" && e.attempts[0].totalScore >= e.passingMarks).length;

  return (
    <div className="space-y-8">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{me.name}</h1>
          <p className="text-sm text-slate-500">{me.email} · {me.institute || "No institute"} · Target: <strong className="text-teal-700">{me.targetExam || "Not set"}</strong></p>
        </div>
        <div className="flex gap-4">
          <div className="text-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            <div className="text-xl font-bold text-slate-800">{attempted}</div>
            <div className="text-xs text-slate-500 uppercase font-semibold">Attempted</div>
          </div>
          <div className="text-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            <div className="text-xl font-bold text-green-600">{passed}</div>
            <div className="text-xs text-slate-500 uppercase font-semibold">Passed</div>
          </div>
          <Link href="/student/profile" className="btn btn-primary h-full flex items-center justify-center px-6">
            Edit Profile
          </Link>
        </div>
      </div>

      {error && <Notice tone="bad">{error}</Notice>}

      {/* Category Tabs */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          📋 Available Exams
        </h2>
        
        <div className="flex overflow-x-auto gap-2 pb-2 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Exam List */}
        {filteredExams.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">No exams found for this category.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredExams.map((e) => (
              <div key={e.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800">{e.title}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      e.state === "ONGOING" ? "bg-green-100 text-green-700" :
                      e.state === "UPCOMING" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {e.state === "ONGOING" ? "Open now" : e.state}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {e.targetExam || "No category"}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-4">
                    <div>⏱ {e.durationMinutes} min</div>
                    <div>📌 {e.totalMarks} marks (pass: {e.passingMarks})</div>
                    <div>❓ {e._count?.questions || 0} questions</div>
                  </div>
                  
                  <div className="text-xs text-slate-400 mb-4">
                    🗓 {fmtDateTime(e.startTime)} → {fmtDateTime(e.endTime)}
                  </div>
                </div>

                {/* Logic for Start Button */}
                {e._count?.questions === 0 ? (
                  <div className="bg-amber-50 text-amber-700 text-xs font-semibold p-2 rounded text-center">
                    This exam has no questions yet
                  </div>
                ) : e.attempts && e.attempts.length > 0 ? (
                  <button
                    onClick={() => {
                      const attempt = e.attempts![0];
                      if (attempt.status === "IN_PROGRESS") {
                        router.push(`/student/attempt/${attempt.id}`);
                      } else {
                        router.push(`/student/results/${attempt.id}`);
                      }
                    }}
                    className="block w-full text-center py-2 rounded-lg font-bold text-sm bg-teal-50 text-teal-700 hover:bg-teal-100"
                  >
                    {e.attempts[0].status === "IN_PROGRESS" ? "Resume Exam" : "View Results"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleStart(e.id)}
                    disabled={e.state !== "ONGOING" || startingId === e.id}
                    className={`block w-full text-center py-2 rounded-lg font-bold text-sm ${
                      e.state === "ONGOING"
                        ? "bg-teal-700 text-white hover:bg-teal-800"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {startingId === e.id ? "Starting..." : e.state === "ONGOING" ? "Start Exam" : "Not Available Yet"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}