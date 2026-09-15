import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  ROLE_SESSION_COOKIES,
  NEXTAUTH_SESSION_COOKIES,
} from "@/app/lib/roleSession";

function expireCookie(response, name, secure) {
  response.cookies.set({
    name,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: name.startsWith("__Secure-") || secure,
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    // Empty/invalid body is handled below.
  }

  const role = body?.role;
  if (!ROLE_SESSION_COOKIES[role]) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // This endpoint is intentionally outside the role-rewriting middleware, so
  // getToken sees the browser's normal NextAuth cookie (the most recent login).
  const mainToken = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const response = NextResponse.json({ ok: true });
  const secure = new URL(request.url).protocol === "https:";

  // Sign out only the requested role. The other role remains logged in.
  expireCookie(response, ROLE_SESSION_COOKIES[role], secure);

  // If the normal NextAuth cookie currently belongs to the same role, clear it
  // too; otherwise leave it untouched so the other account keeps working.
  if (mainToken?.role === role) {
    for (const name of NEXTAUTH_SESSION_COOKIES) {
      expireCookie(response, name, secure);
    }
  }

  return response;
}
