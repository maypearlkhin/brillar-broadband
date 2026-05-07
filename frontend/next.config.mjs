/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
  // `/api/*` is proxied at runtime by `app/api/[[...path]]/route.ts` using process.env.BACKEND_URL.
};

export default nextConfig;
