import axios, { type AxiosInstance } from "axios";
import { getAuthToken } from "./authStorage";

const baseURL = process.env.NEXT_PUBLIC_URL ?? "http://localhost:4000";

/** Browser axios — sends `Authorization: Bearer <token>` from the JS cookie. */
export const axiosClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    Accept: "application/json"
  },
  timeout: 600000
});

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
