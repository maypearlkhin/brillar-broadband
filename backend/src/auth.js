import jwt from "jsonwebtoken";
import { TOKEN_COOKIE } from "./constants.js";

function parseCookieHeader(header) {
  const cookies = {};

  if (!header) {
    return cookies;
  }

  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");

    if (eq === -1) {
      continue;
    }

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    cookies[key] = decodeURIComponent(value);
  }

  return cookies;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Please define JWT_SECRET in your environment.");
  }

  return secret;
}

export function signJwt(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d"
  });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const bearer = request.headers.authorization;

  if (bearer?.startsWith("Bearer ")) {
    return bearer.slice("Bearer ".length);
  }

  const cookies = parseCookieHeader(request.headers.cookie);

  return cookies[TOKEN_COOKIE];
}

export { TOKEN_COOKIE };
