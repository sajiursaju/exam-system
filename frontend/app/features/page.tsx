// app/features/page.tsx

import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

type Feature = {
  icon: string;
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
};

const features: Feature[] = [
  {
    icon: "📝",
    title: "Online Exams",
    description:
      "Take timed MCQ, true/false and short-answer exams with a live timer, auto-submit and a question navigator.",
    buttonLabel: "See Online Exams",
    href: "/#online-exams",
  },
  {
    icon: "🎬",
    title: "Video Courses",
    description:
      "Subject-wise video classes for Class 9-12 and govt job preparation, with a full syllabus for every course.",
    buttonLabel: "Browse Tutorials",
    href: "/tutorials",
  },
  {
    icon: "🏛️",
    title: "BCS & Govt Job Prep",
    description:
      "BCS, Bank, Niyogon and Primary Teacher preparation with syllabus-wise classes and model tests.",
    buttonLabel: "View Job Courses",
    href: "/tutorials/bcs",
  },
  {
    icon: "📊",
    title: "Result Analytics",
    description:
      "See your score, correct and wrong answers, and track your progress after every exam.",
    buttonLabel: "Try an Exam",
    href: "/#online-exams",
  },
  {
    icon: "🛡️",
    title: "Secure Exam Screen",
    description:
      "Tab-switch warning and question randomization help keep every exam fair.",
    buttonLabel: "Learn More",
    href: "/#faq",
  },
  {
    icon: "👨‍🏫",
    title: "Teacher & Student Dashboards",
    description:
      "Teachers manage exams and students. Students see their courses, results and profile in one place.",
    buttonLabel: "Login",
    href: "/login",
  },
  {
    icon: "💳",
    title: "Easy Packages",
    description:
      "Pick a Basic, Standard or Premium package for any course and enroll in a few clicks.",
    buttonLabel: "See Pricing",
    href: "/#pricing",
  },
  {
    icon: "📱",
    title: "Works on Mobile",
    description:
      "Study and take exams from your phone, tablet or computer, whenever you want.",
    buttonLabel: "Request Demo",
    href: "/#demo",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Features</h1>
        <p className="mt-2 text-slate-600">
          Everything you need to study, practice and prepare for your next exam.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-md"
            >
              <div className="text-4xl">{f.icon}</div>
              <h2 className="mt-3 text-lg font-bold text-slate-800">{f.title}</h2>
              <p className="mt-2 flex-1 text-sm text-slate-600">{f.description}</p>
              <Link
                href={f.href}
                className="mt-5 rounded-lg border border-indigo-600 px-4 py-2 text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                {f.buttonLabel} →
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom call to action */}
        <div className="mt-12 rounded-2xl bg-indigo-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Ready to start learning?
          </h2>
          <p className="mt-2 text-slate-600">
            Choose a course and start your preparation today.
          </p>
          <Link
            href="/tutorials"
            className="mt-5 inline-block rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow hover:bg-indigo-700"
          >
            🎓 Explore Courses
          </Link>
        </div>
      </main>
    </>
  );
}