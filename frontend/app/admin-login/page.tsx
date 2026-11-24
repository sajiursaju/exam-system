
import AuthLoginForm from "@/components/AuthLoginForm";

const features = [
  "Manage exams & questions",
  "Approve student accounts",
  "View results & analytics",
];

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      {/* Left branding panel */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0d5c5c] px-5 py-10 text-center sm:px-8 sm:py-14 lg:min-h-screen lg:w-[45%] lg:px-12 lg:py-16">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 flex w-full max-w-md flex-col items-center">
          {/* Logo */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-400/10 text-3xl shadow-xl shadow-teal-950/20 sm:h-20 sm:w-20 sm:text-4xl">
            🎓
          </div>

          {/* Brand */}
          <h1 className="mt-5 text-2xl font-black tracking-tight text-white sm:mt-7 sm:text-4xl">
            Mentor Mainul
          </h1>

          <div className="mt-3 h-1 w-16 rounded-full bg-teal-400" />

          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300 sm:text-base">
            Staff & Admin Portal — secure access only
          </p>

          {/* Features */}
          <div className="mt-7 w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm sm:mt-10 sm:p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-teal-300">
              Portal Features
            </p>

            <div className="space-y-4">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 text-sm text-slate-200"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-400/15 text-xs font-bold text-teal-300">
                    ✓
                  </span>
                  <span className="leading-5">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Authorized staff access only
          </p>
        </div>
      </section>

      {/* Right login panel */}
      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 sm:py-14 lg:min-h-screen lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center lg:mb-8">
            <span className="inline-flex rounded-full border border-teal-100 bg-teal-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-700">
              Secure Login
            </span>

            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Welcome Back
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to access your staff dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8">
            <AuthLoginForm
              allowedRoles={["ADMIN", "TEACHER"]}
              themeColor="#0d5c5c"
              title="Staff Sign In"
              subtitle="Admin and Teacher accounts only"
              redirectPath="/admin/dashboard"
              studentLoginPath="/login"
            />
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            Protected access for authorized administrators and teachers.
          </p>
        </div>
      </section>
    </main>
  );
}
