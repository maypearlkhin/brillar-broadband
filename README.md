# Brillar Broadband

Phase 1 MVP foundation for an Internet Service Provider customer portal.

## Features

- Next.js App Router with TypeScript
- MongoDB via Mongoose
- MUI v5 responsive UI
- JWT auth with cookie-based route protection
- Seeded admin account and broadband plans
- Register, login, mock checkout, and protected dashboard
- Admin dashboard for approving or rejecting customer purchase requests

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `MONGODB_URI` and `JWT_SECRET`.
3. Install dependencies with `npm install`.
4. Run the app with `npm run dev`.

Default admin:

- Email: `admin@brillar.com`
- Password: `password123`
