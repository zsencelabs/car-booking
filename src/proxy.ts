import { NextResponse, type NextRequest } from "next/server";
import { canAccess, isRole, ROLE_INFO, SESSION_COOKIE } from "@/lib/auth/roles";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const value = request.cookies.get(SESSION_COOKIE)?.value;
  const role = isRole(value) ? value : null;
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!role) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(login);
    }
    if (pathname === "/dashboard" || !canAccess(role, pathname)) return to(ROLE_INFO[role].path);
    return NextResponse.next();
  }

  // Login and registration are only for signed-out visitors.
  return role ? to(ROLE_INFO[role].path) : NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login", "/register", "/forgot-password", "/drivers/register", "/providers/register"],
};
