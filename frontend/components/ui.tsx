import type { AttemptStatus, ExamState } from "@/lib/types";

export type Tone = "neutral" | "info" | "good" | "warn" | "bad";

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "good" | "warn" | "bad"; children: React.ReactNode }) {
  return (
    <div className={`notice notice-${tone}`} role={tone === "bad" ? "alert" : "status"}>
      {children}
    </div>
  );
}

export function Loading({ text = "Loading…" }: { text?: string }) {
  return <p className="py-8 text-sm" style={{ color: "var(--muted)" }}>{text}</p>;
}

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export const STATE_LABEL: Record<ExamState, string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Open now",
  COMPLETED: "Closed",
};

export function stateTone(s: ExamState): Tone {
  return s === "ONGOING" ? "good" : s === "UPCOMING" ? "info" : "neutral";
}

export const ATTEMPT_LABEL: Record<AttemptStatus, string> = {
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  AUTO_SUBMITTED: "Auto-submitted",
  GRADED: "Graded",
};

export function attemptTone(s: AttemptStatus): Tone {
  if (s === "GRADED") return "good";
  if (s === "IN_PROGRESS") return "info";
  if (s === "AUTO_SUBMITTED") return "warn";
  return "neutral";
}
