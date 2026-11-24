
// app/online-exams/page.tsx

import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

type ExamCard = {
  icon: string;
  title: string;
  titleBn: string;
  questions: number;
  duration: string;
  marks: number;
  type: "Free" | "Paid";
};

const exams: ExamCard[] = [
  {
    icon: "🏛️",
    title: "BCS Preliminary Model Test",
    titleBn: "বিসিএস প্রিলিমিনারি মডেল টেস্ট",
    questions: 200,
    duration: "120 min",
    marks: 200,
    type: "Paid",
  },
  {
    icon: "🏦",
    title: "Bank Job Model Test",
    titleBn: "ব্যাংক জব মডেল টেস্ট",
    questions: 100,
    duration: "60 min",
    marks: 100,
    type: "Paid",
  },
  {
    icon: "📝",
    title: "Niyogon Model Test",
    titleBn: "নিয়োগ পরীক্ষা মডেল টেস্ট",
    questions: 50,
    duration: "40 min",
    marks: 50,
    type: "Free",
  },
  {
    icon: "🍎",
    title: "Primary Teacher Model Test",
    titleBn: "প্রাথমিক শিক্ষক মডেল টেস্ট",
    questions: 100,
    duration: "60 min",
    marks: 100,
    type: "Paid",
  },
  {
    icon: "📘",
    title: "SSC Subject Test",
    titleBn: "এসএসসি বিষয়ভিত্তিক পরীক্ষা",
    questions: 40,
    duration: "30 min",
    marks: 40,
    type: "Free",
  },
  {
    icon: "🎓",
    title: "HSC Subject Test",
    titleBn: "এইচএসসি বিষয়ভিত্তিক পরীক্ষা",
    questions: 40,
    duration: "30 min",
    marks: 40,
    type: "Free",
  },
  {
    icon: "🔤",
    title: "English (Basic to Advance) Test",
    titleBn: "ইংরেজি (বেসিক থেকে অ্যাডভান্স) পরীক্ষা",
    questions: 40,
    duration: "30 min",
    marks: 40,
    type: "Free",
  },
  {
    icon: "🎯",
    title: "Admission Model Test",
    titleBn: "ভর্তি প্রস্তুতি মডেল টেস্ট",
    questions: 100,
    duration: "60 min",
    marks: 100,
    type: "Paid",
  },
  {
    icon: "🩺",
    title: "Nursing Model Test",
    titleBn: "নার্সিং মডেল টেস্ট",
    questions: 100,
    duration: "60 min",
    marks: 100,
    type: "Paid",
  },
  {
    icon: "💼",
    title: "All Job Preparation Model Test",
    titleBn: "সকল চাকরির মডেল টেস্ট",
    questions: 100,
    duration: "60 min",
    marks: 100,
    type: "Paid",
  },
];

export default function OnlineExamsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f8fafc]">
        {/* Hero Section */}
        <section
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0d5c5c 100%)",
          }}
        >
          {/* Decorative Background Elements */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-teal-200">
              <span className="h-2 w-2 rounded-full bg-[#2dd4bf]" />
              Practice • Improve • Succeed
            </span>

            <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Online <span className="text-[#2dd4bf]">Examinations</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Prepare for your dream job and academic goals with structured
              model tests. Practice under timed conditions and check your
              performance after submission.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-left backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-[#2dd4bf]">
                  {exams.length}
                </p>
                <p className="text-xs font-medium text-slate-300">
                  Exam Categories
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-left backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-white">Free</p>
                <p className="text-xs font-medium text-slate-300">
                  Practice Tests
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-left backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-[#2dd4bf]">
                  24/7
                </p>
                <p className="text-xs font-medium text-slate-300">
                  Online Access
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Exam Cards Section */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0f766e]">
                Choose Your Preparation
              </span>

              <h2 className="mt-2 text-2xl font-black text-[#0f172a] sm:text-3xl">
                Explore Online Exams
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Select your preferred examination and start practicing today.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0f766e]" />
              Available Model Tests
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <div
                key={exam.title}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0f766e]/40 hover:shadow-xl hover:shadow-teal-900/10"
              >
                {/* Top Accent */}
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0d5c5c] to-[#2dd4bf] opacity-70 transition-opacity group-hover:opacity-100" />

                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ccfbf1] text-3xl transition-transform duration-300 group-hover:scale-110">
                    {exam.icon}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      exam.type === "Free"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {exam.type === "Free" ? "✓ Free Test" : "★ Paid Test"}
                  </span>
                </div>

                {/* Card Title */}
                <h2 className="mt-5 text-lg font-extrabold leading-snug text-[#0f172a] transition-colors group-hover:text-[#0f766e]">
                  {exam.title}
                </h2>

                <p className="mt-1 text-sm font-medium text-[#0f766e]">
                  {exam.titleBn}
                </p>

                {/* Exam Information */}
                <div className="mt-5 flex-1 space-y-3 rounded-xl bg-[#f8fafc] p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ccfbf1] text-[#0f766e]">
                        ❓
                      </span>
                      Total Questions
                    </span>
                    <span className="font-bold text-[#0f172a]">
                      {exam.questions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ccfbf1] text-[#0f766e]">
                        ⏱️
                      </span>
                      Duration
                    </span>
                    <span className="font-bold text-[#0f172a]">
                      {exam.duration}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ccfbf1] text-[#0f766e]">
                        🎯
                      </span>
                      Total Marks
                    </span>
                    <span className="font-bold text-[#0f172a]">
                      {exam.marks}
                    </span>
                  </div>
                </div>

                {/* Start Exam Button */}
                <Link
                  href="/login"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #0d5c5c 0%, #0f172a 100%)",
                  }}
                >
                  Start Exam
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Call To Action */}
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
          <div
            className="relative overflow-hidden rounded-3xl px-6 py-12 text-center shadow-xl sm:px-12 sm:py-14"
            style={{
              background:
                "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0d5c5c 100%)",
            }}
          >
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#2dd4bf]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

            <div className="relative">
              <span className="text-4xl">🎓</span>

              <h2 className="mt-5 text-2xl font-black text-white sm:text-3xl">
                Want Full Video Classes with Your Tests?
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Enroll in a course and get model tests, result analytics and
                mentor support to make your preparation more effective.
              </p>

              <Link
                href="/tutorials"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2dd4bf] px-8 py-3.5 text-sm font-extrabold text-[#0f172a] shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-teal-200 hover:shadow-xl"
              >
                🎓 Browse Courses
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
