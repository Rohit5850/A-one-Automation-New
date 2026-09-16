"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function SiteChrome({ children }) {
  const pathname = usePathname();

  const isAttendanceApp =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname === "/hr" ||
    pathname.startsWith("/hr/") ||
    pathname === "/employee" ||
    pathname.startsWith("/employee/");

  if (isAttendanceApp) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}