// components/landing/Hero.tsx
import Link from "next/link";

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
    <section id="home" className="bg-gradient-to-b from-teal-50/50 to-white">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
        
        {/* Top Badge */}
        <span className="inline-block rounded-full bg-teal-100/80 px-4 py-1.5 text-xs font-semibold text-teal-800 border border-teal-200/50">
          School &middot; College &middot; Admission &middot; Nursing &middot; Govt. Job Preparation
        </span>

        {/* Main Headline */}
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
          Your Gateway to
          <br />
          <span className="text-teal-700">Exam Success.</span>
        </h1>

        {/* Professional Description */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
          Master your exams with our intelligent preparation platform. From school and college 
          subjects to admission tests, BCS, and government job preparation, we provide timed 
          online exams, instant results, and detailed performance analytics to help you succeed.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="w-full rounded-lg bg-teal-700 px-8 py-3 font-semibold text-white shadow-lg shadow-teal-700/20 hover:bg-teal-800 transition-all sm:w-auto"
          >
            Start Learning Now
          </Link>
          <Link
            href="/#demo"
            className="w-full rounded-lg border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-700 hover:border-teal-600 hover:text-teal-700 transition-all sm:w-auto"
          >
            Request a Demo
          </Link>
        </div>

        {/* Category Pills */}
        <div className="mt-14">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Explore Categories
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/tutorials/${c.slug}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-teal-500 hover:text-teal-700 transition-all hover:shadow-md"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}