export function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// <input type="datetime-local"> value -> ISO string the backend accepts
export function toIso(local: string): string {
  return new Date(local).toISOString();
}

// Date -> value for <input type="datetime-local">
export function toLocalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// 3725 -> "1:02:05", 125 -> "02:05"
export function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(m)}:${p(r)}` : `${p(m)}:${p(r)}`;
}
