
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import { categories, type Category } from "@/lib/tutorialData";

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/tutorials/${category.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-400 hover:shadow-xl"
    >
      {/* Icon */}
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-3xl transition-all duration-300 group-hover:bg-teal-600 group-hover:text-white">
        {category.icon}
      </div>

      {/* Category information */}
      <h3 className="mt-5 text-lg font-bold text-slate-900 transition group-hover:text-teal-700">
        {category.name}
      </h3>

      <p className="mt-1 text-sm font-semibold text-teal-600">
        {category.nameBn}
      </p>

      <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
        {category.description}
      </p>

      {/* Action */}
      <div className="mt-6 border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all duration-300 group-hover:bg-teal-600 group-hover:text-white">
          View syllabus
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function TutorialsPage() {
  const academic = categories.filter((c) => c.group === "academic");
  const job = categories.filter((c) => c.group === "job");

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0d5c5c]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-300 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-300 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:py-20">
            <span className="inline-flex rounded-full border border-teal-300/30 bg-teal-300/10 px-4 py-2 text-sm font-semibold text-teal-200">
              Learn • Practice • Succeed
            </span>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Tutorials & Video Courses
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Choose your learning category to explore the syllabus and
              available video courses.
            </p>

            <div className="mx-auto mt-8 h-1 w-20 rounded-full bg-teal-400" />
          </div>
        </section>

        {/* Tutorial Categories */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          {/* Academic */}
          <div>
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-teal-600">
                School & College
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                📚 Academic (Class 9-12)
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Explore academic subjects and learning resources.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {academic.map((c) => (
                <CategoryCard key={c.slug} category={c} />
              ))}
            </div>
          </div>

          {/* Job Preparation */}
          <div className="mt-16">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-teal-600">
                Career & Recruitment
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                💼 Govt Job Preparation
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Prepare for government job examinations with structured
                learning resources.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {job.map((c) => (
                <CategoryCard key={c.slug} category={c} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
