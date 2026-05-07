import axios, { type AxiosInstance } from "axios";
import { cookies } from "next/headers";

const baseURL = process.env.NEXT_PUBLIC_URL ?? "http://localhost:4000";

/**
 * Server axios — created per-request so it can read cookies from the current request
 * and forward them as the `Cookie` header (Node has no cookie jar).
 */
export function axiosServer(): AxiosInstance {
  const cookieHeader = cookies()
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return axios.create({
    baseURL,
    headers: {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {})
    },
    timeout: 600000
  });
}
