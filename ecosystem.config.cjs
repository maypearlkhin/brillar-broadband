/**
 * PM2 process file — run from repository root after `npm run build`:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *
 * Ports below: API 4010, Next.js 3013.
 * Frontend `BACKEND_URL` is loaded from `./frontend/.env.production` (or `.env.local`) by Next —
 * only add it here if you prefer PM2-managed env instead of those files.
 * Same for `JWT_SECRET` on the frontend: use env files or set under `env:` as needed.
 * Backend runs plain Node (`src/index.js`). Set MONGODB_URI, JWT_SECRET, etc. for the API.
 */
module.exports = {
  apps: [
    {
      name: "broadband-backend",
      cwd: "./backend",
      script: "src/index.js",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "4010",
      },
    },
    {
      name: "broadband-frontend",
      cwd: "./frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "3013",
      },
    },
  ],
};
