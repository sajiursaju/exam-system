import Link from "next/link";
import { siteConfig, navLinks } from "@/lib/siteConfig";

export default function Footer() {
  return (
    <>
      {/* Request Demo section: target of every "Request Demo" button (/#demo) */}
      <section id="demo" className="bg-indigo-600 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-bold">Want to see it in action?</h2>
          <p className="mt-3 text-indigo-100">
            Request a free demo and we will show you how the platform works.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:your@email.com?subject=Demo Request"
              className="w-full rounded-lg bg-white px-8 py-3 font-semibold text-indigo-600 hover:bg-indigo-50 sm:w-auto"
            >
              🎬 Request Demo
            </a>
            <Link
              href="/login"
              className="w-full rounded-lg border border-white px-8 py-3 font-semibold hover:bg-indigo-700 sm:w-auto"
            >
              🔐 Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
          {/* Column 1: brand */}
          <div>
            <h3 className="text-xl font-extrabold text-white">{siteConfig.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{siteConfig.tagline}</p>
            <p className="mt-4 text-sm text-slate-400">
              An online examination platform for BCS and job exam preparation, with
              timed exams, instant results and analytics.
            </p>
          </div>

          {/* Column 2: quick links */}
          <div>
            <h4 className="font-semibold text-white">Quick Links</h4>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/login" className="hover:text-white">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: contact */}
          <div>
            <h4 className="font-semibold text-white">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>📧 your@email.com</li>
              <li>📞 +880 1XXX-XXXXXX</li>
              <li>📍 Your city, Bangladesh</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 py-5 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </div>
      </footer>
    </>
  );
}