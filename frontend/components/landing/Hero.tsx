import Link from "next/link";

export default function Hero() {
  return (
    <section id="home" className="bg-gradient-to-b from-indigo-50 to-white">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
        <span className="rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold text-indigo-700">
          BCS &amp; Job Exam Preparation
        </span>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
          Take Exams Online.
          <br />
          <span className="text-indigo-600">Track Your Progress.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Timed exams, instant results and detailed analytics for students,
          teachers and admins, all in one platform.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="w-full rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 sm:w-auto"
          >
            Login to Start
          </Link>
          <Link
            href="/#demo"
            className="w-full rounded-lg border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 sm:w-auto"
          >
            Request Demo
          </Link>
        </div>
      </div>
    </section>
  );
}