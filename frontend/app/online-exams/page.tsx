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
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Online Exams</h1>
        <p className="mt-2 text-slate-600">
          Practice with timed model tests and see your result right after you submit.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div
              key={exam.title}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">{exam.icon}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    exam.type === "Free"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {exam.type}
                </span>
              </div>

              <h2 className="mt-3 text-lg font-bold text-slate-800">{exam.title}</h2>
              <p className="text-sm font-medium text-indigo-500">{exam.titleBn}</p>

              <ul className="mt-4 flex-1 space-y-1 text-sm text-slate-600">
                <li>❓ {exam.questions} questions</li>
                <li>⏱️ {exam.duration}</li>
                <li>🎯 {exam.marks} marks</li>
              </ul>

              <Link
                href="/login"
                className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Start Exam →
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom call to action */}
        <div className="mt-12 rounded-2xl bg-indigo-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Want full video classes with your tests?
          </h2>
          <p className="mt-2 text-slate-600">
            Enroll in a course and get model tests, result analytics and mentor support.
          </p>
          <Link
            href="/tutorials"
            className="mt-5 inline-block rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow hover:bg-indigo-700"
          >
            🎓 Browse Courses
          </Link>
        </div>
      </main>
    </>
  );
}