import Link from "next/link";
import type { User } from "@/lib/types";

// TODO: change this to the real URL of your "View Results" page
const RESULTS_HREF = "/student/dashboard";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`truncate text-right ${value ? "text-slate-800" : "text-slate-400"}`}>
        {value || "Not added"}
      </span>
    </div>
  );
}

export default function ProfilePopup({
  user,
  dashboardHref,
  onClose,
  onLogout,
}: {
  user: User;
  dashboardHref: string;
  onClose: () => void;
  onLogout: () => void;
}) {
  const linkBtn =
    "block rounded-lg px-3 py-2 text-center text-sm font-semibold";

  return (
    <div
      role="dialog"
      className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
    >
      {/* Top: photo, name, role */}
      <div className="flex items-center gap-3">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-14 w-14 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-bold text-slate-800">{user.name}</p>
          <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
            {user.role}
          </span>
        </div>
      </div>

      {/* Short summary */}
      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
        <Row label="Email" value={user.email} />
        <Row label="Phone" value={user.phone} />
        {user.role === "STUDENT" && (
          <>
            <Row label="Institute" value={user.institute} />
            <Row label="Target exam" value={user.targetExam} />
          </>
        )}
        {user.role === "TEACHER" && (
          <>
            <Row label="Designation" value={user.designation} />
            <Row label="Subject" value={user.subject} />
          </>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-4 space-y-2">
        <Link
          href="/profile"
          onClick={onClose}
          className={`${linkBtn} bg-indigo-600 text-white hover:bg-indigo-700`}
        >
          ✏️ Edit Profile
        </Link>

        {user.role === "STUDENT" && (
          <Link
            href={RESULTS_HREF}
            onClick={onClose}
            className={`${linkBtn} border border-indigo-600 text-indigo-600 hover:bg-indigo-50`}
          >
            📄 View Results
          </Link>
        )}

        <Link
          href={dashboardHref}
          onClick={onClose}
          className={`${linkBtn} border border-slate-300 text-slate-700 hover:bg-slate-50`}
        >
          📊 Dashboard
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className={`${linkBtn} w-full text-red-600 hover:bg-red-50`}
        >
          Logout
        </button>
      </div>
    </div>
  );
}