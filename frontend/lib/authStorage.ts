import { TOKEN_COOKIE } from "./authConstants";

/**
 * Auth token storage on the **frontend's** domain (NOT httpOnly).
 *
 * The cookie is set by JavaScript after login, so it lives under the page host (e.g.
 * `brillarbroadband.atenxion.ai`). Next middleware and Server Components read it from
 * the request — no cross-site cookie sharing required.
 *
 * The actual API request to Express uses `Authorization: Bearer …`, not cookies, so the
 * backend can be on any origin (subdomain, different port, even different domain).
 */

const SEVEN_DAYS_IN_DAYS = 7;

function canUseDocumentCookie() {
  return typeof document !== "undefined";
}

export function setAuthToken(token: string) {
  if (!canUseDocumentCookie()) {
    return;
  }

  const expires = new Date(Date.now() + SEVEN_DAYS_IN_DAYS * 24 * 60 * 60 * 1000).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Expires=${expires}; Path=/; SameSite=Lax${secure}`;
}

export function getAuthToken(): string | undefined {
  if (!canUseDocumentCookie()) {
    return undefined;
  }

  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${TOKEN_COOKIE}=`))
    ?.slice(TOKEN_COOKIE.length + 1);
}

export function clearAuthToken() {
  if (!canUseDocumentCookie()) {
    return;
  }

  document.cookie = `${TOKEN_COOKIE}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax`;
}
