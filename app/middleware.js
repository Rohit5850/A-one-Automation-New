import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // HR-only section
    if (pathname.startsWith("/hr") && role !== "hr") {
      return NextResponse.redirect(new URL("/login?error=forbidden", req.url));
    }

    // Employee-only section
    if (pathname.startsWith("/employee") && role !== "employee") {
      return NextResponse.redirect(new URL("/login?error=forbidden", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Just require *some* valid session; role check happens above
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect these paths (pages AND their API routes)
export const config = {
  matcher: [
    "/hr/:path*",
    "/employee/:path*",
    "/api/employees/:path*",
    "/api/attendance/:path*",
    "/api/me/:path*",
  ],
};
