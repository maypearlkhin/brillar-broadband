import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/authConstants";

function clearTokenCookie(response: NextResponse) {
  response.cookies.set(TOKEN_COOKIE, "", {
    expires: new Date(0),
    path: "/",
    sameSite: "lax",
  });
}

export async function GET(request: Request) {
  const url = new URL("/", request.url);
  const response = NextResponse.redirect(url);
  clearTokenCookie(response);
  return response;
}

export async function POST(request: Request) {
  const url = new URL("/", request.url);
  const response = NextResponse.redirect(url);
  clearTokenCookie(response);
  return response;
}

