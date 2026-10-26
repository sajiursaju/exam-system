import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-6 font-serif text-3xl font-semibold" style={{ color: "var(--accent)" }}>
        Exam Portal
      </Link>
      <div className="panel p-6">{children}</div>
    </div>
  );
}
