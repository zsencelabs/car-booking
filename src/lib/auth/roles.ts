import type { ApiRole } from "@/lib/api/types";

export const ROLES = ["customer", "driver", "provider", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_INFO: Record<Role, { label: string; path: string }> = {
  customer: { label: "Customer", path: "/dashboard/customer" },
  driver: { label: "Driver", path: "/dashboard/driver" },
  provider: { label: "Car provider", path: "/dashboard/provider" },
  admin: { label: "Admin", path: "/dashboard/admin" },
};

export const roleFromApi = (role: ApiRole): Role => role.toLowerCase() as Role;

/** What the UI knows about the signed-in user. */
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  label: string;
  path: string;
  driverId: string | null;
  providerId: string | null;
};

/** Whether a role may open a path. Non-dashboard paths are public. */
export function canAccess(role: Role, path: string) {
  const pathname = path.split(/[?#]/)[0];
  if (pathname !== "/dashboard" && !pathname.startsWith("/dashboard/")) return true;
  const own = ROLE_INFO[role].path;
  return pathname === "/dashboard" || pathname === own || pathname.startsWith(`${own}/`);
}

/** Keeps a post-login redirect on this site. Returns null for anything external. */
export function safeReturnPath(next?: string | null) {
  if (!next || !next.startsWith("/")) return null;
  const base = "https://dropoff.invalid";
  try {
    const url = new URL(next, base);
    return url.origin === base ? `${url.pathname}${url.search}` : null;
  } catch {
    return null;
  }
}
