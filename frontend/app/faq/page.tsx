// frontend/app/faq/page.tsx
"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const faqs = [
  {
    category: "General",
    question: "What is Mr Exam Mentor Mainul?",
    answer: "It is an intelligent online examination platform designed to help students prepare for academic and job exams. We offer timed mock tests, instant results, and detailed performance analytics for classes, admission tests, and government job preparations.",
  },
  {
    category: "General",
    question: "Who can use this platform?",
    answer: "Anyone! We have categories for Class 9-10, HSC 11-12, English learners, Admission seekers, Nursing students, and job aspirants for BCS, Bank Jobs, Primary Teacher, and Niyogon exams.",
  },
  {
    category: "Exams",
    question: "How do I take an exam?",
    answer: "Once you register and log in, go to your dashboard, select an exam from your Target Exam category, and click 'Start Exam'. You will see a live timer, question navigator, and options to flag questions for review.",
  },
  {
    category: "Exams",
    question: "Can I pause an exam?",
    answer: "No, once you start an exam, the timer keeps running. If you close the tab or switch tabs, your tab-switch count will increase. If you exceed the maximum allowed tab switches, the exam will auto-submit.",
  },
  {
    category: "Exams",
    question: "What if the internet disconnects during the exam?",
    answer: "Don't panic! Every time you select an answer, it is instantly saved to the server. If your internet drops, just log back in, and the system will resume your exam exactly where you left off (as long as the timer hasn't run out).",
  },
  {
    category: "Pricing",
    question: "How much does it cost?",
    answer: "We offer a one-time payment for 1-year access. You can buy a single category (e.g., only BCS) for ৳600, an Academic Package for ৳1,000, a Job Prep Package for ৳1,500, or the Mega Bundle (All Access) for ৳2,000.",
  },
  {
    category: "Pricing",
    question: "Does the 1-year package renew automatically?",
    answer: "No, our packages are one-time payments. You will not be charged automatically. When the year ends, you can choose to renew if you wish.",
  },
  {
    category: "Results",
    question: "How quickly do I get my results?",
    answer: "For MCQ and True/False questions, you get your score instantly after submission. For Short Answer questions, a teacher will manually grade them, which may take 24-48 hours. You can track your results on your dashboard.",
  },
  {
    category: "Results",
    question: "Can I download my question papers or results?",
    answer: "Yes! After the exam ends, you can view a detailed breakdown of your answers and download your results. Admins can also download category-wise result sheets in CSV format.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 font-serif">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Find answers to common questions about our exams, pricing, and platform.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
              >
                <div>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1 block">
                    {faq.category}
                  </span>
                  <span className="font-semibold text-slate-800 text-lg">
                    {faq.question}
                  </span>
                </div>
                <span className="text-teal-600 text-2xl font-bold ml-4">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              
              {openIndex === index && (
                <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 text-center bg-teal-50 border border-teal-100 p-8 rounded-2xl">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Still have questions?</h3>
          <p className="text-slate-600 mb-6">If you cannot find the answer you are looking for, please contact us.</p>
          <a 
            href="https://www.facebook.com/mainulhmoni11" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-800 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>

      <Footer />
    </main>
  );
}