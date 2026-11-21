// app/tutorials/page.tsx

import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import { categories, type Category } from "@/lib/tutorialData";

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/tutorials/${category.slug}`}
      className="group flex flex-col rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-lg"
    >
      {/* Icon box */}
      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-50 text-3xl transition group-hover:bg-emerald-600">
        {category.icon}
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-800 group-hover:text-emerald-700">
        {category.name}
      </h3>
      <p className="text-sm font-medium text-emerald-600">{category.nameBn}</p>
      <p className="mt-2 flex-1 text-sm text-slate-600">{category.description}</p>

      {/* Bottom box with a divider line above it */}
      <div className="mt-5 border-t border-slate-200 pt-4">
        <span className="inline-block rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition group-hover:bg-emerald-600 group-hover:text-white">
          View syllabus →
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
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Tutorials</h1>
        <p className="mt-2 text-slate-600">
          Choose a category to see the full syllabus and video course.
        </p>

        {/* Academic */}
        <h2 className="mt-10 text-xl font-bold text-slate-800">
          📚 Academic (Class 9-12)
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {academic.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>

        {/* Job preparation */}
        <h2 className="mt-12 text-xl font-bold text-slate-800">
          💼 Govt Job Preparation
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {job.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </main>
    </>
  );
}