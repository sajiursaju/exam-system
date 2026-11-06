import Link from "next/link";

// Short pill labels for the hero. Each `slug` matches a category in lib/tutorialData.ts,
// so every pill opens its own page: /tutorials/[slug]
const categories = [
  { label: "Class 9-10", slug: "class-9-10" },
  { label: "HSC 11-12", slug: "hsc-11-12" },
  { label: "English (Basic to Advance)", slug: "english" },
  { label: "Admission", slug: "admission" },
  { label: "Nursing", slug: "nursing" },
  { label: "Primary Teacher", slug: "primary" },
  { label: "BCS", slug: "bcs" },
  { label: "Bank Job", slug: "bank-job" },
  { label: "Niyogon", slug: "niyogon" },
  { label: "All Job Preparation", slug: "all-job" },
];

export default function Hero() {
  return (
    <section id="home" className="bg-gradient-to-b from-indigo-50 to-white">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
        <span className="rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold text-indigo-700">
          School &middot; College &middot; Admission &middot; Nursing &middot; Government Job Preparation
        </span>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
          One Platform for Every Exam.
          <br />
          <span className="text-indigo-600">Prepare. Practice. Succeed.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          From English (Basic to Advance), Class 9-10 and HSC to Admission,
          Nursing, BCS, Primary Teacher, Bank Job and all job exams: take timed
          online exams, get instant results and track your progress with
          detailed analytics for students, teachers and admins.
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

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/tutorials/${c.slug}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-400 hover:text-indigo-600"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}