// app/tutorials/page.tsx

import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import { categories, type Category } from "@/lib/tutorialData";

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/tutorials/${category.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-md"
    >
      <div className="text-4xl">{category.icon}</div>
      <h3 className="mt-3 text-lg font-bold text-slate-800 group-hover:text-indigo-600">
        {category.name}
      </h3>
      <p className="text-sm font-medium text-indigo-500">{category.nameBn}</p>
      <p className="mt-2 text-sm text-slate-600">{category.description}</p>
      <p className="mt-4 text-sm font-semibold text-indigo-600">
        View syllabus →
      </p>
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