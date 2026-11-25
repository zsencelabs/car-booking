import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, ACCESS_MAX_AGE, clientIpFrom, REFRESH_COOKIE, REFRESH_MAX_AGE, refreshTokens } from "@/lib/api/tokens";

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

/**
 * Keeps the API session alive: when the short-lived access token has expired
 * but a refresh token remains, swap it for a new pair before the page or
 * Server Action runs, and hand the new access token to it in the same request.
 * Role checks happen on the server against the API (lib/auth/session.ts).
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  let signedIn = request.cookies.has(ACCESS_COOKIE);
  let response: NextResponse | null = null;

  if (!signedIn && refresh) {
    const tokens = await refreshTokens(refresh, clientIpFrom(request.headers.get("x-forwarded-for")));
    if (tokens) {
      request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
      request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);
      response = NextResponse.next({ request });
      response.cookies.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(ACCESS_MAX_AGE));
      response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(REFRESH_MAX_AGE));
      signedIn = true;
    } else {
      request.cookies.delete(REFRESH_COOKIE);
      response = NextResponse.next({ request });
      response.cookies.delete(REFRESH_COOKIE);
    }
  }

  if (!signedIn && (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    const redirect = NextResponse.redirect(login);
    if (response) for (const c of response.cookies.getAll()) redirect.cookies.set(c);
    return redirect;
  }

  return response ?? NextResponse.next();
}

export const config = {
  // Every page and Server Action, but not static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
