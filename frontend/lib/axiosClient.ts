import axios, { type AxiosInstance } from "axios";

const baseURL = process.env.NEXT_PUBLIC_URL ?? "http://localhost:4000";

/** Browser axios — sends/receives the auth cookie via `withCredentials`. */
export const axiosClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: "application/json"
  },
  timeout: 600000
});
