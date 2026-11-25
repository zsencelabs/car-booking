import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { api, ApiError } from "@/lib/api/server";
import { ACCESS_COOKIE } from "@/lib/api/tokens";
import type { Me } from "@/lib/api/types";
import { ROLE_INFO, roleFromApi, type Role, type SessionUser } from "./roles";

/** The signed-in user, checked with the API once per request. Null when signed out or the session is no longer valid. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!(await cookies()).get(ACCESS_COOKIE)) return null;
  try {
    const me = await api<Me>("/me");
    const role = roleFromApi(me.role);
    return {
      id: me.id,
      name: me.name,
      email: me.email,
      role,
      label: ROLE_INFO[role].label,
      path: ROLE_INFO[role].path,
      driverId: me.driverId,
      providerId: me.providerId,
    };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    // An expired or revoked session, or the API being unreachable: treat as signed out
    // so public pages still render. Pages that need a user send them to log in.
    if (error.status !== 401 && error.status !== 403) console.error("Session check failed:", error.cause ?? error.message);
    return null;
  }
});

/** Server-side guard for a role's pages. */
export async function requireRole(role: Role, next: string = ROLE_INFO[role].path): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (user.role !== role) redirect(user.path);
  return user;
}
