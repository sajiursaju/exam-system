
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

      <main className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0d5c5c]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-300 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-300 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-14 text-center sm:py-16">
            <span className="inline-flex rounded-full border border-teal-300/30 bg-teal-300/10 px-4 py-2 text-sm font-semibold text-teal-200">
              Choose Your Learning Plan
            </span>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Choose Your Package
            </h1>

            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              {category.icon} {category.name} ({category.nameBn})
            </p>

            <div className="mx-auto mt-7 h-1 w-20 rounded-full bg-teal-400" />
          </div>
        </section>

        {/* Packages */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <Link
            href={`/tutorials/${category.slug}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-500 hover:text-teal-700"
          >
            <span>←</span>
            Back to syllabus
          </Link>

          <div className="mb-10 mt-10 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-teal-600">
              Flexible Learning Options
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Select the Right Plan for You
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Choose a package that matches your learning goals and get started
              with your preparation.
            </p>
          </div>

          <div className="grid items-stretch gap-7 md:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  pkg.popular
                    ? "border-teal-500 shadow-lg shadow-teal-900/10 ring-2 ring-teal-500/20"
                    : "border-slate-200 hover:border-teal-300"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-teal-600 px-4 py-1.5 text-xs font-bold text-white shadow-md">
                    Most Popular
                  </span>
                )}

                {/* Package name */}
                <div className="border-b border-slate-100 pb-5">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {pkg.name}
                  </h3>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-teal-600">
                      ৳
                    </span>
                    <span className="text-4xl font-extrabold tracking-tight text-teal-700">
                      {pkg.price.toLocaleString("en-US")}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {pkg.duration} access
                  </p>
                </div>

                {/* Package features */}
                <div className="flex-1 py-6">
                  <p className="mb-4 text-sm font-bold text-slate-800">
                    What's included
                  </p>

                  <ul className="space-y-3 text-sm text-slate-600">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-600">
                          ✓
                        </span>
                        <span className="leading-6">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Enroll button */}
                <Link
                  href={`/checkout?category=${category.slug}&package=${pkg.id}`}
                  className={`mt-auto block rounded-xl px-5 py-3.5 text-center text-sm font-bold transition-all duration-300 ${
                    pkg.popular
                      ? "bg-gradient-to-r from-[#0d5c5c] to-[#0f172a] text-white shadow-md hover:shadow-lg hover:brightness-110"
                      : "border border-teal-600 bg-white text-teal-700 hover:bg-teal-600 hover:text-white"
                  }`}
                >
                  Enroll Now →
                </Link>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <div className="mt-12 rounded-2xl border border-teal-100 bg-teal-50/70 p-6 text-center">
            <h3 className="font-bold text-slate-900">
              Ready to start learning?
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Select your preferred package above and begin your learning
              journey.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
