// app/tutorials/[category]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import { getCategory } from "@/lib/tutorialData";

export default async function SyllabusPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  // The folder is named [category], so the URL part arrives as params.category
  const { category: slug } = await params;
  const category = getCategory(slug);

  // Unknown slug (e.g. /tutorials/abc) → show the 404 page
  if (!category) notFound();

  const totalMarks = category.subjects.reduce((sum, s) => sum + (s.marks ?? 0), 0);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/tutorials" className="text-sm font-medium text-indigo-600 hover:underline">
          ← All categories
        </Link>

        {/* Header + Buy button */}
        <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-indigo-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-4xl">{category.icon}</div>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
              {category.name}
            </h1>
            <p className="text-indigo-600">{category.nameBn}</p>
            <p className="mt-2 text-sm text-slate-600">{category.description}</p>
            {totalMarks > 0 && (
              <p className="mt-1 text-sm font-semibold text-slate-700">
                Total marks: {totalMarks}
              </p>
            )}
          </div>
          <Link
            href={`/tutorials/${category.slug}/packages`}
            className="rounded-xl bg-indigo-600 px-8 py-3 text-center text-lg font-bold text-white shadow hover:bg-indigo-700"
          >
            🛒 Buy Course
          </Link>
        </div>

        {/* Syllabus */}
        <h2 className="mt-10 text-2xl font-bold text-slate-800">
          Syllabus (Subject wise)
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {category.subjects.map((subject) => (
            <div
              key={subject.name}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-800">{subject.name}</h3>
                {subject.marks && (
                  <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    {subject.marks} marks
                  </span>
                )}
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {subject.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Buy button */}
        <div className="mt-10 text-center">
          <Link
            href={`/tutorials/${category.slug}/packages`}
            className="inline-block rounded-xl bg-indigo-600 px-10 py-3 text-lg font-bold text-white shadow hover:bg-indigo-700"
          >
            🛒 Buy Course
          </Link>
        </div>
      </main>
    </>
  );
}