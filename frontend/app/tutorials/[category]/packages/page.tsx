// app/tutorials/[category]/packages/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import { getCategory, getPackages } from "@/lib/tutorialData";

export default async function PackagesPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const packages = getPackages(category);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Link
          href={`/tutorials/${category.slug}`}
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Back to syllabus
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
          Choose your package
        </h1>
        <p className="mt-1 text-slate-600">
          {category.icon} {category.name} ({category.nameBn})
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                pkg.popular
                  ? "border-indigo-500 ring-2 ring-indigo-500"
                  : "border-slate-200"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">
                  Most popular
                </span>
              )}

              <h2 className="text-xl font-bold text-slate-800">{pkg.name}</h2>
              <p className="mt-3 text-4xl font-extrabold text-indigo-600">
                ৳{pkg.price.toLocaleString("en-US")}
              </p>
              <p className="text-sm text-slate-500">{pkg.duration} access</p>

              <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600">
                {pkg.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/checkout?category=${category.slug}&package=${pkg.id}`}
                className={`mt-6 rounded-lg px-4 py-3 text-center font-semibold ${
                  pkg.popular
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                Enroll Now
              </Link>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}