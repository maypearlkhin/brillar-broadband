import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { TOKEN_COOKIE } from "@/lib/authConstants";

const PROTECTED_PATHS = ["/dashboard", "/checkout", "/admin", "/plans"];

async function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const currentUser = token ? await verifyToken(token) : null;

  if (currentUser) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/checkout/:path*", "/admin/:path*", "/plans/:path*"]
};
