import Cookies from "js-cookie";
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

export function setAuthToken(token: string) {
  Cookies.set(TOKEN_COOKIE, token, {
    expires: SEVEN_DAYS_IN_DAYS,
    sameSite: "lax",
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
    path: "/"
  });
}

export function getAuthToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE);
}

export function clearAuthToken() {
  Cookies.remove(TOKEN_COOKIE, { path: "/" });
}
