import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/authConstants";

export type JwtUser = {
  userId: string;
  email: string;
  role: "customer" | "admin";
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Please define JWT_SECRET in your environment.");
  }

  return secret;
}

export function signJwt(payload: JwtUser) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d"
  });
}

export function verifyJwt(token: string): JwtUser | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtUser;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest) {
  const bearer = request.headers.get("authorization");

  if (bearer?.startsWith("Bearer ")) {
    return bearer.slice("Bearer ".length);
  }

  return request.cookies.get(TOKEN_COOKIE)?.value;
}

export function getCurrentUserFromCookies() {
  const token = cookies().get(TOKEN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyJwt(token);
}

export function authCookieOptions() {
  return {
    name: TOKEN_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  };
}

export { TOKEN_COOKIE };
