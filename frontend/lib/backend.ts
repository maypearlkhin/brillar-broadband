import { cookies, headers } from "next/headers";

export function getBackendUrl() {
  return process.env.BACKEND_URL ?? "http://127.0.0.1:4000";
}

/**
 * Base URL for Server Component `fetch()` to public `/api/*` routes.
 * Uses the current request host so Next.js rewrites (`/api` → backend) apply — same as the browser.
 * Falls back to {@link getBackendUrl} when headers are unavailable (e.g. rare edge cases).
 */
export function getServerApiBaseUrl(): string {
  const headerList = headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (host) {
    const proto = headerList.get("x-forwarded-proto") ?? "http";
    return `${proto}://${host}`;
  }

  return getBackendUrl();
}

/** Server-side fetch to the Node API, forwarding browser cookies (JWT). */
export async function backendFetch(path: string, init?: RequestInit) {
  const url = `${getBackendUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      ...(cookieHeader ? { cookie: cookieHeader } : {})
    },
    cache: "no-store"
  });
}
