import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import {
  ROLE_SESSION_COOKIES,
  getMainSessionTokenFromCookieHeader,
} from "@/app/lib/roleSession";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!role || !ROLE_SESSION_COOKIES[role]) {
    return NextResponse.json({ error: "No valid signed-in account found" }, { status: 401 });
  }

  const tokenValue = getMainSessionTokenFromCookieHeader(request.headers.get("cookie") || "");
  if (!tokenValue) {
    return NextResponse.json({ error: "Session cookie was not created" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, role });
  response.cookies.set({
    name: ROLE_SESSION_COOKIES[role],
    value: tokenValue,
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(request.url).protocol === "https:",
    path: "/",
    maxAge: 8 * 60 * 60,
  });

  return response;
}
