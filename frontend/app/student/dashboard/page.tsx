
// frontend/app/student/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [startingId, setStartingId] = useState<number | null>(null);

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
    <div className="space-y-7 pb-8">

      {/* Dashboard Welcome Section */}
      <section
        className="relative overflow-hidden rounded-3xl p-6 shadow-lg sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0d5c5c 100%)",
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1.5 text-xs font-bold text-teal-200">
              <span className="h-2 w-2 rounded-full bg-[#2dd4bf]" />
              STUDENT DASHBOARD
            </div>

            <p className="text-sm font-medium text-slate-300">
              Welcome back,
            </p>

            <h1 className="mt-1 break-words text-2xl font-black tracking-tight text-white sm:text-3xl">
              {me.name}
            </h1>

            <p className="mt-3 break-all text-sm text-slate-300">
              {me.email}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200">
                🏫 {me.institute || "No institute"}
              </span>

              <span className="rounded-lg border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-xs font-semibold text-teal-200">
                🎯 Target: {me.targetExam || "Not set"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <Link
              href="/student/profile"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2dd4bf] px-5 py-3 text-sm font-extrabold text-[#0f172a] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-200 hover:shadow-xl"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="grid gap-4 sm:grid-cols-2">

        {/* Attempted */}
        <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#ccfbf1] text-[#0f766e] transition-transform group-hover:scale-110">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-500">
              Exams Attempted
            </p>
            <p className="mt-1 text-3xl font-black tabular-nums text-[#0f172a]">
              {attempted}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Your completed or ongoing attempts
            </p>
          </div>
        </div>

        {/* Passed */}
        <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m8 12 2.5 2.5L16 9" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-500">
              Exams Passed
            </p>
            <p className="mt-1 text-3xl font-black tabular-nums text-emerald-600">
              {passed}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Successfully achieved passing marks
            </p>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && <Notice tone="bad">{error}</Notice>}

      {/* Available Exams Section */}
      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0f766e]">
              Test Your Knowledge
            </span>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#0f172a]">
              Available Exams
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose an exam and take the next step toward your goal.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#0f766e]" />
            {filteredExams.length} Exams Available
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M7 12h10m-7 6h4" />
            </svg>
            Filter by category
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-[#0f172a] text-[#2dd4bf] shadow-md"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-[#0f766e]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exam List */}
        {filteredExams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ccfbf1] text-3xl">
              📚
            </div>

            <h3 className="mt-4 text-lg font-extrabold text-[#0f172a]">
              No Exams Found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              No exams found for this category.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredExams.map((e) => (
              <div
                key={e.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-300/70 hover:shadow-xl hover:shadow-teal-900/10 sm:p-6"
              >
                {/* Card Top Accent */}
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0d5c5c] to-[#2dd4bf] opacity-70 transition-opacity group-hover:opacity-100" />

                <div>
                  {/* Exam Title and Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ccfbf1] text-2xl">
                        📝
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words text-base font-extrabold leading-snug text-[#0f172a] transition-colors group-hover:text-[#0f766e] sm:text-lg">
                          {e.title}
                        </h3>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {e.targetExam || "No category"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide ${
                        e.state === "ONGOING"
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : e.state === "UPCOMING"
                          ? "border border-amber-200 bg-amber-50 text-amber-700"
                          : "border border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {e.state === "ONGOING" ? "● Open Now" : e.state}
                    </span>
                  </div>

                  {/* Exam Details */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="text-[#0f766e]">⏱</span>
                        Duration
                      </div>
                      <p className="mt-1 text-sm font-extrabold text-[#0f172a]">
                        {e.durationMinutes} min
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="text-[#0f766e]">🎯</span>
                        Total Marks
                      </div>
                      <p className="mt-1 text-sm font-extrabold text-[#0f172a]">
                        {e.totalMarks}
                        <span className="ml-1 text-xs font-medium text-slate-400">
                          (Pass: {e.passingMarks})
                        </span>
                      </p>
                    </div>

                    <div className="col-span-2 rounded-xl border border-slate-100 bg-[#f8fafc] p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="text-[#0f766e]">❓</span>
                        Total Questions
                      </div>
                      <p className="mt-1 text-sm font-extrabold text-[#0f172a]">
                        {e._count?.questions || 0} Questions
                      </p>
                    </div>
                  </div>

                  {/* Exam Schedule */}
                  <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/60 p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#0f766e]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M16 3v4M8 3v4M3 11h18" />
                      </svg>
                      EXAM SCHEDULE
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-700">
                          Starts:
                        </span>{" "}
                        {fmtDateTime(e.startTime)}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">
                          Ends:
                        </span>{" "}
                        {fmtDateTime(e.endTime)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Exam Action Buttons - Original Logic Preserved */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  {e._count?.questions === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-bold text-amber-700">
                      ⚠ This exam has no questions yet
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
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-extrabold text-[#0f766e] transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-[#ccfbf1] hover:shadow-md"
                    >
                      {e.attempts[0].status === "IN_PROGRESS" ? (
                        <>
                          <span>▶</span>
                          Resume Exam
                        </>
                      ) : (
                        <>
                          <span>📊</span>
                          View Results
                        </>
                      )}
                      <span className="ml-1">→</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStart(e.id)}
                      disabled={e.state !== "ONGOING" || startingId === e.id}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition-all duration-200 ${
                        e.state === "ONGOING"
                          ? "bg-gradient-to-r from-[#0d5c5c] to-[#0f172a] text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg"
                          : "cursor-not-allowed bg-slate-100 text-slate-400"
                      }`}
                    >
                      {startingId === e.id ? (
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
                              d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
                            />
                          </svg>
                          Starting...
                        </>
                      ) : e.state === "ONGOING" ? (
                        <>
                          Start Exam
                          <span>→</span>
                        </>
                      ) : (
                        "Not Available Yet"
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
