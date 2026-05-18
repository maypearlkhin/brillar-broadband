import axios, { type AxiosInstance } from "axios";
import { cookies } from "next/headers";
import { env } from "next-runtime-env";
import { TOKEN_COOKIE } from "./authConstants";

/**
 * Server axios — reads the JWT from the request cookie and forwards it as
 * `Authorization: Bearer …`.
 *
 * In Docker, set `BACKEND_URL` to the API service (e.g. `http://backend:4000`); inside the
 * frontend container, `NEXT_PUBLIC_URL` pointing at `localhost:4000` targets the wrong host.
 *
 * Uses `env()` from next-runtime-env: on the server any key is allowed; in the browser only
 * `NEXT_PUBLIC_*` works. Calls are inside this factory so `unstable_noStore()` runs per request.
 */
export function axiosServer(): AxiosInstance {
  const baseURL =
    env("BACKEND_URL") || env("NEXT_PUBLIC_URL") || "http://localhost:4000";

  const rawToken = cookies().get(TOKEN_COOKIE)?.value;
  const token = rawToken ? decodeURIComponent(rawToken) : undefined;

  return axios.create({
    baseURL,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    timeout: 600000
  });
}
