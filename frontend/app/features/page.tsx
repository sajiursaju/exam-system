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
    href: "/online-exams",
  },
  {
    icon: "🎬",
    title: "Video Courses",
    description:
      "Subject-wise video classes for Class 9-12, English, Admission, Nursing and job preparation, with a full syllabus for every course.",
    buttonLabel: "Browse Tutorials",
    href: "/tutorials",
  },
  {
    icon: "🔤",
    title: "English (Basic to Advance)",
    description:
      "Learn English step by step: grammar, vocabulary, reading, writing and spoken English, from the basics to advanced level.",
    buttonLabel: "View English Course",
    href: "/tutorials/english",
  },
  {
    icon: "🎯",
    title: "Admission Preparation",
    description:
      "University and college admission test preparation with subject-wise classes and model tests.",
    buttonLabel: "View Admission Course",
    href: "/tutorials/admission",
  },
  {
    icon: "🩺",
    title: "Nursing Preparation",
    description:
      "Nursing admission and recruitment preparation covering science subjects and core nursing topics.",
    buttonLabel: "View Nursing Course",
    href: "/tutorials/nursing",
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
    icon: "💼",
    title: "All Job Preparation",
    description:
      "One complete course covering every major government and private job exam, from Bangla and English to ICT and reasoning.",
    buttonLabel: "View All Job Course",
    href: "/tutorials/all-job",
  },
  {
    icon: "🚢",
    title: "Marine Engineering",
    description:
      "Marine Engineering preparation covering technical subjects, navigation, ship operations and recruitment exams for Bangladesh marine sector jobs.",
    buttonLabel: "View Marine Course",
    href: "/tutorials/marine-engineering",
  },
  {
    icon: "📊",
    title: "Result Analytics",
    description:
      "See your score, correct and wrong answers, and track your progress after every exam.",
    buttonLabel: "Try an Exam",
    href: "/online-exams",
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

      <main className="min-h-screen bg-slate-50">

        {/* HERO SECTION */}
        <section
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0d5c5c 100%)",
          }}
        >
          {/* Decorative background circles */}
          <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-teal-300 opacity-[0.08]" />
          <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-cyan-300 opacity-[0.06]" />

          <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">

            <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
              <span className="h-2 w-2 rounded-full bg-teal-300" />
              Everything You Need
            </span>

            <h1 className="mx-auto mt-6 max-w-4xl font-serif text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Powerful Features for{" "}
              <span className="text-teal-300">
                Smarter Learning
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Everything you need to study, practice and prepare for your next exam.
              Explore our learning tools, online examinations and preparation programs.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/tutorials"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                style={{ background: "#2dd4bf" }}
              >
                Explore Courses
                <span>→</span>
              </Link>

              <Link
                href="/online-exams"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-white/20"
              >
                Take an Exam
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">

          {/* Section heading */}
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              Our Platform
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
              Everything in One Place
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Discover the tools and resources designed to make your preparation
              easier, more effective and more organized.
            </p>

            <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-teal-500" />
          </div>

          {/* Feature cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {features.map((f, index) => (
              <div
                key={f.title}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-teal-300 hover:shadow-xl"
              >
                {/* Top accent */}
                <div
                  className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  style={{
                    background:
                      "linear-gradient(90deg, #0d5c5c, #2dd4bf)",
                  }}
                />

                {/* Icon and number */}
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-4xl transition-all duration-300 group-hover:scale-110 group-hover:bg-teal-100">
                    {f.icon}
                  </div>

                  <span className="text-xs font-bold tracking-widest text-slate-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Card content */}
                <h2 className="mt-5 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-teal-800">
                  {f.title}
                </h2>

                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                  {f.description}
                </p>

                {/* Card link */}
                <Link
                  href={f.href}
                  className="mt-6 inline-flex items-center justify-between gap-2 rounded-xl border border-teal-700/20 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-800 transition-all duration-200 hover:border-teal-700 hover:bg-teal-700 hover:text-white"
                >
                  {f.buttonLabel}

                  <span className="text-base transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="px-4 pb-16 sm:px-6 sm:pb-20">
          <div
            className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 py-12 text-center shadow-xl sm:px-12 sm:py-16"
            style={{
              background:
                "linear-gradient(135deg, #0d5c5c 0%, #0f172a 100%)",
            }}
          >
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-teal-300 opacity-10" />
            <div className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-cyan-300 opacity-10" />

            <div className="relative">
              <span className="text-4xl">🎓</span>

              <h2 className="mx-auto mt-5 max-w-2xl font-serif text-3xl font-bold text-white sm:text-4xl">
                Ready to Start Learning?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Choose a course and start your preparation today.
                Take the next step toward achieving your academic and career goals.
              </p>

              <Link
                href="/tutorials"
                className="mt-8 inline-flex items-center justify-center gap-3 rounded-xl px-8 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                style={{ background: "#2dd4bf" }}
              >
                🎓 Explore Courses
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}