// One place for every call to the backend. Paths look like "/auth/login".
// They go to /api/... on this site, and next.config.ts forwards them to Express.

export class ApiError extends Error {
  status: number;
  data: any; // extra fields from the backend, for example { finished: true } or { attemptId }

  constructor(status: number, message: string, data: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type Options = { method?: string; body?: unknown };

export async function api<T = any>(path: string, options: Options = {}): Promise<T> {
  const hasBody = options.body !== undefined;

  const res = await fetch(`/api${path}`, {
    method: options.method ?? (hasBody ? "POST" : "GET"),
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    credentials: "same-origin",
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // empty or non-JSON reply
  }

  if (!res.ok) {
    let message: string = data?.message ?? `Request failed (${res.status})`;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors
        .map((e: { field?: string; message: string }) => (e.field ? `${e.field}: ${e.message}` : e.message))
        .join(". ");
    }
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}
