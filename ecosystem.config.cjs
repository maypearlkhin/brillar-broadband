/**
 * PM2 process file — run from repository root after `npm run build`:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *
 * Ports: API 4012, Next.js 3013.
 * Backend runs plain Node (`src/index.js`). Set JWT_SECRET (same value on API + frontend), MONGODB_URI, etc.
 */
module.exports = {
  apps: [
    {
      name: "brillar-api",
      cwd: "./backend",
      script: "src/index.js",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "4012"
      }
    },
    {
      name: "brillar-web",
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
        BACKEND_URL: "http://127.0.0.1:4012"
      }
    }
  ]
};
