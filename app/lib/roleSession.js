export const ROLE_SESSION_COOKIES = {
  hr: "aone.hr-session-token",
  employee: "aone.employee-session-token",
};

export const NEXTAUTH_SESSION_COOKIES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export function parseCookieHeader(cookieHeader = "") {
  const result = {};
  for (const part of cookieHeader.split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) result[key] = value;
  }
  return result;
}

export function getMainSessionTokenFromCookieHeader(cookieHeader = "") {
  const cookies = parseCookieHeader(cookieHeader);
  for (const name of NEXTAUTH_SESSION_COOKIES) {
    if (cookies[name]) return cookies[name];
  }
  return null;
}

export function inferRoleFromReferer(referer) {
  if (!referer) return null;
  try {
    const pathname = new URL(referer).pathname;
    if (pathname === "/hr" || pathname.startsWith("/hr/")) return "hr";
    if (pathname === "/employee" || pathname.startsWith("/employee/")) return "employee";
  } catch {
    // Ignore malformed/missing referrers and fall back to other auth checks.
  }
  return null;
}

export function inferRequiredRole(pathname, referer) {
  if (pathname === "/hr" || pathname.startsWith("/hr/")) return "hr";
  if (pathname === "/employee" || pathname.startsWith("/employee/")) return "employee";

  // Shared API routes are called by both HR and Employee pages. The page that
  // initiated the same-origin request tells us which already-authenticated role
  // cookie should be presented to the existing API authorization code.
  const refRole = inferRoleFromReferer(referer);
  if (refRole) return refRole;

  // Safe fallbacks for APIs that are role-specific even without a referrer.
  if (
    pathname.startsWith("/api/me") ||
    pathname.startsWith("/api/my-calendar") ||
    pathname.startsWith("/api/leave-balance")
  ) {
    return "employee";
  }

  if (
    pathname.startsWith("/api/dashboard-summary") ||
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/salaries") ||
    pathname.startsWith("/api/employees")
  ) {
    return "hr";
  }

  return null;
}

export function replaceNextAuthSessionCookies(cookieHeader = "", tokenValue) {
  if (!tokenValue) return cookieHeader;

  const parts = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const key = part.split("=", 1)[0]?.trim();
      return !NEXTAUTH_SESSION_COOKIES.includes(key);
    });

  // Set both names so getServerSession works consistently on HTTP development
  // and HTTPS production deployments without changing every API route.
  parts.push(`next-auth.session-token=${tokenValue}`);
  parts.push(`__Secure-next-auth.session-token=${tokenValue}`);

  return parts.join("; ");
}
