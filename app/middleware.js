import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  ROLE_SESSION_COOKIES,
  inferRequiredRole,
  inferRoleFromReferer,
  replaceNextAuthSessionCookies,
} from "@/app/lib/roleSession";

async function getRoleToken(req, role) {
  if (!role || !ROLE_SESSION_COOKIES[role]) return null;
  return getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: ROLE_SESSION_COOKIES[role],
  });
}

async function getDefaultToken(req) {
  return getToken({ req, secret: process.env.NEXTAUTH_SECRET });
}

function withRoleCookie(req, role) {
  const rawRoleToken = req.cookies.get(ROLE_SESSION_COOKIES[role])?.value;
  if (!rawRoleToken) return NextResponse.next();

  const headers = new Headers(req.headers);
  headers.set(
    "cookie",
    replaceNextAuthSessionCookies(req.headers.get("cookie") || "", rawRoleToken)
  );

  return NextResponse.next({ request: { headers } });
}

function unauthorized(req) {
  // Preserve the project's previous behavior: protected requests are sent to login.
  return NextResponse.redirect(new URL("/login", req.url));
}

export default async function middleware(req) {
  const { pathname } = req.nextUrl;
  const referer = req.headers.get("referer");

  // SessionProvider calls this endpoint from the currently open HR/Employee page.
  // Present that page's role-specific token so both tabs keep the correct identity.
  if (pathname === "/api/auth/session") {
    const role = inferRoleFromReferer(referer);
    if (!role) return NextResponse.next();

    const roleToken = await getRoleToken(req, role);
    if (roleToken?.role === role) return withRoleCookie(req, role);
    return NextResponse.next();
  }

  const requiredRole = inferRequiredRole(pathname, referer);

  if (requiredRole) {
    const roleToken = await getRoleToken(req, requiredRole);
    if (roleToken?.role === requiredRole) {
      if (roleToken.mustChangePassword) return NextResponse.redirect(new URL("/auth/change-password", req.url));
      return withRoleCookie(req, requiredRole);
    }

    // Backward-compatible fallback for a session created before this update.
    const defaultToken = await getDefaultToken(req);
    if (defaultToken?.role === requiredRole) {
      if (defaultToken.mustChangePassword) return NextResponse.redirect(new URL("/auth/change-password", req.url));
      return NextResponse.next();
    }

    return unauthorized(req);
  }

  // Shared API called without a browser referrer: retain normal NextAuth behavior.
  const defaultToken = await getDefaultToken(req);
  if (defaultToken) return NextResponse.next();

  return unauthorized(req);
}

export const config = {
  matcher: [
    "/hr/:path*",
    "/employee/:path*",
    "/api/auth/session",
    "/api/employees/:path*",
    "/api/attendance/:path*",
    "/api/me/:path*",
    "/api/leave-requests/:path*",
    "/api/miss-punch-requests/:path*",
    "/api/leave-balance/:path*",
    "/api/my-calendar/:path*",
    "/api/dashboard-summary/:path*",
    "/api/payment-requests/:path*",
    "/api/holidays/:path*",
    "/api/loans/:path*",
    "/api/transactions/:path*",
    "/api/salaries/:path*",
    "/api/payroll/:path*",
    "/api/overtime/:path*",
    "/api/users/:path*",
  ],
};
