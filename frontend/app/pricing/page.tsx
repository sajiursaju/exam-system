// frontend/app/pricing/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const packages = [
  {
    id: "academic",
    title: "Academic Package",
    price: "৳1,000",
    validity: "1 Year Validity",
    description: "Perfect for school and college students.",
    features: [
      "Class 9-10 & HSC 11-12 Mock Exams",
      "English (Basic to Advance) Tests",
      "Detailed Performance Analytics",
      "Instant Results & Answer Sheets",
      "Priority Support",
    ],
    icon: "🎓",
  },
  {
    id: "job",
    title: "Job Preparation",
    price: "৳1,500",
    validity: "1 Year Validity",
    description: "The ultimate prep kit for govt job seekers.",
    features: [
      "BCS, Bank Job & Primary Teacher",
      "Niyogon & All Job Exams",
      "Timed Mock Tests & Question Banks",
      "Advanced Analytics (Weak Area Detection)",
      "Priority Support",
    ],
    icon: "💼",
  },
  {
    id: "mega",
    title: "Mega Bundle (All Access)",
    price: "৳2,000",
    validity: "1 Year Validity",
    description: "Everything you need for academic & job success.",
    features: [
      "All Academic Categories",
      "All Job Preparation Categories",
      "Unlimited Mock Exams",
      "Advanced PDF Question Downloads",
      "Premium 1-on-1 Support",
    ],
    icon: "🚀",
    highlight: true,
  },
];

export default function PricingPage() {
  const [selectedCategory, setSelectedCategory] = useState("BCS");

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-16">
          <span className="inline-block rounded-full bg-teal-100 px-4 py-1 text-xs font-semibold text-teal-800 mb-4 border border-teal-200">
            1-YEAR ACCESS PACKAGES
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 font-serif">
            Invest in Your Future
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose a package that fits your goals. One payment, 1 full year of unlimited access to premium exam resources.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {packages.map((pkg) => (
            <div 
              key={pkg.id}
              className={`relative flex flex-col bg-white rounded-2xl p-8 shadow-sm transition-all duration-300 hover:shadow-xl ${
                pkg.highlight 
                  ? "border-2 border-teal-600 transform md:-translate-y-4 shadow-lg" 
                  : "border border-slate-200"
              }`}
            >
              {pkg.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-md">
                  BEST VALUE
                </div>
              )}

              <div className="text-3xl mb-4">{pkg.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">{pkg.title}</h3>
              <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{pkg.description}</p>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{pkg.price}</span>
                  <span className="text-sm text-slate-500 font-medium">/ one-time</span>
                </div>
                <div className="inline-block mt-2 bg-teal-50 text-teal-700 text-xs font-bold px-2 py-1 rounded">
                  ✅ {pkg.validity}
                </div>
              </div>

              <ul className="flex-1 space-y-3 mb-8 text-sm text-slate-600">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-teal-500 font-bold mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                href={`/register?package=${pkg.id}`} 
                className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                  pkg.highlight 
                    ? "bg-teal-700 text-white hover:bg-teal-800" 
                    : "border border-teal-600 text-teal-700 hover:bg-teal-50"
                }`}
              >
                Get 1-Year Access
              </Link>
            </div>
          ))}
        </div>

        {/* Single Category Option */}
        <div className="mt-16 bg-white border border-slate-200 rounded-2xl p-8 max-w-3xl mx-auto text-center shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Just need one specific category?</h3>
          <p className="text-slate-500 text-sm mb-6">Select a single category below to get 1-year access for ৳600.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <select 
              className="w-full sm:w-64 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Class 9-10">Class 9-10</option>
              <option value="HSC 11-12">HSC 11-12</option>
              <option value="English (Basic to Advance)">English (Basic to Advance)</option>
              <option value="Admission">Admission</option>
              <option value="Nursing">Nursing</option>
              <option value="Primary Teacher">Primary Teacher</option>
              <option value="BCS">BCS</option>
              <option value="Bank Job">Bank Job</option>
              <option value="Niyogon">Niyogon</option>
              <option value="All Job Preparation">All Job Preparation</option>
            </select>
            
            <Link 
              href={`/register?category=${encodeURIComponent(selectedCategory)}`}
              className="w-full sm:w-auto bg-slate-900 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              Buy for ৳600
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}