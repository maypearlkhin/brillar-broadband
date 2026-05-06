# Brillar Broadband

Phase 1–2 MVP for an ISP-style customer portal: storefront, auth, mock checkout, customer dashboard, Node API, and admin tools (plans CMS, network incidents, announcements).

## Features

- **Frontend:** Next.js App Router, TypeScript, MUI v5
- **Backend:** Express (plain Node.js / JavaScript), JWT auth, MongoDB/Mongoose
- **Auth:** httpOnly cookie + middleware protection
- **Seeded data:** admin user, broadband plans, SG/MY service zones

---

## Prerequisites

- **Node.js** (LTS recommended)
- **MongoDB** running locally or a connection string to a remote instance

---

## Environment variables

Use the committed templates; **do not commit real `.env` files**.

| Template | Copy to | Purpose |
|----------|---------|---------|
| `backend/.env.example` | `backend/.env` | API: `PORT`, `MONGODB_URI`, `JWT_SECRET`, optional `CORS_ORIGIN` |
| `frontend/.env.example` | `frontend/.env.local` | Next: `PORT`, `BACKEND_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL` |
| `.env.example` (repo root) | — | Combined reference only |

**Important:** `JWT_SECRET` must be **exactly the same** in `backend/.env` and `frontend/.env.local`.

---

## Run locally (development)

Default ports: **frontend `3000`**, **backend `4000`**.

1. Install dependencies (from repo root):

   ```bash
   npm install
   ```

2. Create env files from the examples and set `MONGODB_URI` / `JWT_SECRET` (and adjust anything else you need):

   ```bash
   # Examples — adjust paths for Windows if needed
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

3. For local dev, `frontend/.env.local` should point at the API on port **4000**:

   ```env
   BACKEND_URL=http://127.0.0.1:4000
   ```

4. Start **both** apps with one command:

   ```bash
   npm run dev
   ```

   - **Web:** http://localhost:3000
   - **API:** http://127.0.0.1:4000 (health: http://127.0.0.1:4000/health)

   Alternatively, run workspaces separately: `npm run dev -w backend` and `npm run dev -w frontend`.

---

## Run on a server with PM2 (production)

Ports and the frontend’s **`BACKEND_URL`** (for Next.js `/api/*` rewrites) are **defined in `ecosystem.config.cjs`**. Edit that file if you need different ports on the host; keep **`BACKEND_URL`** aligned with wherever the API listens (scheme, host, port).

The committed ecosystem file uses **API `4012`** and **web `3013`**, with `BACKEND_URL=http://127.0.0.1:4012` for the web process.

1. Build both workspaces from the repo root:

   ```bash
   npm install
   npm run build
   ```

2. Set secrets for production (same `JWT_SECRET` on API and web). Typical options:

   - Export variables in the shell before `pm2 start`, or
   - Add `JWT_SECRET`, `MONGODB_URI`, etc. to each app’s `env` block in `ecosystem.config.cjs`.

3. Start processes:

   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   ```

4. Useful commands:

   ```bash
   pm2 status
   pm2 logs
   pm2 restart brillar-api brillar-web
   ```

If you change ports in `ecosystem.config.cjs`, update **`BACKEND_URL`** for `brillar-web` in the same file so it still targets the API.

---

## Default admin (seeded)

| Field | Value |
|-------|--------|
| Email | `admin@brillar.com` |
| Password | `password123` |

---

## Scripts (repo root)

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev: backend + frontend concurrently |
| `npm run build` | Validates backend JS (`node --check`) and builds the frontend (`next build`) |
| `npm run start` | Run built backend + `next start` (ports from each app’s env unless overridden) |
| `npm run lint` | Lint the frontend |
