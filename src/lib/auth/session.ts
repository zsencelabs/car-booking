import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRole, ROLE_INFO, SESSION_COOKIE, userForRole, type Role, type SessionUser } from "./roles";

export async function getSessionUser(): Promise<SessionUser | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return isRole(value) ? userForRole(value) : null;
}

/** Server-side guard for a role's pages. */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(ROLE_INFO[role].path)}`);
  if (user.role !== role) redirect(user.path);
  return user;
}
