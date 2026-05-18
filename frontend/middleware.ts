import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { TOKEN_COOKIE } from "@/lib/authConstants";

const PROTECTED_PREFIXES = ["/dashboard", "/checkout", "/plans"];

/** Edge middleware inlines env at build time; Docker images need JWT_SECRET during `next build`, not only at `docker run`. */
let warnedMissingJwtSecret = false;

async function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (!warnedMissingJwtSecret) {
      warnedMissingJwtSecret = true;
      console.warn(
        "[middleware] JWT_SECRET is unset — cookies cannot be verified. Set the same secret as the API; for Docker, pass JWT_SECRET when building the Next image (not only at container start).",
      );
    }
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return payload as {
      userId?: string;
      email?: string;
      role?: string;
      name?: string;
    };
  } catch {
    return null;
  }
}

function matchesProtectedRoute(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const currentUser = token ? await verifyToken(token) : null;

  // Signed-in users use dashboards only — no marketing homepage
  if (pathname === "/" && currentUser) {
    const url = request.nextUrl.clone();
    url.pathname =
      currentUser.role === "admin"
        ? "/admin/dashboard"
        : currentUser.role === "isp_team"
          ? "/isp/dashboard"
          : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const needsAuth = PROTECTED_PREFIXES.some((prefix) => matchesProtectedRoute(pathname, prefix));

  if (!needsAuth) {
    return NextResponse.next();
  }

  if (!currentUser) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/checkout/:path*",
    "/plans",
    "/plans/:path*"
  ]
};
