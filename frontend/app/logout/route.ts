import { NextResponse } from "next/server";
import { env } from "next-runtime-env";
import { TOKEN_COOKIE } from "@/lib/authConstants";

function clearTokenCookie(response: NextResponse) {
  response.cookies.set(TOKEN_COOKIE, "", {
    expires: new Date(0),
    path: "/",
    sameSite: "lax",
  });
}

export async function GET(request: Request) {
  const appUrl = env("NEXT_PUBLIC_APP_URL") || request.url;
  const url = new URL("/", appUrl);
  const response = NextResponse.redirect(url);
  clearTokenCookie(response);
  return response;
}

export async function POST(request: Request) {
  const appUrl = env("NEXT_PUBLIC_APP_URL") || request.url;
  const url = new URL("/", appUrl);
  const response = NextResponse.redirect(url);
  clearTokenCookie(response);
  return response;
}
