import axios, { type AxiosInstance } from "axios";
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "./authConstants";

const baseURL = process.env.NEXT_PUBLIC_URL ?? "http://localhost:4000";

/**
 * Server axios — reads the JWT from the request cookie (set by JS at login) and forwards
 * it as `Authorization: Bearer …`. No raw cookie pass-through, so the API host can differ
 * from the Next host without any cross-site cookie issues.
 */
export function axiosServer(): AxiosInstance {
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
