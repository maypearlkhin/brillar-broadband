import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectToDatabase } from "./db.js";
import { authCookieOptions } from "./auth.js";
import { createApiRouter } from "./api/router/index.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()) ?? "http://localhost:3000",
    credentials: true
  })
);

app.use(express.json());

app.use("/api", createApiRouter());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT ?? 4000);

async function start() {
  await connectToDatabase();

  app.listen(port, () => {
    const cookie = authCookieOptions();
    console.log(`Brillar API listening on http://127.0.0.1:${port}`);
    console.log(`Auth cookie: ${cookie.name} (httpOnly)`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
