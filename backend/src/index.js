import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectToDatabase } from "./db.js";
import { createApiRouter } from "./api/router/index.js";

const app = express();

/* Auth is now Bearer-token in headers — no cookies cross-origin, so the simplest
   wide-open CORS works in every environment. */
app.use(cors());

app.use(express.json());

app.use("/api", createApiRouter());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT ?? 4000);

async function start() {
  await connectToDatabase();

  app.listen(port, () => {
    console.log(`Brillar API listening on http://127.0.0.1:${port}`);
    console.log("Auth: Bearer token in Authorization header");
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
