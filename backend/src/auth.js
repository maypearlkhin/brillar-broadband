import jwt from "jsonwebtoken";
import { TOKEN_COOKIE } from "./constants.js";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Please define JWT_SECRET in your environment.");
  }

  return secret;
}

export function signJwt(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
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
  const authHeader = request.headers.authorization;
  if (!authHeader) return null;

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return authHeader.trim();
}

/** JWT `userId` claim takes precedence; `req.body.userId` is the agent-tool fallback. */
export function resolveRequestUserId(req, currentUser) {
  return currentUser?.userId || req.body?.userId || null;
}

export { TOKEN_COOKIE };
